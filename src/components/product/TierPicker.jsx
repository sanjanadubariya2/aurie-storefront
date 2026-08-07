import { rupees } from '../../lib/format.js'

/** The brochure prices in single / pair / box of 4. Picking a tier changes what goes in the cart. */
export default function TierPicker({ tiers, value, onChange, size = 'md' }) {
  if (!tiers || tiers.length < 2) return null
  const pad = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-[12px]'

  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Quantity option">
      {tiers.map((tier) => {
        const active = tier.id === value?.id
        return (
          <button
            key={tier.id}
            role="radio"
            aria-checked={active}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(tier)
            }}
            className={`rounded-full border transition-all duration-150 active:scale-95 ${pad}
              ${active ? 'border-soot bg-soot text-wax' : 'border-wick bg-transparent text-smoke hover:border-smoke hover:text-soot'}`}
          >
            {tier.label}
            {tier.qty > 1 && <span className="ml-1.5 opacity-70 tabular-nums">{rupees(tier.price)}</span>}
          </button>
        )
      })}
    </div>
  )
}
