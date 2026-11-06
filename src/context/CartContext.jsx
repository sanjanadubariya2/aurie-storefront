import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { read, write } from '../lib/storage.js'

const CartContext = createContext(null)
const KEY = 'aurie.cart'

const lineKey = (productId, tierId, note) => `${productId}::${tierId}::${note || ''}`

/** Free delivery at or above this subtotal, otherwise a flat fee. COD has a
 *  ceiling. The server applies the same numbers (aurie-api lib/createOrder.js)
 *  and its total is the one charged — these only drive what the cart shows. */
export const FREE_SHIPPING_FROM = 999
export const SHIPPING_FEE = 79
export const COD_LIMIT = 2000
/** The API rejects more than this many of one line. */
export const MAX_PER_LINE = 20

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => read(KEY, []))
  const [cartOpen, setCartOpen] = useState(false)

  const linesRef = useRef(lines)
  useEffect(() => {
    linesRef.current = lines
    write(KEY, lines)
  }, [lines])

  const add = useCallback((product, tier, note = '') => {
    const key = lineKey(product.id, tier.id, note)
    setLines((list) => {
      const found = list.find((l) => l.key === key)
      if (found) return list.map((l) => (l.key === key ? { ...l, count: Math.min(MAX_PER_LINE, l.count + 1) } : l))
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
  }, [])

  const setCount = useCallback((key, count) => {
    setLines((list) =>
      count <= 0
        ? list.filter((l) => l.key !== key)
        : list.map((l) => (l.key === key ? { ...l, count: Math.min(MAX_PER_LINE, count) } : l)),
    )
  }, [])

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
  const shipping = lines.length === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  const total = subtotal + shipping

  const value = useMemo(
    () => ({ lines, add, setCount, remove, empty, reconcile, subtotal, shipping, total, itemCount, cartOpen, setCartOpen }),
    [lines, add, setCount, remove, empty, reconcile, subtotal, shipping, total, itemCount, cartOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
