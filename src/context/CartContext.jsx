import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { read, write } from '../lib/storage.js'

const CartContext = createContext(null)
const KEY = 'aurie.cart'

const lineKey = (productId, tierId, note) => `${productId}::${tierId}::${note || ''}`

export function CartProvider({ children }) {
  const [lines, setLines] = useState(() => read(KEY, []))
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    write(KEY, lines)
  }, [lines])

  const add = useCallback((product, tier, note = '') => {
    const key = lineKey(product.id, tier.id, note)
    setLines((list) => {
      const found = list.find((l) => l.key === key)
      if (found) return list.map((l) => (l.key === key ? { ...l, count: l.count + 1 } : l))
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
      count <= 0 ? list.filter((l) => l.key !== key) : list.map((l) => (l.key === key ? { ...l, count } : l)),
    )
  }, [])

  const remove = useCallback((key) => setLines((list) => list.filter((l) => l.key !== key)), [])

  const empty = useCallback(() => setLines([]), [])

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.count, 0), [lines])
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.count, 0), [lines])

  /** Free over 999, otherwise a flat courier rate. */
  const shipping = lines.length === 0 || subtotal >= 999 ? 0 : 79
  const total = subtotal + shipping

  const value = useMemo(
    () => ({ lines, add, setCount, remove, empty, subtotal, shipping, total, itemCount, cartOpen, setCartOpen }),
    [lines, add, setCount, remove, empty, subtotal, shipping, total, itemCount, cartOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
