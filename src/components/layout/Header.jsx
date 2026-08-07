import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import Flame from '../ui/Flame.jsx'

const links = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?c=secret', label: 'Secret Glow' },
  { to: '/orders', label: 'Orders' },
]

export default function Header() {
  const { itemCount, setCartOpen } = useCart()
  const { customer, setAuthOpen, signOut } = useAuth()
  const [stuck, setStuck] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
        ${stuck ? 'border-b border-wick bg-ash/85 backdrop-blur-md' : 'border-b border-transparent bg-transparent'}`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-5 sm:h-[72px] lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Aurie, home">
          <Flame className="h-5 w-3 text-ember" />
          <span className="font-display text-[22px] font-semibold tracking-[0.14em] text-soot">AURIE</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className={({ isActive }) =>
                `text-[14px] transition-colors hover:text-soot ${isActive && l.to === '/orders' ? 'text-soot' : 'text-smoke'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {customer ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-[13px] text-smoke">{customer.email}</span>
              <button onClick={signOut} className="text-[13px] text-smoke underline underline-offset-4 hover:text-soot">
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden h-9 items-center rounded-full px-3 text-[14px] text-smoke transition-colors hover:bg-soot/[0.06] hover:text-soot sm:flex"
            >
              Sign in
            </button>
          )}

          <button
            onClick={() => setCartOpen(true)}
            className="relative ml-1 flex h-10 items-center gap-2 rounded-full bg-soot px-4 text-[13px] text-wax transition-transform active:scale-95"
          >
            Cart
            <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-wax/15 px-1 text-[11px] tabular-nums">
              {itemCount}
            </span>
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="ml-1 grid h-10 w-10 place-items-center rounded-full text-soot md:hidden"
          >
            <svg viewBox="0 0 18 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d={menuOpen ? 'M2 1l14 10M16 1L2 11' : 'M0 1h18M0 6h18M0 11h18'} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="animate-fadeIn border-t border-wick bg-ash px-5 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="block py-2.5 text-[15px] text-soot">
              {l.label}
            </Link>
          ))}
          {!customer && (
            <button onClick={() => setAuthOpen(true)} className="block py-2.5 text-[15px] text-soot">
              Sign in
            </button>
          )}
        </div>
      )}
    </header>
  )
}
