import { rupees } from '../../lib/format.js'
import { longDate, estimateDelivery } from '../../lib/format.js'

export default function OrderSummary({ lines, subtotal, shipping, giftWrapFee = 0, total, neededBy }) {
  return (
    <aside className="rounded-card border border-wick bg-wax p-5 sm:p-6 lg:sticky lg:top-24 lg:self-start">
      <h2 className="font-display text-[19px] text-soot">Your order</h2>

      <ul className="mt-4 divide-y divide-wick">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-3 py-3">
            <div className="relative shrink-0">
              <img src={l.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-soot px-1 text-[11px] tabular-nums text-wax">
                {l.count}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] text-soot">{l.name}</p>
              <p className="text-[12px] text-smoke">{l.tierLabel}</p>
              {l.note && <p className="mt-0.5 line-clamp-1 text-[12px] italic text-smoke/80">{l.note}</p>}
            </div>
            <span className="shrink-0 text-[14px] tabular-nums text-ink">{rupees(l.unitPrice * l.count)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-1.5 border-t border-wick pt-4 text-[14px]">
        <div className="flex justify-between">
          <dt className="text-smoke">Subtotal</dt>
          <dd className="tabular-nums text-ink">{rupees(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-smoke">Delivery</dt>
          <dd className="tabular-nums text-ink">{shipping === 0 ? 'Free' : rupees(shipping)}</dd>
        </div>
        {giftWrapFee > 0 && (
          <div className="flex justify-between">
            <dt className="text-smoke">Gift wrap</dt>
            <dd className="tabular-nums text-ink">{rupees(giftWrapFee)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-wick pt-3">
          <dt className="font-display text-[17px] text-soot">Total</dt>
          <dd className="font-display text-[20px] tabular-nums text-soot">{rupees(total)}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-xl bg-ash px-3.5 py-2.5 text-[13px] text-ink">
        {neededBy
          ? `You need it by ${longDate(neededBy)} — we will pour it in time.`
          : `Expected by ${longDate(estimateDelivery())}. Hand-poured, so this is an estimate, not a promise.`}
      </p>
    </aside>
  )
}
