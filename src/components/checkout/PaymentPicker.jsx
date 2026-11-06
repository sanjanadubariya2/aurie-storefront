import { rupees } from '../../lib/format.js'
import { COD_LIMIT } from '../../context/CartContext.jsx'

const methods = [
  {
    id: 'upi',
    name: 'UPI',
    body: 'GPay, PhonePe, Paytm or any UPI app. Paid now, order confirmed immediately.',
    tag: 'Fastest',
  },
  {
    id: 'cod',
    name: 'Cash on delivery',
    body: `Pay the courier when it arrives. Available on orders up to ${rupees(COD_LIMIT)}.`,
  },
]

export default function PaymentPicker({ value, onChange, total }) {
  return (
    <div className="max-w-lg">
      <h2 className="font-display text-[24px] leading-tight text-soot">How would you like to pay?</h2>

      <div className="mt-6 space-y-3" role="radiogroup" aria-label="Payment method">
        {methods.map((m) => {
          const disabled = m.id === 'cod' && total > COD_LIMIT
          const active = value === m.id
          return (
            <button
              key={m.id}
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(m.id)}
              className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-150
                disabled:opacity-45 disabled:pointer-events-none
                ${active ? 'border-soot bg-wax shadow-lift' : 'border-wick bg-wax/50 hover:border-smoke'}`}
            >
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors
                  ${active ? 'border-ember' : 'border-wick'}`}
              >
                {active && <span className="h-2.5 w-2.5 rounded-full bg-ember" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-display text-[17px] text-soot">{m.name}</span>
                  {m.tag && (
                    <span className="rounded-full bg-ash px-2 py-0.5 text-[11px] text-smoke">{m.tag}</span>
                  )}
                </span>
                <span className="mt-1 block text-[14px] leading-relaxed text-smoke">
                  {disabled ? `Not available above ${rupees(COD_LIMIT)}. Pay by UPI instead.` : m.body}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-5 text-[13px] text-smoke">
        {value === 'upi'
          ? `You will be taken to a secure UPI page for ${rupees(total)}.`
          : `Keep ${rupees(total)} ready for the delivery agent.`}
      </p>
    </div>
  )
}
