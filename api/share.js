import { SITE, esc, getProducts } from './_shared.js'

/**
 * Link-preview HTML for social crawlers (WhatsApp, Instagram/Facebook, X,
 * Telegram...). They do not run JavaScript, so the SPA's meta tags are
 * invisible to them. vercel.json routes only those user agents here for
 * /p/:slug; people and search engines get the normal app.
 */
export default async function handler(req, res) {
  const slug = String(req.query.slug || '')
  const url = `${SITE}/p/${encodeURIComponent(slug)}`
  let product
  try {
    product = (await getProducts()).find((p) => p.id === slug)
  } catch {
    /* fall through to a generic card */
  }

  const title = product ? `${product.name} · Aurie` : 'Aurie — candles made to your reference'
  const description = product?.blurb || 'Small-batch sculptural candles, poured to order in Mumbai.'
  // Some preview crawlers cannot show WebP/AVIF — ask Cloudinary for a JPEG.
  const image = product?.image?.replace('/f_auto,', '/f_jpg,')
  const prices = (product?.tiers || []).map((t) => t.price)
  const price = prices.length ? Math.min(...prices) : null

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(`<!doctype html><html lang="en"><head>
<meta charset="utf-8"><title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="${product ? 'product' : 'website'}">
<meta property="og:site_name" content="Aurie">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
${image ? `<meta property="og:image" content="${esc(image)}"><meta property="og:image:width" content="900"><meta property="og:image:height" content="900">` : ''}
${price ? `<meta property="product:price:amount" content="${price}"><meta property="product:price:currency" content="INR">` : ''}
<meta name="twitter:card" content="summary_large_image">
</head><body><a href="${esc(url)}">${esc(title)}</a></body></html>`)
}
