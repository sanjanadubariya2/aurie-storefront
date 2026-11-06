import { Link } from 'react-router-dom'
import SectionHead from '../ui/SectionHead.jsx'
import { useReveal } from '../../hooks/useReveal.js'

/** "Shop by collection" — one photo tile per collection, so the whole range is
 *  visible in one screen instead of eight scrolls down the page. */
export default function CollectionGrid({ collections, products }) {
  const [ref, shown] = useReveal()
  const tiles = collections
    .map((c) => {
      const inIt = products.filter((p) => p.collection === c.id)
      // Prefer a bestseller-style badge for the cover photo.
      const cover = inIt.find((p) => p.badge) || inIt[0]
      return cover ? { ...c, cover, count: inIt.length } : null
    })
    .filter(Boolean)

  if (!tiles.length) return null

  return (
    <section ref={ref} className={`mt-6 ${shown ? 'animate-riseIn' : 'opacity-0'}`} aria-labelledby="collections-title">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <SectionHead
          eyebrow={`${products.length} shapes, ${tiles.length} collections`}
          title={<span id="collections-title">Shop by collection</span>}
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {tiles.map((c) => (
            <li key={c.id}>
              <Link
                to={`/shop?c=${c.id}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-card bg-soot sm:aspect-[5/6]"
              >
                <img
                  src={c.cover.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-soot/85 via-soot/20 to-transparent"
                />
                <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <span className="block font-display text-[19px] leading-tight text-wax sm:text-[22px]">{c.name}</span>
                  <span className="mt-1 block text-[12px] text-wax/70 sm:text-[13px]">{c.tagline}</span>
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-wax/90 px-2 py-0.5 text-[11px] tabular-nums text-soot">
                  {c.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
