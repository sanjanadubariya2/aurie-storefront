import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchProducts, fetchCollections, fetchSettings } from '../api/catalog.js'

/**
 * The catalogue and the shop's business rules, loaded once and shared.
 * Home, Shop, product pages and checkout all read from here instead of each
 * fetching their own copy.
 *
 * `settings` starts with safe defaults and is replaced by GET /api/settings —
 * the API is the single source for delivery fee, free-delivery threshold and
 * the COD limit, and its total is what actually gets charged.
 */
export const DEFAULT_SETTINGS = Object.freeze({
  currency: 'INR',
  freeShippingFrom: 999,
  shippingFee: 79,
  codLimit: 2000,
  maxPerLine: 20,
  leadTimeDays: 7,
  statusFlow: ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'],
})

const ShopContext = createContext(null)

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(null)
  const [collections, setCollections] = useState([])
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setError('')
    setProducts(null)
    Promise.all([fetchProducts(), fetchCollections()])
      .then(([p, c]) => {
        setProducts(p)
        setCollections(c)
      })
      .catch((e) => setError(e.message || 'The catalogue did not load.'))
  }, [])

  useEffect(() => {
    load()
    fetchSettings()
      .then((s) => setSettings({ ...DEFAULT_SETTINGS, ...s }))
      .catch(() => {
        /* defaults are fine — the server still prices the order */
      })
  }, [load])

  const value = useMemo(() => {
    const bySlug = new Map((products || []).map((p) => [p.id, p]))
    const byCollection = new Map(collections.map((c) => [c.id, c]))
    return {
      products,
      collections,
      settings,
      error,
      loading: products === null && !error,
      reload: load,
      productById: (id) => bySlug.get(id),
      collectionById: (id) => byCollection.get(id),
    }
  }, [products, collections, settings, error, load])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export const useShop = () => useContext(ShopContext)
export const useSettings = () => useContext(ShopContext).settings
