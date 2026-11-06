import { useEffect, useRef, useState } from 'react'

const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

/**
 * A mic button using the browser's own speech recognition (Chrome, Edge,
 * Safari, Android). Free, no API key, no audio leaves through our servers.
 * Renders nothing where the browser cannot do it (e.g. Firefox).
 * Language: Indian English by default; long-press or the "हि" toggle for Hindi.
 */
export default function VoiceButton({ onResult, className = '' }) {
  const [listening, setListening] = useState(false)
  const [lang, setLang] = useState('en-IN')
  const rec = useRef(null)

  useEffect(() => () => rec.current?.abort(), [])
  if (!SpeechRecognition) return null

  const start = () => {
    if (listening) {
      rec.current?.stop()
      return
    }
    const r = new SpeechRecognition()
    r.lang = lang
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript
      if (text) onResult(text)
    }
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    rec.current = r
    setListening(true)
    r.start()
  }

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={start}
        aria-label={listening ? 'Stop listening' : `Speak (${lang === 'hi-IN' ? 'Hindi' : 'English'})`}
        aria-pressed={listening}
        className={`relative grid h-10 w-10 place-items-center rounded-full border transition-colors ${
          listening ? 'border-ember bg-ember text-wax' : 'border-wick bg-wax text-soot hover:border-soot'
        }`}
      >
        {listening && <span className="absolute inset-0 animate-ping rounded-full bg-ember/40" />}
        <svg viewBox="0 0 16 16" className="relative h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" />
          <path d="M3 7.5a5 5 0 0010 0M8 12.5v2" strokeLinecap="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setLang((l) => (l === 'en-IN' ? 'hi-IN' : 'en-IN'))}
        aria-label={`Switch voice language to ${lang === 'en-IN' ? 'Hindi' : 'English'}`}
        className="h-7 rounded-full px-1.5 text-[11px] text-smoke hover:text-soot"
      >
        {lang === 'en-IN' ? 'EN' : 'हि'}
      </button>
    </span>
  )
}
