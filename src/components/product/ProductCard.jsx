import { useState } from 'react'
import { rupees } from '../../lib/format.js'
import { useCart } from '../../context/CartContext.jsx'
import TierPicker from './TierPicker.jsx'

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '919769469765'

export default function ProductCard({ product, onOpen, priority = false }) {
  const { add } = useCart()
  const [tier, setTier] = useState(product.tiers?.[0] || null)
  const [justAdded, setJustAdded] = useState(false)

  const addToCart = (e) => {
    e.stopPropagation()
    add(product, tier)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  return (
    <article className="group relative flex h-full flex-col">
      <button
        onClick={() => onOpen(product)}
        className="relative block w-full overflow-hidden rounded-card bg-wax text-left"
        aria-label={`View ${product.name}`}
      >
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
          className="aspect-square w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.045]"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 z-20 rounded-full bg-wax/92 px-2.5 py-1 text-[11px] font-medium text-soot backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col pt-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[17px] leading-tight text-soot">{product.name}</h3>
          <span className="shrink-0 font-display text-[16px] tabular-nums text-soot">
            {product.quote ? 'On ask' : rupees(tier?.price ?? 0)}
          </span>
        </div>
        {product.scent && <p className="mt-1 text-[13px] text-smoke">{product.scent}</p>}

        {product.tiers && (
          <div className="mt-3">
            <TierPicker tiers={product.tiers} value={tier} onChange={setTier} size="sm" />
          </div>
        )}

        <div className="mt-auto pt-3.5">
          {product.quote ? (
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi Aurie, I'd like a quote for the ${product.name}.`)}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-10 w-full items-center justify-center rounded-full border border-soot/25 text-[13px] text-soot transition-colors hover:border-soot hover:bg-soot hover:text-wax"
            >
              Ask for a quote
            </a>
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
