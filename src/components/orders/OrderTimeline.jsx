import { STATUS_FLOW, STATUS_COPY } from '../../api/orders.js'

export default function OrderTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <p className="mt-5 rounded-xl bg-ash px-3.5 py-2.5 text-[14px] text-ink">
        <span className="font-medium">{STATUS_COPY.cancelled.title}.</span> {STATUS_COPY.cancelled.body}
      </p>
    )
  }

  const current = Math.max(0, STATUS_FLOW.indexOf(status))

  return (
    <ol className="mt-5">
      {STATUS_FLOW.map((key, i) => {
        const done = i < current
        const now = i === current
        return (
          <li key={key} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors
                  ${done ? 'border-soot bg-soot' : ''}
                  ${now ? 'border-ember bg-ember' : ''}
                  ${!done && !now ? 'border-wick bg-transparent' : ''}`}
              >
                {(done || now) && (
                  <svg viewBox="0 0 12 10" className="h-2.5 w-2.5 text-wax" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 5l3.5 3.5L11 1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {i < STATUS_FLOW.length - 1 && (
                <span className={`w-0.5 flex-1 ${done ? 'bg-soot' : 'bg-wick'}`} style={{ minHeight: 34 }} />
              )}
            </div>
            <div className={`pb-5 ${!done && !now ? 'opacity-45' : ''}`}>
              <p className="text-[15px] leading-tight text-soot">{STATUS_COPY[key].title}</p>
              <p className="mt-1 text-[13px] text-smoke">{STATUS_COPY[key].body}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
