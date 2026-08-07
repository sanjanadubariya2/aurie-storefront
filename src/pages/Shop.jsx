import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FilterBar from '../components/product/FilterBar.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
import QuickView from '../components/product/QuickView.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx'
import { fetchProducts, fetchCollections } from '../api/catalog.js'
import { startingPrice } from '../data/products.js'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState(null)
  const [collections, setCollections] = useState([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')
  const [open, setOpen] = useState(null)

  const active = params.get('c') || 'all'

  useEffect(() => {
    fetchProducts().then(setProducts)
    fetchCollections().then(setCollections)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [active])

  const visible = useMemo(() => {
    if (!products) return []
    const q = query.trim().toLowerCase()
    let list = products.filter((p) => {
      const inCollection = active === 'all' || p.collection === active
      const matches =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.scent?.toLowerCase().includes(q) ||
        p.blurb?.toLowerCase().includes(q)
      return inCollection && matches
    })
    if (sort === 'low' || sort === 'high') {
      list = [...list].sort((a, b) => {
        const pa = startingPrice(a) ?? Infinity
        const pb = startingPrice(b) ?? Infinity
        return sort === 'low' ? pa - pb : pb - pa
      })
    }
    return list
  }, [products, active, query, sort])

  const heading = collections.find((c) => c.id === active)

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 lg:px-8">
      <header className="py-8 sm:py-10">
        <h1 className="font-display text-[34px] leading-tight text-soot sm:text-[46px]">
          {heading ? heading.name : 'The whole catalogue'}
        </h1>
        <p className="mt-2 max-w-lg text-[15px] text-smoke">
          {heading ? heading.note : 'Forty-three shapes across eight collections. Everything is poured after you order.'}
        </p>
      </header>

      <FilterBar
        collections={collections}
        active={active}
        onChange={(c) => setParams(c === 'all' ? {} : { c })}
        query={query}
        onQuery={setQuery}
        sort={sort}
        onSort={setSort}
        count={visible.length}
      />

      {products === null ? (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nothing matches that"
          body="Try a different word, or ask us on WhatsApp — we make things that are not in the catalogue too."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery('')
                setParams({})
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {visible.map((p, i) => (
            <ProductCard key={p.id} product={p} onOpen={setOpen} priority={i < 4} />
          ))}
        </div>
      )}

      <QuickView product={open} onClose={() => setOpen(null)} />
    </div>
  )
}
