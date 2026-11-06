import { Link } from 'react-router-dom'
import Flame from '../ui/Flame.jsx'
import { BUSINESS, whatsappLink } from '../../content/business.js'
import { POLICY_LINKS } from '../../content/policies.jsx'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-wick bg-ash">
      <div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-3 text-ember" />
              <span className="font-display text-[22px] font-semibold tracking-[0.14em] text-soot">AURIE</span>
            </div>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-smoke">
              Candles poured to order in {BUSINESS.city}. Send us a reference — a shape, a colour, a scent, a line you
              want hidden in the wax — and we make it.
            </p>
            <a
              href={whatsappLink('Hi Aurie, I have a question.')}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-soot/25 px-4 text-[13px] text-soot transition-colors hover:border-soot hover:bg-soot hover:text-wax"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" />
              Chat on WhatsApp
            </a>
          </div>

          <FooterList title="Shop">
            <Link to="/shop">All candles</Link>
            <Link to="/shop?c=festive">Festive</Link>
            <Link to="/shop?c=secret">Secret Glow</Link>
            <Link to="/shop?c=luxe">Gift boxes</Link>
            <Link to="/quote">Request a custom candle</Link>
            <Link to="/orders">Track an order</Link>
          </FooterList>

          <FooterList title="Help">
            {POLICY_LINKS.map(([slug, label]) => (
              <Link key={slug} to={`/policies/${slug}`}>
                {label}
              </Link>
            ))}
          </FooterList>

          <FooterList title="Reach us">
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              WhatsApp {BUSINESS.whatsappDisplay}
            </a>
            <a href={`https://instagram.com/${BUSINESS.instagram}`} target="_blank" rel="noreferrer">
              @{BUSINESS.instagram}
            </a>
            <span className="text-smoke/80">{BUSINESS.hours}</span>
          </FooterList>
        </div>

        <div className="rule my-10" />
        <div className="flex flex-col gap-4 text-[13px] text-smoke/80 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.legalName}. Every candle is hand-poured, so no two are identical.
          </p>
          <p className="flex flex-wrap items-center gap-2">
            <span>Secure payments by Razorpay</span>
            <span aria-hidden="true">·</span>
            <span>UPI</span>
            <span aria-hidden="true">·</span>
            <span>Cash on delivery</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterList({ title, children }) {
  return (
    <div>
      <p className="label mb-3">{title}</p>
      <ul className="space-y-2 text-[14px] text-smoke [&_a:hover]:text-soot [&_a]:transition-colors">
        {(Array.isArray(children) ? children.flat() : [children]).map((child, i) => (
          <li key={i}>{child}</li>
        ))}
      </ul>
    </div>
  )
}
