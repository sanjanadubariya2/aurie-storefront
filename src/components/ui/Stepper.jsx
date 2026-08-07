export default function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'now' : 'next'
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-medium transition-colors
                ${state === 'done' ? 'bg-soot text-wax' : ''}
                ${state === 'now' ? 'bg-ember text-wax' : ''}
                ${state === 'next' ? 'border border-wick text-smoke' : ''}`}
            >
              {state === 'done' ? (
                <svg viewBox="0 0 12 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 5l3.5 3.5L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span
              className={`hidden text-[13px] sm:block ${state === 'next' ? 'text-smoke' : 'text-soot'}`}
            >
              {label}
            </span>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-wick" />}
          </li>
        )
      })}
    </ol>
  )
}
