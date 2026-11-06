import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { read, write } from '../lib/storage.js'
import { useSettings } from './ShopContext.jsx'
import { useAuth } from './AuthContext.jsx'
import { syncCart } from '../api/account.js'

const CartContext = createContext(null)
const KEY = 'aurie.cart'

const lineKey = (productId, tierId, note) => `${productId}::${tierId}::${note || ''}`

export function CartProvider({ children }) {
  // Delivery fee, free-delivery threshold and per-line cap come from the API
  // (GET /settings). The server's total is the one charged — these only drive
  // what the cart shows before checkout.
  const { freeShippingFrom, shippingFee, maxPerLine } = useSettings()
  const [lines, setLines] = useState(() => read(KEY, []))
  const [cartOpen, setCartOpen] = useState(false)

  // Signed-in carts are mirrored to the account (debounced) so a reminder can
  // go out if one sits untouched for a day. Prices are never sent.
  const { customer } = useAuth()
  useEffect(() => {
    if (!customer) return undefined
    const t = setTimeout(() => syncCart(lines).catch(() => {}), 1500)
    return () => clearTimeout(t)
  }, [lines, customer])

  const linesRef = useRef(lines)
  useEffect(() => {
    linesRef.current = lines
    write(KEY, lines)
  }, [lines])

  const add = useCallback((product, tier, note = '') => {
    const key = lineKey(product.id, tier.id, note)
    setLines((list) => {
      const found = list.find((l) => l.key === key)
      if (found) return list.map((l) => (l.key === key ? { ...l, count: Math.min(maxPerLine, l.count + 1) } : l))
      return [
        ...list,
        {
          key,
          productId: product.id,
          name: product.name,
          image: product.image,
          tierId: tier.id,
          tierLabel: tier.label,
          unitPrice: tier.price,
          note,
          count: 1,
        },
      ]
    })
    setCartOpen(true)
  }, [maxPerLine])

  const setCount = useCallback((key, count) => {
    setLines((list) =>
      count <= 0
        ? list.filter((l) => l.key !== key)
        : list.map((l) => (l.key === key ? { ...l, count: Math.min(maxPerLine, count) } : l)),
    )
  }, [maxPerLine])

  /** Syncs saved lines with the live catalogue: drops products or sizes that
   *  no longer exist, refreshes name/image/price. Returns what changed. */
  const reconcile = useCallback((products) => {
    const byId = new Map(products.map((p) => [p.id, p]))
    const removed = []
    const repriced = []
    const next = linesRef.current.flatMap((l) => {
      const product = byId.get(l.productId)
      const tier = product?.tiers?.find((t) => t.id === l.tierId)
      if (!product || !tier || product.quote) {
        removed.push(l.name)
        return []
      }
      if (tier.price !== l.unitPrice) repriced.push(product.name)
      return [{ ...l, name: product.name, image: product.image, tierLabel: tier.label, unitPrice: tier.price }]
    })
    setLines(next)
    return { removed, repriced }
  }, [])

  const remove = useCallback((key) => setLines((list) => list.filter((l) => l.key !== key)), [])

  const empty = useCallback(() => setLines([]), [])

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.count, 0), [lines])
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.count, 0), [lines])

  /** Free over 999, otherwise a flat courier rate. */
  const shipping = lines.length === 0 || subtotal >= freeShippingFrom ? 0 : shippingFee
  const total = subtotal + shipping

  const value = useMemo(
    () => ({ lines, add, setCount, remove, empty, reconcile, subtotal, shipping, total, itemCount, cartOpen, setCartOpen }),
    [lines, add, setCount, remove, empty, reconcile, subtotal, shipping, total, itemCount, cartOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
