import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import Flame from '../ui/Flame.jsx'

const links = [
  { to: '/shop', label: 'Shop', match: (l) => l.pathname === '/shop' && !l.search.includes('c=secret') },
  { to: '/shop?c=secret', label: 'Secret Glow', match: (l) => l.search.includes('c=secret') },
  { to: '/shop?c=luxe', label: 'Gift boxes', match: (l) => l.search.includes('c=luxe') },
  { to: '/orders', label: 'Orders', match: (l) => l.pathname === '/orders' },
]

export default function Header() {
  const { itemCount, setCartOpen } = useCart()
  const { customer, setAuthOpen, signOut } = useAuth()
  const { toast } = useToast()
  const [stuck, setStuck] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [location])

  // Close the account menu on an outside click.
  useEffect(() => {
    if (!accountOpen) return undefined
    const onDown = (e) => !accountRef.current?.contains(e.target) && setAccountOpen(false)
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [accountOpen])

  const doSignOut = async () => {
    setAccountOpen(false)
    setMenuOpen(false)
    await signOut()
    toast('Signed out')
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300
        ${stuck || menuOpen ? 'border-b border-wick bg-ash/90 backdrop-blur-md' : 'border-b border-transparent bg-transparent'}`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-5 sm:h-[72px] lg:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Aurie, home">
          <Flame className="h-5 w-3 animate-flicker text-ember" />
          <span className="font-display text-[22px] font-semibold tracking-[0.14em] text-soot">AURIE</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = l.match(location)
            return (
              <NavLink
                key={l.label}
                to={l.to}
                aria-current={active ? 'page' : undefined}
                className={`relative text-[14px] transition-colors hover:text-soot ${active ? 'text-soot' : 'text-smoke'}`}
              >
                {l.label}
                {active && <span className="absolute -bottom-1.5 left-0 right-0 h-px bg-ember" />}
              </NavLink>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {customer ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex h-10 items-center gap-2 rounded-full px-3 text-[13px] text-smoke transition-colors hover:bg-soot/[0.06] hover:text-soot"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-soot text-[12px] font-medium uppercase text-wax">
                  {customer.email[0]}
                </span>
                <span className="max-w-[160px] truncate">{customer.email}</span>
              </button>
              {accountOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-56 animate-fadeIn overflow-hidden rounded-2xl border border-wick bg-wax py-1.5 shadow-lift"
                >
                  <Link role="menuitem" to="/orders" className="block px-4 py-2.5 text-[14px] text-ink hover:bg-ash">
                    Your orders
                  </Link>
                  <Link role="menuitem" to="/policies/contact" className="block px-4 py-2.5 text-[14px] text-ink hover:bg-ash">
                    Help and contact
                  </Link>
                  <div className="rule my-1.5" />
                  <button role="menuitem" onClick={doSignOut} className="block w-full px-4 py-2.5 text-left text-[14px] text-smoke hover:bg-ash hover:text-soot">
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="hidden h-10 items-center rounded-full px-3.5 text-[14px] text-smoke transition-colors hover:bg-soot/[0.06] hover:text-soot sm:flex"
            >
              Sign in
            </button>
          )}

          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            className="relative flex h-10 items-center gap-2 rounded-full bg-soot pl-3.5 pr-4 text-[13px] text-wax transition-transform active:scale-95"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M2 5h12l-1 9H3L2 5zM5.5 5V4a2.5 2.5 0 015 0v1" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Cart</span>
            <span
              key={itemCount}
              className={`grid h-5 min-w-[20px] place-items-center rounded-full px-1 text-[11px] tabular-nums ${
                itemCount ? 'animate-fadeIn bg-ember text-wax' : 'bg-wax/15'
              }`}
            >
              {itemCount}
            </span>
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-full text-soot md:hidden"
          >
            <svg viewBox="0 0 18 12" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d={menuOpen ? 'M2 1l14 10M16 1L2 11' : 'M0 1h18M0 6h18M0 11h18'} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="animate-fadeIn border-t border-wick px-5 pb-5 pt-2 md:hidden" aria-label="Mobile">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="flex items-center justify-between border-b border-wick/70 py-3.5 font-display text-[19px] text-soot">
              {l.label}
              <span className="text-smoke">→</span>
            </Link>
          ))}
          <div className="mt-4 text-[14px]">
            {customer ? (
              <div className="flex items-center justify-between">
                <span className="truncate text-smoke">{customer.email}</span>
                <button onClick={doSignOut} className="text-soot underline underline-offset-4">
                  Sign out
                </button>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="h-11 w-full rounded-full border border-soot/25 text-soot">
                Sign in
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
