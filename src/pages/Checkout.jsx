import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Stepper from '../components/ui/Stepper.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AddressForm from '../components/checkout/AddressForm.jsx'
import PaymentPicker from '../components/checkout/PaymentPicker.jsx'
import OrderSummary from '../components/checkout/OrderSummary.jsx'
import OrderPlaced from '../components/checkout/OrderPlaced.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { placeOrder } from '../api/orders.js'
import { useShop } from '../context/ShopContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { createRazorpayOrder } from '../api/payments.js'
import { LIVE } from '../api/client.js'
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout.js'
import GiftOptions from '../components/checkout/GiftOptions.jsx'
import CouponField from '../components/checkout/CouponField.jsx'
import { fetchAccount, saveAddresses } from '../api/account.js'
import { validateAddress } from '../lib/validate.js'
import { read, write } from '../lib/storage.js'

// Phone verification is off for now: without an SMS/WhatsApp provider the
// code could only be emailed, which proves nothing about the phone number.
// PhoneVerify.jsx and the /auth/phone routes are kept for when one is set up.
const STEPS = ['Delivery', 'Payment']
const ADDRESS_KEY = 'aurie.address'

const blank = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  pincode: '',
  notes: '',
}

export default function Checkout() {
  const { lines, subtotal, shipping, total, empty, reconcile } = useCart()
  const { customer, setAuthOpen } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const payByUpi = useRazorpayCheckout()
  const { products, settings } = useShop()
  useDocumentMeta({ title: 'Checkout', path: '/checkout' })

  const [step, setStep] = useState(0)
  const [address, setAddress] = useState(() => ({ ...blank, ...read(ADDRESS_KEY, {}) }))
  const [errors, setErrors] = useState({})
  const [payment, setPayment] = useState('upi')
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState(null)
  // Gift options and the occasion date — both optional.
  const [gift, setGift] = useState({ wrap: false, note: '', hidePrices: false })
  const [neededBy, setNeededBy] = useState('')
  const giftWrapFee = gift.wrap ? settings.giftWrapFee || 0 : 0
  const [coupon, setCoupon] = useState(null) // { code, discount, description } — verified by the API
  const discount = coupon?.discount || 0
  const grandTotal = total - discount + giftWrapFee

  // Saved addresses from the account, offered as one-tap choices.
  const [saved, setSaved] = useState([])
  useEffect(() => {
    if (!customer || !LIVE) return
    fetchAccount()
      .then(({ addresses }) => {
        setSaved(addresses || [])
        const def = (addresses || []).find((a) => a.isDefault)
        if (def && !read(ADDRESS_KEY, null)) setAddress({ ...blank, ...def })
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer])

  // After a successful order, remember a new address on the account (max 5).
  const rememberAddress = () => {
    if (!LIVE || saved.length >= 5) return
    const same = (a) => a.line1.trim().toLowerCase() === address.line1.trim().toLowerCase() && a.pincode === address.pincode
    if (saved.some(same)) return
    saveAddresses([...saved, { ...address, isDefault: saved.length === 0 }]).catch(() => {})
  }
  const giftPayload = gift.wrap || gift.note.trim() || gift.hidePrices ? { ...gift, note: gift.note.trim() } : undefined

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

  // The cart lives in localStorage and can be days old. Re-check it against
  // the live catalogue so prices shown here match what the server will charge,
  // and anything since hidden or removed is taken out with a clear message.
  const reconciled = useRef(false)
  useEffect(() => {
    if (!products || reconciled.current) return
    reconciled.current = true
    const { removed, repriced } = reconcile(products)
    if (removed.length) toast(`Removed from your cart (no longer available): ${removed.join(', ')}`, 'error')
    else if (repriced.length) toast(`Prices updated for: ${repriced.join(', ')}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  if (!customer) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <EmptyState
          title="Sign in to check out"
          body="We need a verified email so we can send your order confirmation and tracking updates."
          action={<Button onClick={() => setAuthOpen(true)}>Sign in</Button>}
        />
      </div>
    )
  }

  if (order) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <OrderPlaced order={order} />
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <EmptyState
          title="Your cart is empty"
          body="Add something to it and the checkout will open up."
          action={
            <Button as={Link} to="/shop">
              Go to the catalogue
            </Button>
          }
        />
      </div>
    )
  }

  const continueToVerify = () => {
    const found = validateAddress(address)
    const earliest = new Date(Date.now() + settings.leadTimeDays * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    if (neededBy && neededBy < earliest) found.neededBy = `That is too soon — allow at least ${settings.leadTimeDays} days`
    setErrors(found)
    if (Object.keys(found).length) {
      toast('Check the highlighted fields', 'error')
      return
    }
    write(ADDRESS_KEY, address)
    setStep(1)
  }

  // Creates the Aurie order, opens Razorpay, then verifies server-side. The
  // cart is only cleared once /payments/verify confirms — clearing earlier
  // would lose it for anyone who backs out of the payment sheet.
  const payWithRazorpay = async () => {
    const verified = await payByUpi({
      create: () => createRazorpayOrder({ items: lines, address, gift: giftPayload, neededBy: neededBy || undefined, couponCode: coupon?.code }),
      prefill: { name: address.fullName, email: customer.email, contact: address.phone },
    })
    rememberAddress()
    empty()
    setOrder(verified)
  }

  const submit = async () => {
    setPlacing(true)
    try {
      if (payment === 'upi' && LIVE) {
        await payWithRazorpay()
      } else {
        // Cash on delivery — and UPI in demo mode, which has no real gateway
        // to open — unchanged: one call, order placed immediately.
        const created = await placeOrder({ items: lines, address, payment, total: grandTotal, gift: giftPayload, neededBy: neededBy || undefined, couponCode: coupon?.code })
        rememberAddress()
        empty()
        setOrder(created)
      }
    } catch (e) {
      // A closed widget is the customer changing their mind, not a failure —
      // the order already exists server-side as pending, so they can just
      // try again or switch to cash on delivery. A real failure gets the
      // same "you're still on this step" behavior plus a sharper toast.
      toast(
        e.dismissed ? 'Payment cancelled. You can try again, or switch to cash on delivery below.' : e.message,
        e.dismissed ? 'info' : 'error',
      )
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 lg:px-8">
      <header className="py-8 sm:py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-[13px] text-smoke underline underline-offset-4 hover:text-soot"
        >
          Back
        </button>
        <h1 className="font-display text-[34px] leading-tight text-soot sm:text-[42px]">Checkout</h1>
      </header>

      <div className="max-w-2xl">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          {step === 0 && (
            <>
              <h2 className="font-display text-[24px] leading-tight text-soot">Where should it go?</h2>
              <p className="mt-1.5 text-[15px] text-smoke">
                Signed in as <span className="text-ink">{customer.email}</span>
              </p>
              {saved.length > 0 && (
                <div className="mt-5">
                  <span className="label mb-2 block">Saved addresses</span>
                  <div className="flex flex-wrap gap-2">
                    {saved.map((a, i) => {
                      const chosen = a.line1 === address.line1 && a.pincode === address.pincode
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAddress({ ...blank, ...a })}
                          className={`rounded-2xl border px-3.5 py-2 text-left text-[13px] transition-colors ${chosen ? 'border-soot bg-soot text-wax' : 'border-wick bg-wax text-ink hover:border-smoke'}`}
                        >
                          <span className="block font-medium">{a.fullName}</span>
                          <span className={chosen ? 'text-wax/70' : 'text-smoke'}>
                            {a.line1}, {a.city} {a.pincode}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="mt-6">
                <AddressForm value={address} errors={errors} onChange={setAddress} />
              </div>
              <GiftOptions gift={gift} onGift={setGift} neededBy={neededBy} onNeededBy={setNeededBy} error={errors.neededBy} />
              <Button onClick={continueToVerify} size="lg" className="mt-8">
                Continue
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="mb-8 max-w-lg">
                <CouponField lines={lines} applied={coupon} onApply={setCoupon} />
              </div>
              <PaymentPicker value={payment} onChange={setPayment} total={grandTotal} />
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button onClick={submit} loading={placing} size="lg">
                  {payment === 'upi' ? 'Pay and place order' : 'Place order'}
                </Button>
                <button
                  onClick={() => setStep(0)}
                  className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot"
                >
                  Edit delivery details
                </button>
              </div>
            </>
          )}
        </div>

        <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} giftWrapFee={giftWrapFee} discount={discount} couponCode={coupon?.code} total={grandTotal} neededBy={neededBy} />
      </div>
    </div>
  )
}
