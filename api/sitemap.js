import { SITE, esc, getProducts } from './_shared.js'

const STATIC = ['/', '/shop', '/policies/shipping', '/policies/refunds', '/policies/privacy', '/policies/terms', '/policies/contact']

/** /sitemap.xml — every product page plus the fixed pages, rebuilt hourly. */
export default async function handler(req, res) {
  let products = []
  try {
    products = await getProducts()
  } catch {
    /* still serve the static pages */
  }
  const collections = [...new Set(products.map((p) => p.collection))]
  const urls = [
    ...STATIC.map((p) => `${SITE}${p}`),
    ...collections.map((c) => `${SITE}/shop?c=${encodeURIComponent(c)}`),
    ...products.map((p) => `${SITE}/p/${encodeURIComponent(p.id)}`),
  ]
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${esc(u)}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
  )
}
