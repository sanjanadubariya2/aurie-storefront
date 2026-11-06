import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import VoiceButton from '../ui/VoiceButton.jsx'
import { useShop } from '../../context/ShopContext.jsx'
import { findGifts } from '../../api/account.js'
import { rupees } from '../../lib/format.js'

const EXAMPLES = ['Diwali gift for my boss under ₹800', 'Something cute for my sister who loves coffee', 'Return gifts for 30 guests at a baby shower']

/**
 * "Not sure what to get?" — describe the person and the occasion (typed or
 * spoken) and Gemini picks from the real catalogue. Shown only when the API
 * reports the assistant is switched on.
 */
export default function GiftFinder() {
  const { settings, productById } = useShop()
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!settings.features?.ai) return null

  const ask = async (q = query) => {
    if (q.trim().length < 3) return
    setBusy(true)
    setError('')
    try {
      setResult(await findGifts(q.trim()))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const picks = (result?.picks || []).map((p) => ({ ...p, product: productById(p.id) })).filter((p) => p.product)

  return (
    <section className="mt-24" aria-labelledby="gift-finder">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="overflow-hidden rounded-[24px] border border-wick bg-wax">
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <span className="label">Gift finder</span>
              <h2 id="gift-finder" className="mt-2 font-display text-[30px] leading-tight text-soot sm:text-[38px]">
                Not sure what to get?
              </h2>
              <p className="mt-3 max-w-md text-[15px] text-smoke">Tell us who it is for and what they like. Speak or type — Hindi or English.</p>
              <div className="mt-6 flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && ask()}
                  maxLength={400}
                  placeholder="e.g. anniversary, she loves roses, under ₹1,000"
                  aria-label="Describe the gift"
                  className="h-12 min-w-0 flex-1 rounded-full border border-wick bg-ash/40 px-5 text-[15px] focus:outline-none focus-visible:border-ember"
                />
                <VoiceButton
                  onResult={(text) => {
                    setQuery(text)
                    ask(text)
                  }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setQuery(ex)
                      ask(ex)
                    }}
                    className="rounded-full border border-wick px-3 py-1 text-[12px] text-smoke hover:border-smoke hover:text-soot"
                  >
                    {ex}
                  </button>
                ))}
              </div>
              <Button onClick={() => ask()} loading={busy} className="mt-5" disabled={query.trim().length < 3}>
                Find gift ideas
              </Button>
              {error && <p className="mt-3 text-[13px] text-ember">{error}</p>}
            </div>

            <div className="min-h-[200px]">
              {busy && <p className="animate-pulse text-[15px] text-smoke">Looking through the catalogue…</p>}
              {!busy && result && (
                <>
                  {result.intro && <p className="text-[15px] text-ink">{result.intro}</p>}
                  {picks.length === 0 ? (
                    <p className="mt-3 text-[15px] text-smoke">
                      Nothing in the catalogue fits — but we make custom pieces. <Link to="/quote" className="underline underline-offset-4">Request one</Link>.
                    </p>
                  ) : (
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {picks.map(({ id, reason, product }) => {
                        const from = product.tiers?.length ? Math.min(...product.tiers.map((t) => t.price)) : null
                        return (
                          <li key={id}>
                            <Link to={`/p/${id}`} className="flex gap-3 rounded-2xl border border-wick bg-ash/30 p-3 transition-colors hover:border-soot">
                              <img src={product.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                              <span className="min-w-0">
                                <span className="block font-display text-[16px] text-soot">{product.name}</span>
                                <span className="block text-[12px] text-smoke">{product.quote ? 'Priced on request' : `From ${rupees(from)}`}</span>
                                <span className="mt-1 block text-[13px] leading-snug text-ink">{reason}</span>
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                  <p className="mt-3 text-[11px] text-smoke/80">Suggestions by AI, from our real catalogue.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
