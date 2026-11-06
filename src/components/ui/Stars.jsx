/** Star rating. Read-only by default; pass onChange to make it a picker. */
export default function Stars({ value = 0, onChange, size = 'md', label }) {
  const px = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-7 w-7' : 'h-4 w-4'
  const star = 'M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 15l-5.2 2.7 1-5.9L1.5 7.7l5.9-.8L10 1.5Z'

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" role="img" aria-label={label || `${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} viewBox="0 0 20 20" className={`${px} ${value >= n - 0.25 ? 'text-glow' : 'text-wick'}`} fill="currentColor">
            <path d={star} />
          </svg>
        ))}
      </span>
    )
  }

  return (
    <span className="inline-flex gap-1" role="radiogroup" aria-label={label || 'Rating'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="transition-transform active:scale-90">
          <svg viewBox="0 0 20 20" className={`${px} ${value >= n ? 'text-glow' : 'text-wick hover:text-glow/60'}`} fill="currentColor">
            <path d={star} />
          </svg>
        </button>
      ))}
    </span>
  )
}
