import { useReveal } from '../../hooks/useReveal.js'

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '919769469765'

export default function Wholesale() {
  const [ref, shown] = useReveal()
  return (
    <section ref={ref} className={`mt-24 ${shown ? 'animate-riseIn' : 'opacity-0'}`}>
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-card border border-wick bg-wax p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <span className="label">Bulk &amp; reselling</span>
            <h2 className="mt-2 max-w-xl font-display text-[24px] leading-tight text-soot sm:text-[28px]">
              Wedding favours, corporate gifting, or stocking your own shelf
            </h2>
            <p className="mt-2 max-w-xl text-[15px] text-smoke">
              Wholesale rates sit below the prices on this site and start at 25 pieces. Tell us the quantity and the
              date you need them by.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi Aurie, I want wholesale rates.')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-soot px-6 text-sm text-wax transition-colors hover:bg-[#241F17]"
          >
            Get wholesale rates
          </a>
        </div>
      </div>
    </section>
  )
}
