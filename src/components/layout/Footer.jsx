import { Link } from 'react-router-dom'
import Flame from '../ui/Flame.jsx'

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '919769469765'
const INSTAGRAM = import.meta.env.VITE_INSTAGRAM || 'shopaurie.co'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-wick bg-ash">
      <div className="mx-auto max-w-[1240px] px-5 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-3 text-ember" />
              <span className="font-display text-[22px] font-semibold tracking-[0.14em] text-soot">AURIE</span>
            </div>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-smoke">
              Candles poured to order in Mumbai. Send us a reference — a shape, a colour, a scent, a line you want
              hidden in the wax — and we make it.
            </p>
          </div>

          <div>
            <p className="label mb-3">Shop</p>
            <ul className="space-y-2 text-[14px] text-smoke">
              <li><Link to="/shop" className="hover:text-soot">All candles</Link></li>
              <li><Link to="/shop?c=secret" className="hover:text-soot">Secret Glow</Link></li>
              <li><Link to="/shop?c=luxe" className="hover:text-soot">Luxe boxes</Link></li>
              <li><Link to="/orders" className="hover:text-soot">Track an order</Link></li>
            </ul>
          </div>

          <div>
            <p className="label mb-3">Reach us</p>
            <ul className="space-y-2 text-[14px] text-smoke">
              <li>
                <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" className="hover:text-soot">
                  WhatsApp 97694 69765
                </a>
              </li>
              <li>
                <a href={`https://instagram.com/${INSTAGRAM}`} target="_blank" rel="noreferrer" className="hover:text-soot">
                  @{INSTAGRAM}
                </a>
              </li>
              <li className="pt-1 text-smoke/80">Reselling and wholesale welcome — rates differ from this site.</li>
            </ul>
          </div>
        </div>

        <div className="rule my-10" />
        <p className="text-[13px] text-smoke/80">© {new Date().getFullYear()} Aurie. Every candle is hand-poured, so no two are identical.</p>
      </div>
    </footer>
  )
}
