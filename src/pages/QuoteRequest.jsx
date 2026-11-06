import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import Field, { Input, Textarea } from '../components/ui/Field.jsx'
import Flame from '../components/ui/Flame.jsx'
import SecretMessageField from '../components/quote/SecretMessageField.jsx'
import PhotoMatch from '../components/quote/PhotoMatch.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { createQuote } from '../api/quotes.js'
import { whatsappLink } from '../content/business.js'
import { longDate } from '../lib/format.js'

const OCCASIONS = ['Birthday', 'Proposal', 'Anniversary', 'Wedding favours', 'Baby reveal', 'Diwali / festive', 'Corporate gifting', 'Just because']
const BUDGETS = ['Under ₹1,000', '₹1,000–2,000', '₹2,000–5,000', '₹5,000+', 'Not sure yet']
const MAX_MB = 5

/** Earliest selectable "needed by" date, as YYYY-MM-DD in India time. */
const minDate = (days) => new Date(Date.now() + days * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

export default function QuoteRequest() {
  const [params] = useSearchParams()
  const { products, settings, productById } = useShop()
  const { customer, requireAuth } = useAuth()
  const { toast } = useToast()
  useDocumentMeta({
    title: 'Request a custom candle',
    description: 'Secret Glow messages, hampers and candles made from your reference photo. Tell us what you want and we reply with a price.',
    path: '/quote',
  })

  const quoteProducts = useMemo(() => (products || []).filter((p) => p.quote), [products])
  const [form, setForm] = useState({
    productId: params.get('product') || '',
    occasion: '',
    budget: '',
    neededBy: '',
    message: '',
    details: '',
  })
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(null)

  useEffect(() => {
    const p = params.get('product')
    if (p) setForm((f) => ({ ...f, productId: p }))
  }, [params])

  const product = form.productId ? productById(form.productId) : null
  const isSecret = !product || product.collection === 'secret'
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const maxImages = settings.maxQuoteImages || 3

  const addFiles = (list) => {
    const picked = [...list].filter((f) => {
      if (!f.type.startsWith('image/')) return toast(`${f.name} is not an image`, 'error'), false
      if (f.size > MAX_MB * 1024 * 1024) return toast(`${f.name} is over ${MAX_MB}MB`, 'error'), false
      return true
    })
    setFiles((cur) => [...cur, ...picked].slice(0, maxImages))
  }

  const validate = () => {
    const e = {}
    if (form.details.trim().length < 10) e.details = 'Tell us a little more — at least a sentence about what you would like'
    if (form.neededBy && form.neededBy < minDate(settings.leadTimeDays)) e.neededBy = `Custom pieces need at least ${settings.leadTimeDays} days`
    setErrors(e)
    return !Object.keys(e).length
  }

  const send = () =>
    requireAuth(async () => {
      setBusy(true)
      try {
        const quote = await createQuote(form, files)
        setSent(quote)
        window.scrollTo({ top: 0 })
      } catch (e) {
        toast(e.message, 'error')
      } finally {
        setBusy(false)
      }
    })

  const submit = () => {
    if (!validate()) return toast('Check the highlighted fields', 'error')
    send()
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center">
        <Flame className="mx-auto h-12 w-7 animate-flicker text-ember" />
        <h1 className="mt-6 font-display text-[34px] leading-tight text-soot">Request {sent.number} is with us</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-smoke">
          A person reads every request. We will email {customer?.email} with a price — usually within a working day —
          and you can pay online from there.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to={`/quotes/${sent.id}`}>
            View your request
          </Button>
          <Button as={Link} to="/shop" variant="outline">
            Keep browsing
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-24 lg:px-8">
      <header className="grid gap-8 py-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="label">Made to your brief</p>
          <h1 className="mt-2 font-display text-[38px] leading-[1.05] text-soot sm:text-[50px]">Tell us what to pour</h1>
          <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-smoke">
            A hidden message, a hamper for 40 guests, or a candle that looks like the cake in your photo. Describe it,
            and we reply with a price you can pay online.
          </p>
        </div>
        <ol className="grid grid-cols-3 gap-3 text-[13px] text-smoke">
          {['You describe it', 'We price it', 'You pay, we pour'].map((s, i) => (
            <li key={s} className="rounded-2xl bg-wax p-3.5">
              <span className="font-display text-[15px] tabular-nums text-ember">0{i + 1}</span>
              <span className="mt-1 block text-ink">{s}</span>
            </li>
          ))}
        </ol>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-7">
          <Field label="What would you like?" id="productId">
            <select
              id="productId"
              value={form.productId}
              onChange={set('productId')}
              className="h-11 w-full rounded-xl border border-wick bg-wax px-3 text-[15px] text-ink focus:outline-none focus-visible:border-ember"
            >
              <option value="">Something else — I will describe it</option>
              {quoteProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <div>
            <span className="label mb-2 block">Occasion</span>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((o) => (
                <Chip key={o} active={form.occasion === o} onClick={() => setForm((f) => ({ ...f, occasion: f.occasion === o ? '' : o }))}>
                  {o}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Needed by"
              id="neededBy"
              error={errors.neededBy}
              hint={`Earliest ${longDate(minDate(settings.leadTimeDays))}`}
            >
              <Input id="neededBy" type="date" min={minDate(settings.leadTimeDays)} value={form.neededBy} invalid={errors.neededBy} onChange={set('neededBy')} />
            </Field>
            <Field label="Budget" id="budget">
              <select
                id="budget"
                value={form.budget}
                onChange={set('budget')}
                className="h-11 w-full rounded-xl border border-wick bg-wax px-3 text-[15px] text-ink focus:outline-none focus-visible:border-ember"
              >
                <option value="">Choose a range</option>
                {BUDGETS.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>
          </div>

          {isSecret && (
            <div className="rounded-card border border-wick bg-wax/60 p-5">
              <SecretMessageField value={form.message} onChange={(message) => setForm((f) => ({ ...f, message }))} occasion={form.occasion} />
            </div>
          )}

          <PhotoMatch
            onPhoto={(file) => setFiles((cur) => (cur.length < maxImages ? [...cur, file] : cur))}
            onBrief={(brief) => setForm((f) => ({ ...f, details: f.details ? `${f.details}\n\n${brief}` : brief }))}
          />

          <Field label="Describe it" id="details" error={errors.details} hint="Colours, scent, quantity, packaging, anything you have in mind">
            <Textarea
              id="details"
              rows={5}
              maxLength={2000}
              value={form.details}
              onChange={set('details')}
              placeholder="e.g. 40 small jars for a baby shower, pastel pink and white, names on the lids, delivered to Pune"
            />
          </Field>

          <div>
            <span className="label mb-2 block">Reference photos (up to {maxImages})</span>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                addFiles(e.dataTransfer.files)
              }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-wick bg-wax/60 px-5 py-8 text-center transition-colors hover:border-smoke ${
                files.length >= maxImages ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
              <span className="text-[14px] text-soot">Drop photos here or tap to choose</span>
              <span className="mt-1 text-[12px] text-smoke">A cake, a flower, a Pinterest pin — JPG or PNG under {MAX_MB}MB</span>
            </label>
            {files.length > 0 && (
              <ul className="mt-3 flex gap-3">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="relative">
                    <img src={URL.createObjectURL(f)} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((cur) => cur.filter((_, j) => j !== i))}
                      className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-soot text-[12px] text-wax"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={submit} loading={busy}>
              {customer ? 'Send request' : 'Sign in and send'}
            </Button>
            <a href={whatsappLink('Hi Aurie, I would like something custom.')} target="_blank" rel="noreferrer" className="text-[14px] text-smoke underline underline-offset-4 hover:text-soot">
              Rather chat on WhatsApp?
            </a>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {product ? (
            <div className="overflow-hidden rounded-card border border-wick bg-wax">
              <img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <p className="label">Starting from</p>
                <p className="mt-1 font-display text-[22px] text-soot">{product.name}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-smoke">{product.blurb}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-card bg-soot p-6 text-wax">
              <p className="font-display text-[22px]">What happens next</p>
              <ul className="mt-4 space-y-3 text-[14px] text-wax/75">
                <li>We read your request and reply with a price and what it includes — usually within a working day.</li>
                <li>The quote stays open for 7 days. Pay by UPI from the link in the email.</li>
                <li>We pour once it is paid. Delivery is included in the quote.</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function Chip({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-all active:scale-95 ${
        active ? 'border-soot bg-soot text-wax' : 'border-wick bg-wax text-smoke hover:border-smoke hover:text-soot'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
