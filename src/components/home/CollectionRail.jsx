import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../product/ProductCard.jsx'
import SectionHead from '../ui/SectionHead.jsx'
import { useReveal } from '../../hooks/useReveal.js'

export default function CollectionRail({ collection, products }) {
  const scroller = useRef(null)
  const [ref, shown] = useReveal()

  const nudge = (dir) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <section
      ref={ref}
      className={`mt-20 ${shown ? 'animate-riseIn' : 'opacity-0'}`}
      aria-labelledby={`rail-${collection.id}`}
    >
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <SectionHead
          eyebrow={collection.tagline}
          title={<span id={`rail-${collection.id}`}>{collection.name}</span>}
          note={collection.note}
          action={
            <div className="hidden items-center gap-2 sm:flex">
              <RailButton label="Scroll left" onClick={() => nudge(-1)} d="M9 2L4 7l5 5" />
              <RailButton label="Scroll right" onClick={() => nudge(1)} d="M5 2l5 5-5 5" />
              <Link
                to={`/shop?c=${collection.id}`}
                className="ml-2 text-[14px] text-smoke underline underline-offset-4 hover:text-soot"
              >
                See all
              </Link>
            </div>
          }
        />
      </div>

      <div
        ref={scroller}
        className="no-scrollbar mt-7 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 lg:px-8"
      >
        {products.map((p, i) => (
          <div key={p.id} className="h-full w-[70vw] shrink-0 snap-start sm:w-[300px]">
            <ProductCard product={p} priority={i < 2} />
          </div>
        ))}
        <Link
          to={`/shop?c=${collection.id}`}
          className="grid w-[46vw] shrink-0 snap-start place-items-center rounded-card border border-dashed border-wick text-center text-[14px] text-smoke transition-colors hover:border-smoke hover:text-soot sm:w-[200px]"
        >
          See all {collection.name}
        </Link>
      </div>
    </section>
  )
}

function RailButton({ label, d, ...props }) {
  return (
    <button
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-wick text-soot transition-colors hover:border-soot"
      {...props}
    >
      <svg viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={d} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
