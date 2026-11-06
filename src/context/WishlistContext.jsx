import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'
import { read, write } from '../lib/storage.js'
import { fetchAccount, saveWishlist } from '../api/account.js'

const WishlistContext = createContext(null)
const KEY = 'aurie.wishlist'

/**
 * Saved-for-later candles. Guests keep them in this browser; on sign-in the
 * browser list and the account list are merged and kept on the server, so the
 * wishlist follows the customer to their phone.
 */
export function WishlistProvider({ children }) {
  const { customer } = useAuth()
  const { toast } = useToast()
  const [slugs, setSlugs] = useState(() => read(KEY, []))
  const merged = useRef(null)

  useEffect(() => write(KEY, slugs), [slugs])

  useEffect(() => {
    if (!customer || merged.current === customer.id) return
    merged.current = customer.id
    fetchAccount()
      .then(({ wishlist }) => {
        const union = [...new Set([...(wishlist || []), ...read(KEY, [])])]
        setSlugs(union)
        if (union.length !== (wishlist || []).length) saveWishlist(union).catch(() => {})
      })
      .catch(() => {})
  }, [customer])

  const toggle = useCallback(
    (product) => {
      setSlugs((list) => {
        const has = list.includes(product.id)
        const next = has ? list.filter((s) => s !== product.id) : [product.id, ...list].slice(0, 100)
        if (customer) saveWishlist(next).catch(() => {})
        toast(has ? `${product.name} removed from your wishlist` : `${product.name} saved to your wishlist`)
        return next
      })
    },
    [customer, toast],
  )

  const value = useMemo(() => ({ slugs, has: (id) => slugs.includes(id), toggle }), [slugs, toggle])
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => useContext(WishlistContext)

/** The heart button used on cards and the product page. */
export function WishlistButton({ product, className = '' }) {
  const { has, toggle } = useWishlist()
  const saved = has(product.id)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(product)
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className={`grid h-9 w-9 place-items-center rounded-full bg-wax/90 backdrop-blur-sm transition-transform active:scale-90 ${className}`}
    >
      <svg viewBox="0 0 20 18" className={`h-4 w-4 ${saved ? 'text-ember' : 'text-soot'}`} fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
        <path d="M10 16.5S2 11.6 2 6.3A4.1 4.1 0 0110 4.5a4.1 4.1 0 018 1.8c0 5.3-8 10.2-8 10.2Z" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
