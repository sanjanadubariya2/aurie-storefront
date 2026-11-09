import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Field, { Input, Textarea } from '../components/ui/Field.jsx'
import Stars from '../components/ui/Stars.jsx'
import AddressForm from '../components/checkout/AddressForm.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { fetchAccount, updateProfile, saveAddresses, fetchReviewable, postReview } from '../api/account.js'
import { validateAddress } from '../lib/validate.js'

const blankAddress = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', notes: '', isDefault: false }

export default function Account() {
  const { customer, setAuthOpen } = useAuth()
  const { productById } = useShop()
  const { slugs } = useWishlist()
  const { toast } = useToast()
  const [params] = useSearchParams()
  const [account, setAccount] = useState(null)
  const [reviewable, setReviewable] = useState([])
  useDocumentMeta({ title: 'Your Account', description: 'Your saved addresses, wishlist and reviews at Aurie.', path: '/account', noindex: true })

  useEffect(() => {
    if (!customer) return
    fetchAccount().then(setAccount).catch((e) => toast(e.message, 'error'))
    fetchReviewable().then(setReviewable).catch(() => {})
  }, [customer, toast])

  // Deep link from the review-request email: scroll straight to that order.
  useEffect(() => {
    if (params.get('review') && reviewable.length) document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })
  }, [params, reviewable])

  if (!customer) {
    return (
      <div className="mx-auto max-w-[900px] px-5">
        <EmptyState title="Sign in to your account" body="Addresses, wishlist and reviews live here." action={<Button onClick={() => setAuthOpen(true)}>Sign in</Button>} />
      </div>
    )
  }

  const wished = slugs.map(productById).filter(Boolean)

  return (
    <div className="mx-auto max-w-[1100px] px-5 pb-24 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4 py-10">
        <div>
          <h1 className="font-display text-[34px] leading-tight text-soot sm:text-[42px]">{account?.customer?.name ? `Hello, ${account.customer.name.split(' ')[0]}` : 'Your account'}</h1>
          <p className="mt-2 text-[15px] text-smoke">{customer.email}</p>
        </div>
        <div className="flex gap-2">
          <Button as={Link} to="/orders" variant="outline" size="sm">
            Orders
          </Button>
          <Button as={Link} to="/quotes" variant="outline" size="sm">
            Custom requests
          </Button>
        </div>
      </header>

      {reviewable.length > 0 && <ReviewSection items={reviewable} focus={params.get('review')} onDone={(key) => setReviewable((l) => l.filter((i) => `${i.orderNumber}:${i.productId}` !== key))} />}

      <section className="mt-10" aria-labelledby="wishlist">
        <h2 id="wishlist" className="font-display text-[24px] text-soot">
          Wishlist <span className="text-smoke">({wished.length})</span>
        </h2>
        {wished.length === 0 ? (
          <p className="mt-3 text-[15px] text-smoke">
            Tap the heart on any candle to save it here. <Link to="/shop" className="underline underline-offset-4 hover:text-soot">Browse the shop</Link>
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {wished.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {account && <Addresses account={account} onSaved={setAccount} />}
      {account && <Profile account={account} onSaved={setAccount} />}
    </div>
  )
}

// Items are re-fetched (new objects) when the session check finishes, so
// compare by order + product, never by object identity.
const keyOf = (i) => (i ? `${i.orderNumber}:${i.productId}` : '')

function ReviewSection({ items, focus, onDone }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(() => items.find((i) => i.orderNumber === focus) || items[0])
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [photo, setPhoto] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    try {
      await postReview({ ...open, rating, text, photo })
      toast('Thank you — your review shows once we have read it')
      onDone(`${open.orderNumber}:${open.productId}`)
      setOpen(items.find((i) => keyOf(i) !== keyOf(open)) || null)
      setRating(0)
      setText('')
      setPhoto(null)
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="reviews" className="rounded-card border border-glow/60 bg-wax p-6">
      <h2 className="font-display text-[22px] text-soot">How did they burn?</h2>
      <p className="mt-1 text-[14px] text-smoke">Reviews from real buyers help a small studio more than anything.</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={`${i.orderNumber}:${i.productId}`}>
            <button
              onClick={() => setOpen(i)}
              className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[13px] ${keyOf(open) === keyOf(i) ? 'border-soot bg-soot text-wax' : 'border-wick text-ink'}`}
            >
              {i.image && <img src={i.image} alt="" className="h-7 w-7 rounded-full object-cover" />}
              {i.name}
            </button>
          </li>
        ))}
      </ul>
      {open && (
        <div className="mt-5 grid gap-4 sm:max-w-xl">
          <Stars value={rating} onChange={setRating} size="lg" label={`Rate ${open.name}`} />
          <Field label="What did you think?" id="r-text">
            <Textarea id="r-text" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} placeholder="How it looked, how it smelled, how long it burned…" />
          </Field>
          <label className="text-[13px] text-smoke">
            Add a photo (optional) <input type="file" accept="image/*" className="ml-2 text-[13px]" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </label>
          <Button onClick={submit} loading={busy} disabled={!rating} className="justify-self-start">
            Post review
          </Button>
        </div>
      )}
    </section>
  )
}

function Addresses({ account, onSaved }) {
  const { toast } = useToast()
  const [editing, setEditing] = useState(null) // index, or 'new'
  const [draft, setDraft] = useState(blankAddress)
  const [errors, setErrors] = useState({})
  const list = account.addresses || []

  const persist = async (next) => {
    try {
      onSaved(await saveAddresses(next))
      setEditing(null)
      toast('Addresses saved')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const saveDraft = () => {
    const found = validateAddress(draft)
    setErrors(found)
    if (Object.keys(found).length) return
    const next = editing === 'new' ? [...list, draft] : list.map((a, i) => (i === editing ? draft : a))
    persist(next)
  }

  return (
    <section className="mt-14" aria-labelledby="addresses">
      <div className="flex items-end justify-between">
        <h2 id="addresses" className="font-display text-[24px] text-soot">
          Saved addresses
        </h2>
        {list.length < 5 && editing === null && (
          <Button size="sm" variant="outline" onClick={() => (setDraft(blankAddress), setErrors({}), setEditing('new'))}>
            Add address
          </Button>
        )}
      </div>
      {editing !== null ? (
        <div className="mt-5 max-w-2xl rounded-card border border-wick bg-wax p-5">
          <AddressForm value={draft} errors={errors} onChange={setDraft} />
          <div className="mt-5 flex gap-3">
            <Button onClick={saveDraft}>Save address</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : list.length === 0 ? (
        <p className="mt-3 text-[15px] text-smoke">Addresses you save here appear at checkout.</p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {list.map((a, i) => (
            <li key={i} className={`rounded-card border bg-wax p-5 text-[14px] leading-relaxed text-ink ${a.isDefault ? 'border-soot' : 'border-wick'}`}>
              {a.isDefault && <span className="label mb-1 block text-ember">Default</span>}
              {a.fullName}
              <br />
              {a.line1}
              {a.line2 && `, ${a.line2}`}
              <br />
              {a.city}, {a.state} {a.pincode} · +91 {a.phone}
              <div className="mt-3 flex gap-4 text-[13px]">
                <button className="underline underline-offset-4" onClick={() => (setDraft(a), setErrors({}), setEditing(i))}>
                  Edit
                </button>
                {!a.isDefault && (
                  <button className="underline underline-offset-4" onClick={() => persist(list.map((x, j) => ({ ...x, isDefault: j === i })))}>
                    Make default
                  </button>
                )}
                <button className="text-smoke underline underline-offset-4 hover:text-ember" onClick={() => persist(list.filter((_, j) => j !== i))}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Profile({ account, onSaved }) {
  const { toast } = useToast()
  const [name, setName] = useState(account.customer?.name || '')
  const [optOut, setOptOut] = useState(Boolean(account.customer?.marketingOptOut))

  const save = async () => {
    try {
      onSaved(await updateProfile({ name: name.trim(), marketingOptOut: optOut }))
      toast('Saved')
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <section className="mt-14 max-w-xl" aria-labelledby="profile">
      <h2 id="profile" className="font-display text-[24px] text-soot">
        You
      </h2>
      <Field label="Your name" id="p-name" className="mt-4">
        <Input id="p-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
      </Field>
      <label className="mt-4 flex items-start gap-3 text-[14px] text-ink">
        <input type="checkbox" checked={optOut} onChange={(e) => setOptOut(e.target.checked)} className="mt-1 h-4 w-4 accent-[#C1441E]" />
        <span>
          No reminder emails
          <span className="block text-[13px] text-smoke">Skip "you left something in your cart" and review requests. Order updates still arrive.</span>
        </span>
      </label>
      <Button onClick={save} className="mt-5">
        Save
      </Button>
    </section>
  )
}
