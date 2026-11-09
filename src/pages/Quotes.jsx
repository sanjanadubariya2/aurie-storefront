import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import AddressForm from '../components/checkout/AddressForm.jsx'
import OrderPlaced from '../components/checkout/OrderPlaced.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout.js'
import { fetchQuotes, fetchQuote, payQuote } from '../api/quotes.js'
import { LIVE } from '../api/client.js'
import { validateAddress } from '../lib/validate.js'
import { read, write } from '../lib/storage.js'
import { rupees, shortDate, longDate } from '../lib/format.js'

export const QUOTE_STATUS = {
  new: { label: 'With us', tone: 'bg-glow/30 text-[#8A5A12]', body: 'We are working out a price — usually within a working day.' },
  quoted: { label: 'Ready to pay', tone: 'bg-ember/12 text-ember', body: 'Your price is ready. Pay to start pouring.' },
  paid: { label: 'Paid', tone: 'bg-sea/15 text-sea', body: 'Paid — it is now an order you can track.' },
  declined: { label: 'Not possible', tone: 'bg-soot/10 text-smoke', body: 'We could not take this one on.' },
  expired: { label: 'Expired', tone: 'bg-soot/10 text-smoke', body: 'The price lapsed. Message us and we will refresh it.' },
}

function SignInFirst({ title }) {
  const { setAuthOpen } = useAuth()
  return (
    <div className="mx-auto max-w-[900px] px-5">
      <EmptyState level={1} title={title} body="Requests are tied to the email you sent them from." action={<Button onClick={() => setAuthOpen(true)}>Sign in</Button>} />
    </div>
  )
}

export function QuoteList() {
  const { customer } = useAuth()
  const [quotes, setQuotes] = useState(null)
  const [error, setError] = useState('')
  useDocumentMeta({ title: 'Your Custom Requests', description: 'Your custom candle requests and their prices.', path: '/quotes', noindex: true })

  useEffect(() => {
    if (!customer) return
    fetchQuotes()
      .then(setQuotes)
      .catch((e) => setError(e.message))
  }, [customer])

  if (!customer) return <SignInFirst title="Sign in to see your requests" />

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-24 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 py-10">
        <div>
          <h1 className="font-display text-[34px] leading-tight text-soot sm:text-[42px]">Custom requests</h1>
          <p className="mt-2 text-[15px] text-smoke">Secret Glow messages, hampers and anything made to your brief.</p>
        </div>
        <Button as={Link} to="/quote" variant="outline">
          New request
        </Button>
      </header>

      {error ? (
        <EmptyState title="Could not load your requests" body={error} />
      ) : quotes === null ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-card" />
          <Skeleton className="h-24 w-full rounded-card" />
        </div>
      ) : quotes.length === 0 ? (
        <EmptyState
          title="No requests yet"
          body="Want a hidden message, a hamper or a candle made from your photo? Describe it and we will price it."
          action={
            <Button as={Link} to="/quote">
              Request a custom candle
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {quotes.map((q) => {
            const s = QUOTE_STATUS[q.status] || QUOTE_STATUS.new
            return (
              <li key={q.id}>
                <Link to={`/quotes/${q.id}`} className="flex items-center gap-4 rounded-card border border-wick bg-wax p-4 transition-colors hover:border-smoke sm:p-5">
                  {q.images?.[0] ? (
                    <img src={q.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-ash font-display text-[13px] text-smoke">{q.number}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-[17px] text-soot">{q.productName || q.occasion || 'Custom request'}</p>
                    <p className="mt-0.5 text-[13px] text-smoke">
                      {q.number} · {shortDate(q.createdAt)}
                      {q.price ? ` · ${rupees(q.price)}` : ''}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium ${s.tone}`}>{s.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

const blankAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', notes: '' }

export function QuoteDetail() {
  const { id } = useParams()
  const { customer } = useAuth()
  const { toast } = useToast()
  const pay = useRazorpayCheckout()
  const [quote, setQuote] = useState(null)
  const [error, setError] = useState('')
  const [address, setAddress] = useState(() => ({ ...blankAddress, ...read('aurie.address', {}) }))
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [order, setOrder] = useState(null)
  useDocumentMeta({
    title: quote ? `Request ${quote.number}` : 'Your Request',
    description: 'Details and price for your custom Aurie candle request.',
    path: `/quotes/${id}`,
    noindex: true,
  })

  useEffect(() => {
    if (!customer) return
    fetchQuote(id)
      .then(setQuote)
      .catch((e) => setError(e.status === 404 ? 'We could not find that request on this account.' : e.message))
  }, [customer, id])

  if (!customer) return <SignInFirst title="Sign in to see this request" />
  if (order) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <OrderPlaced order={order} />
      </div>
    )
  }
  if (error) {
    return (
      <div className="mx-auto max-w-[900px] px-5">
        <EmptyState level={1} title="Request not found" body={error} action={<Button as={Link} to="/quotes">All requests</Button>} />
      </div>
    )
  }
  if (!quote) {
    return (
      <div className="mx-auto max-w-[900px] space-y-4 px-5 py-10">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
    )
  }

  const s = QUOTE_STATUS[quote.status] || QUOTE_STATUS.new

  const startPayment = async () => {
    const found = validateAddress(address)
    setErrors(found)
    if (Object.keys(found).length) return toast('Check the delivery details', 'error')
    if (!LIVE) return toast('Online payment needs the real API (demo mode).', 'error')
    write('aurie.address', address)
    setPaying(true)
    try {
      const paid = await pay({
        create: () => payQuote(quote.id, { address }),
        description: `Custom request ${quote.number}`,
        prefill: { name: address.fullName, email: customer.email, contact: address.phone },
      })
      setOrder(paid)
    } catch (e) {
      toast(e.dismissed ? 'Payment cancelled — your quote is still open.' : e.message, e.dismissed ? 'info' : 'error')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-24 lg:px-8">
      <header className="py-8 sm:py-10">
        <Link to="/quotes" className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot">
          All requests
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-[32px] leading-tight text-soot sm:text-[40px]">{quote.productName || 'Custom request'}</h1>
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${s.tone}`}>{s.label}</span>
        </div>
        <p className="mt-2 text-[15px] text-smoke">
          {quote.number} · sent {longDate(quote.createdAt)} · {s.body}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div>
          {quote.status === 'quoted' && (
            <section className="rounded-card border border-ember/30 bg-wax p-6">
              <p className="label">Your price</p>
              <p className="mt-1 font-display text-[40px] leading-none tabular-nums text-soot">{rupees(quote.price)}</p>
              <p className="mt-2 text-[13px] text-smoke">Delivery included · valid until {longDate(quote.validUntil)}</p>
              {quote.adminNote && <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{quote.adminNote}</p>}

              <h2 className="mt-8 font-display text-[20px] text-soot">Where should it go?</h2>
              <div className="mt-4">
                <AddressForm value={address} errors={errors} onChange={setAddress} />
              </div>
              <Button size="lg" className="mt-6" onClick={startPayment} loading={paying}>
                Pay {rupees(quote.price)} by UPI
              </Button>
              <p className="mt-3 text-[12px] text-smoke">Custom work is paid up front. Pouring starts once payment is confirmed.</p>
            </section>
          )}

          {quote.status === 'declined' && quote.declineReason && (
            <section className="rounded-card bg-wax p-6">
              <p className="label">From us</p>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{quote.declineReason}</p>
            </section>
          )}

          {quote.status === 'paid' && (
            <section className="rounded-card bg-wax p-6">
              <p className="text-[15px] text-ink">This request is paid and is now an order.</p>
              <Button as={Link} to="/orders" className="mt-4">
                Track it
              </Button>
            </section>
          )}

          {quote.status === 'new' && (
            <section className="rounded-card bg-wax p-6 text-[15px] text-ink">
              We will email {customer.email} when the price is ready. Nothing to do until then.
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <dl className="divide-y divide-wick rounded-card border border-wick bg-wax text-[14px]">
            {[
              ['Occasion', quote.occasion],
              ['Needed by', quote.neededBy && longDate(quote.neededBy)],
              ['Budget', quote.budget],
              ['Hidden message', quote.message && `“${quote.message}”`],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-3">
                  <dt className="text-smoke">{k}</dt>
                  <dd className="text-right text-ink">{v}</dd>
                </div>
              ))}
            <div className="px-5 py-3">
              <dt className="text-smoke">Your brief</dt>
              <dd className="mt-1 whitespace-pre-wrap text-ink">{quote.details}</dd>
            </div>
          </dl>
          {quote.images?.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {quote.images.map((src) => (
                <li key={src}>
                  <a href={src} target="_blank" rel="noreferrer">
                    <img src={src} alt="Your reference" className="aspect-square w-full rounded-xl object-cover" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  )
}
