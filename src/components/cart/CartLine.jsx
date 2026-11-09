import { rupees } from '../../lib/format.js'
import { atWidth } from '../../lib/images.js'
import { useSettings } from '../../context/ShopContext.jsx'

export default function CartLine({ line, onCount, onRemove }) {
  const { maxPerLine } = useSettings()
  return (
    <li className="flex gap-3.5 py-4">
      <img src={atWidth(line.image, 160)} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-[16px] text-soot">{line.name}</h3>
            <p className="mt-0.5 text-[13px] text-smoke">{line.tierLabel}</p>
            {line.note && <p className="mt-1 line-clamp-2 text-[12px] italic text-smoke/80">{line.note}</p>}
          </div>
          <span className="shrink-0 font-display text-[15px] tabular-nums text-soot">
            {rupees(line.unitPrice * line.count)}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-wick">
            <StepButton label={`Reduce ${line.name}`} onClick={() => onCount(line.count - 1)} d="M2 6h8" />
            <span className="w-8 text-center text-[13px] tabular-nums text-soot">{line.count}</span>
            <StepButton label={`Add another ${line.name}`} onClick={() => onCount(line.count + 1)} disabled={line.count >= maxPerLine} d="M6 2v8M2 6h8" />
          </div>
          <button
            onClick={onRemove}
            className="text-[13px] text-smoke underline underline-offset-4 hover:text-ember"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  )
}

function StepButton({ label, d, ...props }) {
  return (
    <button
      aria-label={label}
      className="grid h-8 w-8 place-items-center text-soot transition-colors hover:text-ember disabled:opacity-30"
      {...props}
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={d} strokeLinecap="round" />
      </svg>
    </button>
  )
}
