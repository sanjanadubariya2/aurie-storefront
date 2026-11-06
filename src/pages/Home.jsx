import { useEffect, useState } from 'react'
import Hero from '../components/home/Hero.jsx'
import CollectionRail from '../components/home/CollectionRail.jsx'
import SecretGlowFeature from '../components/home/SecretGlowFeature.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import Wholesale from '../components/home/Wholesale.jsx'
import QuickView from '../components/product/QuickView.jsx'
import { fetchProducts, fetchCollections } from '../api/catalog.js'
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx'

/** Rails on the home page, in the order the shop actually sells. */
const RAIL_ORDER = ['festive', 'bloom', 'brew', 'whims', 'tide', 'jars']

export default function Home() {
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [open, setOpen] = useState(null)
  const [state, setState] = useState('loading') // loading | ready | error

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCollections()])
      .then(([p, c]) => {
        setProducts(p)
        setCollections(c)
        setState('ready')
      })
      .catch(() => setState('error'))
  }, [])

  const rails = RAIL_ORDER.map((id) => ({
    collection: collections.find((c) => c.id === id),
    items: products.filter((p) => p.collection === id),
  })).filter((r) => r.collection && r.items.length)

  return (
    <>
      <Hero />

      {state === 'loading' && (
        <div className="mx-auto mt-20 grid max-w-[1240px] grid-cols-2 gap-5 px-5 lg:grid-cols-4 lg:px-8" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
      {state === 'error' && (
        <p className="mx-auto mt-16 max-w-[1240px] px-5 text-[15px] text-smoke lg:px-8">
          The catalogue could not be loaded right now. Refresh in a minute, or message us on WhatsApp to order.
        </p>
      )}

      {rails.slice(0, 3).map((r) => (
        <CollectionRail key={r.collection.id} collection={r.collection} products={r.items} onOpen={setOpen} />
      ))}

      <SecretGlowFeature />

      {rails.slice(3).map((r) => (
        <CollectionRail key={r.collection.id} collection={r.collection} products={r.items} onOpen={setOpen} />
      ))}

      <HowItWorks />
      <Wholesale />

      <QuickView product={open} onClose={() => setOpen(null)} />
    </>
  )
}
