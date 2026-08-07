import { useReveal } from '../../hooks/useReveal.js'
import SectionHead from '../ui/SectionHead.jsx'

/** This genuinely is a sequence — the wait between ordering and burning is the
 *  thing customers ask about most — so numbering it carries real information. */
const steps = [
  { n: '01', t: 'You send a reference', b: 'A screenshot, a colour, a scent you like, or a line to hide in the wax.' },
  { n: '02', t: 'We pour', b: 'Soy wax, poured and set by hand. Two days for most pieces.' },
  { n: '03', t: 'It cures', b: 'Wax needs 48 hours to hold scent properly. We do not skip this.' },
  { n: '04', t: 'It ships', b: 'Bubble-wrapped, tracked, and usually with you on day seven.' },
]

export default function HowItWorks() {
  const [ref, shown] = useReveal()
  return (
    <section ref={ref} className={`mt-24 ${shown ? 'animate-riseIn' : 'opacity-0'}`}>
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <SectionHead
          eyebrow="Seven days, start to doorstep"
          title="Nothing here exists before you order it"
          note="We do not hold stock. That is why the colours match your reference and why it takes a week."
        />
        <ol className="mt-10 grid gap-px overflow-hidden rounded-card bg-wick sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="bg-wax p-6">
              <span className="font-display text-[13px] tabular-nums text-ember">{s.n}</span>
              <h3 className="mt-3 font-display text-[19px] text-soot">{s.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-smoke">{s.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
