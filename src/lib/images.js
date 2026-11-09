/**
 * Responsive Cloudinary images. Product photos are stored with a
 * `f_auto,q_auto,w_900,c_limit` delivery URL: Cloudinary already picks AVIF or
 * WebP per browser and compresses them. These helpers add the other half —
 * several widths, so a phone showing a 180px card downloads a ~300px file
 * instead of the 900px one.
 */
// The width transform, e.g. the `w_900` in `/upload/f_auto,q_auto,w_900,c_limit/`.
const WIDTH = /([/,])w_\d+(?=[,/])/

export const isCloudinary = (url) => typeof url === 'string' && url.includes('res.cloudinary.com/') && WIDTH.test(url)

/** The same Cloudinary image at another width. Other URLs are returned unchanged. */
export const atWidth = (url, width) => (isCloudinary(url) ? url.replace(WIDTH, `$1w_${width}`) : url)

/** srcset for a Cloudinary URL, or undefined for any other image. */
export const srcSet = (url, widths = [320, 480, 640, 900]) =>
  isCloudinary(url) ? widths.map((w) => `${atWidth(url, w)} ${w}w`).join(', ') : undefined

/** Common `sizes` values, matching the grid breakpoints in Tailwind. */
export const SIZES = {
  card: '(min-width: 1024px) 280px, (min-width: 640px) 45vw, 50vw',
  rail: '(min-width: 640px) 300px, 70vw',
  tile: '(min-width: 1024px) 280px, 50vw',
  hero: '(min-width: 1024px) 50vw, 100vw',
  thumb: '96px',
}

/** Descriptive alt text for a product photo — what it is, not just its name. */
export function productAlt(product, collection) {
  const kind = /candle|jar|box|bouquet|hamper|set|crate|basket|diya|thali/i.test(product.name) ? '' : ' candle'
  const scent = product.scent && !/unscented|your pick/i.test(product.scent) ? `, ${product.scent.toLowerCase()} scent` : ''
  const from = collection?.name ? ` from the Aurie ${collection.name} collection` : ''
  return `${product.name}${kind}${scent}, hand-poured${from}`
}
