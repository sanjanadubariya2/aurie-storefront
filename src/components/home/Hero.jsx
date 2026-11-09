import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Picture from '../ui/Picture.jsx'
import { SIZES } from '../../lib/images.js'

/**
 * The one thing Aurie makes that nobody else on the feed does is a candle whose
 * message only appears once the wax melts. So the page opens the same way: a
 * sheet of wax sits over the headline, drips, and drops away to reveal it.
 */
export default function Hero() {
  const [melted, setMelted] = useState(false)
  const glowRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => setMelted(true), reduce ? 0 : 1950)
    return () => clearTimeout(t)
  }, [])

  // A warm pool of light that trails the pointer, the way a flame lights a room.
  useEffect(() => {
    const fine = window.matchMedia?.('(pointer: fine)').matches
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return undefined

    const target = { x: 0.72, y: 0.4 }
    const current = { ...target }

    const onMove = (e) => {
      const el = glowRef.current?.parentElement
      if (!el) return
      const r = el.getBoundingClientRect()
      target.x = (e.clientX - r.left) / r.width
      target.y = (e.clientY - r.top) / r.height
    }

    const tick = () => {
      current.x += (target.x - current.x) * 0.06
      current.y += (target.y - current.y) * 0.06
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(420px circle at ${current.x * 100}% ${current.y * 100}%, rgba(255,182,92,0.30), transparent 70%)`
      }
      frameRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove)
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <section className="relative overflow-hidden">
      <div ref={glowRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-5 pb-16 pt-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-24 lg:pt-14">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-wick bg-wax/60 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            <h1 className="label text-ink">Sculptural candles, hand-poured to order in Mumbai</h1>
          </div>

          {/* The reveal: wax over the headline, dripping away. */}
          <div className="relative">
            <p className="font-display text-[42px] font-light leading-[0.98] tracking-[-0.02em] text-soot sm:text-[62px] lg:text-[76px]">
              Some candles
              <br />
              are lit.
              <br />
              <span className="font-semibold italic">Ours are read.</span>
            </p>
            {!melted && (
              <div
                className="wax-curtain pointer-events-none absolute inset-x-0 bottom-0 animate-melt"
                aria-hidden="true"
              />
            )}
          </div>

          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-smoke">
            A hidden line sits under the surface. It stays there through the first hour, the second, and then the
            wax pool reaches the edge and your message is just there. We also do mithai, blooms, cold brews and
            anything else you send us a photo of.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} to="/shop" size="lg">
              Browse the catalogue
            </Button>
            <Button as={Link} to="/shop?c=secret" variant="outline" size="lg">
              See Secret Glow
            </Button>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-wick pt-6">
            {[
              ['From ₹59', 'Bubble cubes up'],
              ['7 days', 'Pour, cure, deliver'],
              ['Free over ₹999', 'Across India'],
            ].map(([term, desc]) => (
              <div key={term}>
                <dt className="font-display text-[19px] text-soot">{term}</dt>
                <dd className="label mt-0.5">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[24px] bg-wax shadow-lift">
            <Picture
              name="lit-pillar-and-tealight-candles-with-pampas"
              widths={[480, 900]}
              width={900}
              height={900}
              sizes={SIZES.hero}
              loading="eager"
              fetchPriority="high"
              alt="Lit pillar and tealight candles on a wooden table beside dried pampas grass"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <figcaption className="mt-3 flex items-center justify-between text-[13px] text-smoke">
            <span>Tapers &amp; tealights, unscented</span>
            <span className="tabular-nums">₹60 — ₹300</span>
          </figcaption>
        </div>
      </div>
    </section>
  )
}
