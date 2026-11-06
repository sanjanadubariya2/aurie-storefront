import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../../context/ShopContext.jsx'
import { matchPhoto } from '../../api/account.js'

/**
 * "Have a photo?" — Gemini looks at the reference, suggests the closest
 * catalogue pieces, and drafts a brief the customer can use as-is. The photo
 * itself is also attached to the request by the parent.
 */
export default function PhotoMatch({ onBrief, onPhoto }) {
  const { settings, productById } = useShop()
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  if (!settings.features?.ai) return null

  const pick = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setError('Use a photo under 5MB')
    setBusy(true)
    setError('')
    onPhoto?.(file)
    try {
      setResult(await matchPhoto(file))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const picks = (result?.picks || []).map((p) => ({ ...p, product: productById(p.id) })).filter((p) => p.product)

  return (
    <div className="rounded-card border border-dashed border-ember/40 bg-ember/[0.03] p-5">
      <p className="font-display text-[18px] text-soot">Have a photo of what you want?</p>
      <p className="mt-1 text-[13px] text-smoke">A cake, a flower, a Pinterest pin — we will find the closest candle and write the brief for you.</p>
      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-soot px-4 py-2 text-[13px] text-wax">
        {busy ? 'Looking at your photo…' : 'Upload a photo'}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {error && <p className="mt-2 text-[13px] text-ember">{error}</p>}
      {result && (
        <div className="mt-4 space-y-3 text-[14px]">
          <p className="text-ink">{result.description}</p>
          {picks.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {picks.map(({ id, reason, product }) => (
                <li key={id}>
                  <Link to={`/p/${id}`} title={reason} className="flex items-center gap-2 rounded-full border border-wick bg-wax py-1 pl-1 pr-3 text-[13px] hover:border-soot">
                    <img src={product.image} alt="" className="h-7 w-7 rounded-full object-cover" />
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {result.brief && (
            <button type="button" onClick={() => onBrief(result.brief)} className="rounded-full border border-soot/30 px-3.5 py-1.5 text-[13px] text-soot hover:bg-soot hover:text-wax">
              Use this description for my request
            </button>
          )}
        </div>
      )}
    </div>
  )
}
