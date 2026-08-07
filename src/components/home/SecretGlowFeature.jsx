import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import { useReveal } from '../../hooks/useReveal.js'

export default function SecretGlowFeature() {
  const [ref, shown] = useReveal()

  return (
    <section ref={ref} className="mt-24">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <div
          className={`overflow-hidden rounded-[24px] bg-soot text-wax ${shown ? 'animate-riseIn' : 'opacity-0'}`}
        >
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-14">
              <span className="label text-glow">Secret Glow</span>
              <h2 className="mt-3 font-display text-[32px] leading-[1.05] text-wax sm:text-[44px]">
                The message is already in there.
                <br />
                <span className="italic text-glow">You just have to burn to it.</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-wax/70">
                Letter beads or coloured wax set below the surface. For the first hour it looks like an ordinary
                candle. Around hour three, the pool reaches the edge and the line comes up. Gender reveals,
                proposals, apologies, and one order that just said <span className="text-wax">sorry about your car</span>.
              </p>

              <ul className="mt-8 space-y-3">
                {[
                  'Up to 24 characters, any colour',
                  'Message surfaces after roughly 3 hours',
                  'Wrapped so the recipient cannot see it first',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-[14px] text-wax/80">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-glow" />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button as={Link} to="/shop?c=secret" variant="primary">
                  Design one
                </Button>
                <span className="flex items-center text-[13px] text-wax/50">Priced after we agree on the wording</span>
              </div>
            </div>

            <div className="relative min-h-[280px] lg:min-h-0">
              <img
                src="/products/love-note.jpg"
                alt="Two jar candles with letter beads spelling a message set into the wax"
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(70% 55% at 50% 62%, rgba(255,182,92,0.22), transparent 70%)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
