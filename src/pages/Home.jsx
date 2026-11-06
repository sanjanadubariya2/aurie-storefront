import Hero from '../components/home/Hero.jsx'
import CollectionRail from '../components/home/CollectionRail.jsx'
import CollectionGrid from '../components/home/CollectionGrid.jsx'
import SecretGlowFeature from '../components/home/SecretGlowFeature.jsx'
import HowItWorks from '../components/home/HowItWorks.jsx'
import Wholesale from '../components/home/Wholesale.jsx'
import GiftFinder from '../components/home/GiftFinder.jsx'
import Button from '../components/ui/Button.jsx'
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

/** Rails on the home page, in the order the shop actually sells. */
const RAIL_ORDER = ['festive', 'bloom', 'brew', 'whims', 'tide', 'jars']

export default function Home() {
  const { products, collections, loading, error, reload } = useShop()
  useDocumentMeta({ path: '/' })

  const rails = RAIL_ORDER.map((id) => ({
    collection: collections.find((c) => c.id === id),
    items: (products || []).filter((p) => p.collection === id),
  })).filter((r) => r.collection && r.items.length)

  return (
    <>
      <Hero />

      {products && <CollectionGrid collections={collections} products={products} />}

      {loading && (
        <div className="mx-auto mt-20 grid max-w-[1240px] grid-cols-2 gap-5 px-5 lg:grid-cols-4 lg:px-8" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
      {error && (
        <div className="mx-auto mt-16 flex max-w-[1240px] flex-wrap items-center gap-4 px-5 lg:px-8">
          <p className="text-[15px] text-smoke">The catalogue could not be loaded right now.</p>
          <Button variant="outline" size="sm" onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      {rails.slice(0, 3).map((r) => (
        <CollectionRail key={r.collection.id} collection={r.collection} products={r.items} />
      ))}

      <GiftFinder />

      <SecretGlowFeature />

      {rails.slice(3).map((r) => (
        <CollectionRail key={r.collection.id} collection={r.collection} products={r.items} />
      ))}

      <HowItWorks />
      <Wholesale />
    </>
  )
}
