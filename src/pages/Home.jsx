import { useEffect, useState } from 'react'
import Hero from '../components/home/Hero.jsx'
import CollectionRail from '../components/home/CollectionRail.jsx'
import SecretGlowFeature from '../components/home/SecretGlowFeature.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import Wholesale from '../components/home/Wholesale.jsx'
import QuickView from '../components/product/QuickView.jsx'
import { fetchProducts, fetchCollections } from '../api/catalog.js'

/** Rails on the home page, in the order the shop actually sells. */
const RAIL_ORDER = ['festive', 'bloom', 'brew', 'whims', 'tide', 'jars']

export default function Home() {
  const [products, setProducts] = useState([])
  const [collections, setCollections] = useState([])
  const [open, setOpen] = useState(null)

  useEffect(() => {
    fetchProducts().then(setProducts)
    fetchCollections().then(setCollections)
  }, [])

  const rails = RAIL_ORDER.map((id) => ({
    collection: collections.find((c) => c.id === id),
    items: products.filter((p) => p.collection === id),
  })).filter((r) => r.collection && r.items.length)

  return (
    <>
      <Hero />

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
