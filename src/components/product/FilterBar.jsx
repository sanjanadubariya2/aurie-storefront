export default function FilterBar({ collections, active, onChange, query, onQuery, sort, onSort, count }) {
  return (
    <div className="sticky top-16 z-30 -mx-5 border-b border-wick bg-ash/90 px-5 py-3 backdrop-blur-md sm:top-[72px] lg:-mx-8 lg:px-8">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
          <Chip active={active === 'all'} onClick={() => onChange('all')}>
            Everything
          </Chip>
          {collections.map((c) => (
            <Chip key={c.id} active={active === c.id} onClick={() => onChange(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 16 16"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-smoke"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l4 4" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search candles"
              aria-label="Search candles"
              className="h-10 w-full rounded-full border border-wick bg-wax pl-9 pr-3 text-[14px] placeholder:text-smoke/60 focus:outline-none focus-visible:border-ember"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            aria-label="Sort candles"
            className="h-10 shrink-0 rounded-full border border-wick bg-wax px-3 text-[13px] text-ink focus:outline-none focus-visible:border-ember"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>

        <p className="text-[13px] text-smoke">
          {count} {count === 1 ? 'candle' : 'candles'}
        </p>
      </div>
    </div>
  )
}

function Chip({ active, children, ...props }) {
  return (
    <button
      className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-[13px] transition-all duration-150 active:scale-95
        ${active ? 'border-soot bg-soot text-wax' : 'border-wick bg-wax text-smoke hover:border-smoke hover:text-soot'}`}
      {...props}
    >
      {children}
    </button>
  )
}
