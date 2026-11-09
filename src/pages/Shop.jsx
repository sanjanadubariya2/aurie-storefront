import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FilterBar from '../components/product/FilterBar.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import { ProductCardSkeleton } from '../components/ui/Skeleton.jsx'
import { useShop } from '../context/ShopContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'

const startingPrice = (p) => (p.tiers?.length ? Math.min(...p.tiers.map((t) => t.price)) : null)

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const { products, collections, error, reload: load } = useShop()
  // Search text lives in the URL too, so a search can be shared or bookmarked.
  const [query, setQuery] = useState(params.get('q') || '')
  const [sort, setSort] = useState(params.get('sort') || 'featured')

  const active = params.get('c') || 'all'
  const heading = collections.find((c) => c.id === active)
  useDocumentMeta({
    title: heading ? `${heading.name} Candles` : 'Shop All Candles',
    description: heading
      ? `${heading.tagline}. ${heading.note} Hand-poured to order in Mumbai and delivered across India.`
      : 'Browse every Aurie candle: festive mithai, flower, coffee, beach and jar candles plus custom Secret Glow messages. Prices from ₹59, made to order.',
    path: active === 'all' ? '/shop' : `/shop?c=${active}`,
  })

  useEffect(() => {
    const next = new URLSearchParams(params)
    query.trim() ? next.set('q', query.trim()) : next.delete('q')
    sort !== 'featured' ? next.set('sort', sort) : next.delete('sort')
    if (next.toString() !== params.toString()) setParams(next, { replace: true })
     
  }, [query, sort])

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


  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-24 lg:px-8">
      <header className="py-8 sm:py-10">
        <h1 className="font-display text-[34px] leading-tight text-soot sm:text-[46px]">
          {heading ? heading.name : 'The whole catalogue'}
        </h1>
        <p className="mt-2 max-w-lg text-[15px] text-smoke">
          {heading
            ? heading.note
            : products
              ? `${products.length} shapes across ${collections.length} collections. Everything is poured after you order.`
              : 'Everything is poured after you order.'}
        </p>
      </header>

      <FilterBar
        collections={collections}
        active={active}
        onChange={(c) => {
          const next = new URLSearchParams(params)
          c === 'all' ? next.delete('c') : next.set('c', c)
          setParams(next)
        }}
        query={query}
        onQuery={setQuery}
        sort={sort}
        onSort={setSort}
        count={visible.length}
      />

      {error ? (
        <EmptyState
          title="The catalogue did not load"
          body={`${error} If this keeps happening, message us on WhatsApp and we will take your order there.`}
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      ) : products === null ? (
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
                setSort('featured')
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
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </div>
      )}

    </div>
  )
}
