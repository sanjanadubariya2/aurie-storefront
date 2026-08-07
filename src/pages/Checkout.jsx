import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Stepper from '../components/ui/Stepper.jsx'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import AddressForm from '../components/checkout/AddressForm.jsx'
import PhoneVerify from '../components/checkout/PhoneVerify.jsx'
import PaymentPicker from '../components/checkout/PaymentPicker.jsx'
import OrderSummary from '../components/checkout/OrderSummary.jsx'
import OrderPlaced from '../components/checkout/OrderPlaced.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { placeOrder } from '../api/orders.js'
import { validateAddress } from '../lib/validate.js'
import { read, write } from '../lib/storage.js'

const STEPS = ['Delivery', 'Verify number', 'Payment']
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
  const { lines, subtotal, shipping, total, empty } = useCart()
  const { customer, setAuthOpen } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [address, setAddress] = useState(() => ({ ...blank, ...read(ADDRESS_KEY, {}) }))
  const [errors, setErrors] = useState({})
  const [payment, setPayment] = useState('upi')
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [step])

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
    setErrors(found)
    if (Object.keys(found).length) {
      toast('Check the highlighted fields', 'error')
      return
    }
    write(ADDRESS_KEY, address)
    setStep(1)
  }

  const submit = async () => {
    setPlacing(true)
    try {
      // With a live backend and UPI selected, this is where you create the
      // Razorpay order and open its checkout before marking the order paid.
      const created = await placeOrder({ items: lines, address, payment, total })
      empty()
      setOrder(created)
    } catch (e) {
      toast(e.message, 'error')
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
              <div className="mt-6">
                <AddressForm value={address} errors={errors} onChange={setAddress} />
              </div>
              <Button onClick={continueToVerify} size="lg" className="mt-8">
                Continue
              </Button>
            </>
          )}

          {step === 1 && (
            <PhoneVerify phone={address.phone} onVerified={() => setStep(2)} onBack={() => setStep(0)} />
          )}

          {step === 2 && (
            <>
              <PaymentPicker value={payment} onChange={setPayment} total={total} />
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

        <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} total={total} />
      </div>
    </div>
  )
}
