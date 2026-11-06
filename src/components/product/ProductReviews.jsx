import { useEffect, useState } from 'react'
import Stars from '../ui/Stars.jsx'
import { fetchReviews } from '../../api/account.js'
import { shortDate } from '../../lib/format.js'

/** Verified-buyer reviews for one product (approved by the shop first). */
export default function ProductReviews({ slug }) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let cancelled = false
    fetchReviews(slug)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setData({ reviews: [], summary: { count: 0 } }))
    return () => {
      cancelled = true
    }
  }, [slug])

  if (!data) return null
  const { reviews, summary } = data

  return (
    <section className="border-t border-wick py-14" aria-labelledby="reviews-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-title" className="font-display text-[26px] text-soot sm:text-[32px]">
          From people who lit it
        </h2>
        {summary.count > 0 && (
          <p className="flex items-center gap-2 text-[14px] text-smoke">
            <Stars value={summary.average} /> <span className="font-display text-[18px] text-soot">{summary.average}</span> from {summary.count} review{summary.count > 1 ? 's' : ''}
          </p>
        )}
      </div>
      {reviews.length === 0 ? (
        <p className="mt-4 text-[15px] text-smoke">No reviews yet. Buyers can review from their account once it is delivered.</p>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="flex gap-4 rounded-card border border-wick bg-wax p-5">
              {r.photo && (
                <a href={r.photo} target="_blank" rel="noreferrer" className="shrink-0">
                  <img src={r.photo} alt={`Photo from ${r.author}`} loading="lazy" className="h-24 w-24 rounded-xl object-cover" />
                </a>
              )}
              <div className="min-w-0">
                <Stars value={r.rating} size="sm" />
                {r.text && <p className="mt-2 text-[15px] leading-relaxed text-ink">{r.text}</p>}
                <p className="mt-2 text-[12px] text-smoke">
                  {r.author}
                  {r.city && `, ${r.city}`} · {shortDate(r.createdAt)} · verified buyer
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
