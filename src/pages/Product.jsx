import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { Textarea } from '../components/ui/Field.jsx'
import TierPicker from '../components/product/TierPicker.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { BUSINESS, whatsappLink } from '../content/business.js'
import { rupees, longDate, estimateDelivery } from '../lib/format.js'

export default function Product() {
  const { slug } = useParams()
  const { products, loading, error, reload, productById, collectionById, settings } = useShop()
  const { add } = useCart()
  const product = productById(slug)
  const collection = product && collectionById(product.collection)

  const [tier, setTier] = useState(null)
  const [note, setNote] = useState('')
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setTier(product?.tiers?.[0] || null)
    setNote('')
    window.scrollTo({ top: 0 })
  }, [product])

  const related = useMemo(
    () => (products || []).filter((p) => p.collection === product?.collection && p.id !== product?.id).slice(0, 4),
    [products, product],
  )

  const jsonLd = useMemo(() => {
    if (!product) return undefined
    const prices = (product.tiers || []).map((t) => t.price)
    return {
      '@type': 'Product',
      name: product.name,
      image: product.image,
      description: product.blurb,
      brand: { '@type': 'Brand', name: BUSINESS.name },
      category: collection?.name,
      ...(prices.length && {
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          availability: 'https://schema.org/MadeToOrder',
        },
      }),
    }
  }, [product, collection])

  useDocumentMeta({
    title: product?.name,
    description: product?.blurb,
    image: product?.image,
    path: `/p/${slug}`,
    jsonLd,
  })

  if (error) {
    return (
      <Shell>
        <EmptyState
          title="This page did not load"
          body={error}
          action={
            <Button variant="outline" onClick={reload}>
              Try again
            </Button>
          }
        />
      </Shell>
    )
  }

  if (loading) {
    return (
      <Shell>
        <div className="grid gap-10 py-10 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-[24px]" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </Shell>
    )
  }

  if (!product) {
    return (
      <Shell>
        <EmptyState
          title="That candle is not in the catalogue"
          body="It may have been retired. Everything we pour right now is in the shop."
          action={
            <Button as={Link} to="/shop">
              Browse the catalogue
            </Button>
          }
        />
      </Shell>
    )
  }

  const addToCart = () => {
    add(product, tier, note.trim())
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }
  const quoteLink = whatsappLink(`Hi Aurie, I'd like a quote for the ${product.name}.`)

  return (
    <Shell>
      <nav aria-label="Breadcrumb" className="py-6 text-[13px] text-smoke">
        <Link to="/shop" className="hover:text-soot">
          Shop
        </Link>
        {collection && (
          <>
            <span className="mx-2 text-wick">/</span>
            <Link to={`/shop?c=${collection.id}`} className="hover:text-soot">
              {collection.name}
            </Link>
          </>
        )}
        <span className="mx-2 text-wick">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 pb-16 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Photo — sticky on desktop so the details scroll past it */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="group relative overflow-hidden rounded-[24px] bg-wax shadow-lift">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 opacity-60 transition-opacity duration-700 group-hover:opacity-100"
              style={{ background: 'radial-gradient(circle at 50% 65%, rgba(255,182,92,0.22), transparent 60%)' }}
            />
            <img
              src={product.image}
              alt={product.name}
              width="900"
              height="900"
              className="aspect-square w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 z-20 rounded-full bg-wax/92 px-3 py-1.5 text-[12px] font-medium text-soot backdrop-blur-sm">
                {product.badge}
              </span>
            )}
          </div>
        </div>

        <div>
          {collection && <p className="label">{collection.name}</p>}
          <h1 className="mt-2 font-display text-[36px] leading-[1.05] text-soot sm:text-[46px]">{product.name}</h1>

          <p className="mt-4 font-display text-[26px] tabular-nums text-soot">
            {product.quote ? 'Priced on request' : rupees(tier?.price ?? 0)}
            {tier?.qty > 1 && (
              <span className="ml-2 align-middle font-sans text-[14px] text-smoke">
                {rupees(Math.round(tier.price / tier.qty))} each
              </span>
            )}
          </p>

          <p className="mt-5 max-w-prose text-[16px] leading-relaxed text-ink">{product.blurb}</p>

          {(product.scent || product.burn) && (
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-wick bg-wick">
              {product.scent && <Spec term="Scent" value={product.scent} />}
              {product.burn && <Spec term="Burn time" value={product.burn} />}
            </dl>
          )}

          {product.quote ? (
            <div className="mt-8 rounded-2xl bg-soot p-6 text-wax">
              <p className="font-display text-[20px]">Made to your brief</p>
              <p className="mt-2 text-[14px] leading-relaxed text-wax/75">
                Tell us the occasion, the wording or colours you want, and a budget. We reply with a price — usually
                within a working day — and you pay online.
              </p>
              <Button as={Link} to={`/quote?product=${product.id}`} size="block" className="mt-5">
                Request a quote
              </Button>
              <a href={quoteLink} target="_blank" rel="noreferrer" className="mt-3 block text-center text-[13px] text-wax/60 underline underline-offset-4 hover:text-wax">
                or ask on WhatsApp
              </a>
            </div>
          ) : (
            <>
              {product.tiers?.length > 1 && (
                <div className="mt-8">
                  <span className="label mb-2.5 block">Choose a size</span>
                  <TierPicker tiers={product.tiers} value={tier} onChange={setTier} />
                </div>
              )}

              <div className="mt-6">
                <label htmlFor="note" className="label mb-1.5 block">
                  Colour or scent request <span className="normal-case tracking-normal text-smoke/70">(optional)</span>
                </label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. sage green, unscented, gift wrap in kraft paper"
                  maxLength={200}
                />
                <p className="mt-1 text-right text-[12px] text-smoke/70">{note.length}/200</p>
              </div>

              <div className="mt-4 hidden sm:block">
                <Button onClick={addToCart} size="lg" className="w-full">
                  {added ? 'Added to cart' : `Add to cart · ${rupees(tier?.price ?? 0)}`}
                </Button>
              </div>
            </>
          )}

          <ul className="mt-8 grid gap-3 text-[14px] text-ink sm:grid-cols-2">
            <Assurance icon="flame">Poured after you order — expected by {longDate(estimateDelivery())}</Assurance>
            <Assurance icon="truck">Free delivery from {rupees(settings.freeShippingFrom)}</Assurance>
            <Assurance icon="cash">Cash on delivery up to {rupees(settings.codLimit)}</Assurance>
            <Assurance icon="leaf">Hand-poured soy wax, cotton wick</Assurance>
          </ul>

          <details className="group mt-8 border-t border-wick py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-[18px] text-soot">
              Burning it well
              <span className="text-smoke transition-transform group-open:rotate-45">+</span>
            </summary>
            <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-smoke">
              <li>Trim the wick to 5mm before every burn.</li>
              <li>Let the first burn run until the melted pool reaches the edge — usually 2–3 hours.</li>
              <li>Never leave it burning unattended, near curtains, or within reach of children and pets.</li>
              <li>Sculpted pieces are made to be looked at as much as lit — many customers keep them unlit.</li>
            </ul>
          </details>
          <details className="group border-t border-b border-wick py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-[18px] text-soot">
              Delivery and returns
              <span className="text-smoke transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[14px] leading-relaxed text-smoke">
              Every candle is poured to order, so it ships in about {settings.leadTimeDays} days. Damaged in transit?
              Send us an unboxing photo within 48 hours and we replace it. Read the{' '}
              <Link to="/policies/shipping" className="underline underline-offset-4 hover:text-soot">
                shipping
              </Link>{' '}
              and{' '}
              <Link to="/policies/refunds" className="underline underline-offset-4 hover:text-soot">
                refund
              </Link>{' '}
              policies.
            </p>
          </details>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-wick py-14" aria-labelledby="related">
          <div className="flex items-end justify-between">
            <h2 id="related" className="font-display text-[26px] text-soot sm:text-[32px]">
              More from {collection?.name || 'the shop'}
            </h2>
            <Link to={`/shop?c=${product.collection}`} className="text-[14px] text-smoke underline underline-offset-4 hover:text-soot">
              See all
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Phones: the buy button stays in reach while reading */}
      {!product.quote && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-wick bg-wax/95 px-5 py-3 backdrop-blur-md sm:hidden">
          <Button onClick={addToCart} size="block">
            {added ? 'Added to cart' : `Add to cart · ${rupees(tier?.price ?? 0)}`}
          </Button>
        </div>
      )}
    </Shell>
  )
}

function Shell({ children }) {
  return <div className="mx-auto max-w-[1240px] px-5 pb-24 sm:pb-10 lg:px-8">{children}</div>
}

function Spec({ term, value }) {
  return (
    <div className="bg-wax px-4 py-3.5">
      <dt className="label">{term}</dt>
      <dd className="mt-1 text-[15px] text-ink">{value}</dd>
    </div>
  )
}

const ICONS = {
  flame: 'M8 1c1 3 4 4 4 8a4 4 0 01-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-4 0-7z',
  truck: 'M1 4h9v7H1zM10 7h3l2 2v2h-5M4 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  cash: 'M1 4h14v8H1zM8 10a2 2 0 100-4 2 2 0 000 4z',
  leaf: 'M2 14C2 6 7 2 14 2c0 7-4 12-12 12zM2 14l6-6',
}

function Assurance({ icon, children }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-ember" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d={ICONS[icon]} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </li>
  )
}
