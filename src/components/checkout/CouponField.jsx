import { useState } from 'react'
import { checkCoupon } from '../../api/account.js'
import { rupees } from '../../lib/format.js'

/** "Have a code?" — checked by the server against the real cart, so the
 *  discount shown is the discount charged. */
export default function CouponField({ lines, applied, onApply }) {
  const [open, setOpen] = useState(Boolean(applied))
  const [code, setCode] = useState(applied?.code || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const apply = async () => {
    if (!code.trim()) return
    setBusy(true)
    setError('')
    try {
      const res = await checkCoupon(code.trim(), lines.map(({ productId, tierId, count, unitPrice }) => ({ productId, tierId, count, unitPrice })))
      onApply(res)
    } catch (e) {
      setError(e.message)
      onApply(null)
    } finally {
      setBusy(false)
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-sea/10 px-3.5 py-2.5 text-[14px] text-ink">
        <span>
          <span className="font-medium">{applied.code}</span> applied — {rupees(applied.discount)} off
          {applied.description && <span className="block text-[12px] text-smoke">{applied.description}</span>}
        </span>
        <button onClick={() => (onApply(null), setCode(''))} className="text-[13px] text-smoke underline underline-offset-4">
          Remove
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot">
        Have a discount code?
      </button>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20))}
          onKeyDown={(e) => e.key === 'Enter' && apply()}
          placeholder="CODE"
          aria-label="Discount code"
          className="h-10 min-w-0 flex-1 rounded-full border border-wick bg-wax px-4 text-[14px] uppercase tracking-wider focus:outline-none focus-visible:border-ember"
        />
        <button onClick={apply} disabled={busy || !code} className="h-10 rounded-full bg-soot px-4 text-[13px] text-wax disabled:opacity-50">
          {busy ? 'Checking…' : 'Apply'}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[13px] text-ember">{error}</p>}
    </div>
  )
}
