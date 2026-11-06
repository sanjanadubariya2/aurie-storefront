import { useState } from 'react'
import { Link } from 'react-router-dom'
import { rupees } from '../../lib/format.js'
import { useCart } from '../../context/CartContext.jsx'
import TierPicker from './TierPicker.jsx'
import Stars from '../ui/Stars.jsx'
import { WishlistButton } from '../../context/WishlistContext.jsx'

/** A catalogue card. The photo and name open the product page; sizes and
 *  "Add to cart" work right on the card so browsing never has to stop. */
export default function ProductCard({ product, priority = false }) {
  const { add } = useCart()
  const [tier, setTier] = useState(product.tiers?.[0] || null)
  const [justAdded, setJustAdded] = useState(false)
  const href = `/p/${product.id}`

  const addToCart = () => {
    add(product, tier)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <article className="group relative flex h-full flex-col">
      <Link to={href} className="relative block overflow-hidden rounded-card bg-wax" aria-label={product.name}>
        {/* Lit state: warmth blooms behind the product on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(circle at 50% 62%, rgba(255,182,92,0.28), transparent 62%)' }}
        />
        <img
          src={product.image}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          width="600"
          height="600"
          className="aspect-square w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.045]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-wax/92 px-2.5 py-1 text-[11px] font-medium text-soot backdrop-blur-sm">
            {product.badge}
          </span>
        )}
        <WishlistButton product={product} className="absolute right-3 top-3 z-20" />
        {product.quote && (
          <span className="absolute bottom-3 left-3 z-20 rounded-full bg-soot/80 px-2.5 py-1 text-[11px] text-wax backdrop-blur-sm">
            Made to your brief
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[17px] leading-tight text-soot">
            <Link to={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none sm:after:hidden">
              {product.name}
            </Link>
          </h3>
          <span className="shrink-0 font-display text-[16px] tabular-nums text-soot">
            {product.quote ? 'On ask' : rupees(tier?.price ?? 0)}
          </span>
        </div>
        {product.rating?.count > 0 && (
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-smoke">
            <Stars value={product.rating.average} size="sm" /> {product.rating.average} ({product.rating.count})
          </p>
        )}
        {(product.scent || product.burn) && (
          <p className="mt-1 text-[13px] text-smoke">
            {[product.scent, product.burn && `${product.burn} burn`].filter(Boolean).join(' · ')}
          </p>
        )}

        {product.tiers && (
          <div className="relative z-20 mt-3">
            <TierPicker tiers={product.tiers} value={tier} onChange={setTier} size="sm" />
          </div>
        )}

        <div className="relative z-20 mt-auto pt-3.5">
          {product.quote ? (
            <Link
              to={`/quote?product=${product.id}`}
              className="flex h-10 w-full items-center justify-center rounded-full border border-soot/25 text-[13px] text-soot transition-colors hover:border-soot hover:bg-soot hover:text-wax"
            >
              Request a quote
            </Link>
          ) : (
            <button
              onClick={addToCart}
              className={`h-10 w-full rounded-full text-[13px] transition-all duration-200 active:scale-[0.97]
                ${justAdded ? 'bg-soot text-wax' : 'border border-soot/25 text-soot hover:border-soot hover:bg-soot hover:text-wax'}`}
            >
              {justAdded ? 'Added to cart' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
