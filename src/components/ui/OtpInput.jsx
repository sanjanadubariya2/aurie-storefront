import { useEffect, useRef } from 'react'

/** Six boxes that behave the way people expect: auto-advance, backspace, paste. */
export default function OtpInput({ value, onChange, disabled, invalid, autoFocus = true }) {
  const refs = useRef([])

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  const setDigit = (index, digit) => {
    const next = value.split('')
    next[index] = digit
    onChange(next.join('').slice(0, 6))
    if (digit && index < 5) refs.current[index + 1]?.focus()
  }

  const onKeyDown = (index) => (e) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus()
      const next = value.split('')
      next[index - 1] = ''
      onChange(next.join(''))
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus()
  }

  const onPaste = (e) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!digits) return
    e.preventDefault()
    onChange(digits)
    refs.current[Math.min(digits.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-2" onPaste={onPaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={value[i] || ''}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, '').slice(-1))}
          onKeyDown={onKeyDown(i)}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1} of 6`}
          className={`h-13 w-full max-w-[52px] rounded-xl border bg-wax text-center font-display text-xl
            text-soot transition-colors focus:outline-none focus-visible:border-ember
            ${invalid ? 'border-ember' : 'border-wick'}`}
        />
      ))}
    </div>
  )
}
