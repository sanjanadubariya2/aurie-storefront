import Flame from './Flame.jsx'

/** A section opens the way a candle does — a wick, then the name. */
export default function SectionHead({ eyebrow, title, note, action }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2">
            <Flame className="h-4 w-2.5 text-wick" />
            <span className="label">{eyebrow}</span>
          </div>
        )}
        <h2 className="font-display text-[28px] leading-[1.08] text-soot sm:text-[38px]">{title}</h2>
        {note && <p className="mt-2 max-w-md text-[15px] text-smoke">{note}</p>}
      </div>
      {action}
    </div>
  )
}
