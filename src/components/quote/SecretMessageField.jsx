import { useState } from 'react'
import { Input } from '../ui/Field.jsx'
import Button from '../ui/Button.jsx'
import { useSettings } from '../../context/ShopContext.jsx'
import { suggestSecretMessages } from '../../api/ai.js'

const TONES = ['sweet', 'funny', 'romantic', 'heartfelt', 'cheeky', 'celebratory']

/**
 * The hidden line for a Secret Glow candle: a live preview of the letter beads
 * sitting in the wax, a hard character limit (the beads physically cannot hold
 * more), and — when the assistant is switched on — wording ideas from Gemini.
 */
export default function SecretMessageField({ value, onChange, occasion = '' }) {
  const { secretMessageMaxChars: max = 24, features } = useSettings()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ recipient: '', tone: 'sweet', idea: '', language: 'English' })
  const [ideas, setIdeas] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const length = [...value].length

  const ask = async () => {
    setBusy(true)
    setError('')
    try {
      const { suggestions } = await suggestSecretMessages({ ...form, occasion })
      setIdeas(suggestions)
      if (!suggestions.length) setError('No ideas that fit this time — try a different tone or idea.')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <label htmlFor="secret" className="label mb-1.5 block">
            Hidden message <span className="normal-case tracking-normal text-smoke/70">(optional)</span>
          </label>
          <Input
            id="secret"
            value={value}
            maxLength={max}
            placeholder="Will you marry me?"
            onChange={(e) => onChange([...e.target.value].slice(0, max).join(''))}
          />
          <div className="mt-1.5 flex items-center justify-between text-[12px]">
            <span className="text-smoke">Letters, numbers, spaces — appears after about 3 hours of burning.</span>
            <span className={`tabular-nums ${length >= max ? 'text-ember' : 'text-smoke'}`}>
              {length}/{max}
            </span>
          </div>
        </div>
        <BeadPreview text={value} />
      </div>

      {features?.ai && (
        <div className="mt-4">
          {!open ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-wick bg-wax px-3.5 py-2 text-[13px] text-soot transition-colors hover:border-soot"
            >
              <Sparkle /> Stuck on the wording? Get ideas
            </button>
          ) : (
            <div className="animate-fadeIn rounded-2xl border border-wick bg-wax p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[14px] font-medium text-soot">
                <Sparkle /> Wording ideas
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input
                  aria-label="Who is it for"
                  placeholder="Who is it for? e.g. my wife, Riya"
                  value={form.recipient}
                  onChange={(e) => setForm({ ...form, recipient: e.target.value.slice(0, 60) })}
                />
                <Input
                  aria-label="Your idea"
                  placeholder="Any idea or inside joke?"
                  value={form.idea}
                  onChange={(e) => setForm({ ...form, idea: e.target.value.slice(0, 200) })}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Tone">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={form.tone === t}
                    onClick={() => setForm({ ...form, tone: t })}
                    className={`rounded-full border px-3 py-1 text-[12px] capitalize transition-colors ${
                      form.tone === t ? 'border-soot bg-soot text-wax' : 'border-wick text-smoke hover:border-smoke'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <select
                  aria-label="Language"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                  className="ml-auto rounded-full border border-wick bg-wax px-3 py-1 text-[12px] text-ink"
                >
                  <option>English</option>
                  <option>Hinglish</option>
                  <option>Hindi</option>
                </select>
              </div>
              <Button type="button" size="sm" variant="dark" onClick={ask} loading={busy} className="mt-4">
                {ideas.length ? 'More ideas' : 'Suggest wording'}
              </Button>
              {error && <p className="mt-2 text-[13px] text-ember">{error}</p>}
              {ideas.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {ideas.map((idea) => (
                    <li key={idea}>
                      <button
                        type="button"
                        onClick={() => onChange(idea)}
                        className={`rounded-xl border px-3 py-2 text-left text-[14px] transition-colors ${
                          value === idea ? 'border-ember bg-ember/[0.06] text-soot' : 'border-wick bg-ash/50 text-ink hover:border-soot'
                        }`}
                      >
                        “{idea}”
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-smoke/80">Ideas are written by AI. We check every message by hand before pouring.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** The message as letter beads floating in a wax pool, seen from above. */
function BeadPreview({ text }) {
  const chars = [...(text || 'YOUR WORDS')].slice(0, 24)
  const placeholder = !text
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto grid h-[150px] w-[150px] shrink-0 place-items-center rounded-full border-[6px] border-[#e9e4da] shadow-[inset_0_6px_18px_rgba(23,21,15,0.12)]"
      style={{ background: 'radial-gradient(circle at 50% 45%, #fffdf8, #f1ebe0 70%)' }}
    >
      <span className="absolute left-1/2 top-1/2 h-3 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-soot/70" />
      <div className={`flex max-w-[118px] flex-wrap justify-center gap-[3px] ${placeholder ? 'opacity-30' : ''}`}>
        {chars.map((c, i) =>
          c === ' ' ? (
            <span key={i} className="w-2" />
          ) : (
            <span
              key={i}
              className="grid h-[17px] w-[17px] place-items-center rounded-full bg-white text-[9px] font-semibold uppercase text-soot shadow-[0_1px_2px_rgba(23,21,15,0.35)]"
            >
              {c}
            </span>
          ),
        )}
      </div>
    </div>
  )
}

function Sparkle() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-ember" fill="currentColor" aria-hidden="true">
      <path d="M8 0l1.6 5.2L15 7l-5.4 1.8L8 14l-1.6-5.2L1 7l5.4-1.8L8 0z" />
    </svg>
  )
}
