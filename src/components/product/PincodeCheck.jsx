import { useState } from 'react'
import { checkPincode } from '../../api/orders.js'
import { longDate } from '../../lib/format.js'

/** "Deliver to 400058 — by Fri 14 Nov". Real courier coverage when Shiprocket
 *  is connected on the API; otherwise the honest made-to-order estimate. */
export default function PincodeCheck() {
  const [pin, setPin] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('aurie.address') || '{}').pincode || ''
    } catch {
      return ''
    }
  })
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const check = async () => {
    if (!/^[1-9]\d{5}$/.test(pin)) return setError('Enter a 6-digit PIN code')
    setError('')
    setBusy(true)
    try {
      setResult(await checkPincode(pin))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const by = result?.estimateDays ? new Date(Date.now() + result.estimateDays * 86_400_000) : null

  return (
    <div className="mt-6 rounded-2xl border border-wick bg-wax p-4">
      <label htmlFor="pin" className="label">
        Check delivery
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="pin"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
            setResult(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && check()}
          placeholder="PIN code"
          className="h-10 w-32 rounded-full border border-wick bg-ash/40 px-4 text-[14px] tabular-nums focus:outline-none focus-visible:border-ember"
        />
        <button onClick={check} disabled={busy} className="h-10 rounded-full bg-soot px-4 text-[13px] text-wax disabled:opacity-50">
          {busy ? 'Checking…' : 'Check'}
        </button>
      </div>
      {error && <p className="mt-2 text-[13px] text-ember">{error}</p>}
      {result && (
        <p className="mt-2 text-[14px] text-ink">
          {result.available === false ? (
            <span className="text-ember">Our couriers do not reach {pin} yet — message us and we will find a way.</span>
          ) : (
            <>
              Arrives by <strong>{longDate(by)}</strong>
              {result.live && result.codAvailable === false && <span className="text-smoke"> · prepaid only to this PIN</span>}
              {!result.live && <span className="text-smoke"> · poured to order, then shipped</span>}
            </>
          )}
        </p>
      )}
    </div>
  )
}
