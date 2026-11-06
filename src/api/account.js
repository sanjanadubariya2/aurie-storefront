import { LIVE, request, delay } from './client.js'

/**
 * Backend contract — routes/account.js (customer session) and routes/ai.js.
 * Mock mode keeps everything in localStorage so the screens stay clickable.
 */
const mock = (key, fallback) => {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}
const save = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

export async function fetchAccount() {
  if (LIVE) return request('/account')
  await delay(200)
  return { customer: mock('aurie.customer', {}), addresses: mock('aurie.mock.addresses', []), wishlist: mock('aurie.wishlist', []) }
}

export async function updateProfile(patch) {
  if (LIVE) return request('/account', { method: 'PATCH', body: patch })
  return fetchAccount()
}

export async function saveAddresses(addresses) {
  if (LIVE) return request('/account/addresses', { method: 'PUT', body: { addresses } })
  save('aurie.mock.addresses', addresses)
  return fetchAccount()
}

export async function saveWishlist(slugs) {
  if (LIVE) return request('/account/wishlist', { method: 'PUT', body: { slugs } })
  return { wishlist: slugs }
}

export async function syncCart(lines) {
  if (!LIVE) return
  await request('/account/cart', {
    method: 'PUT',
    body: { lines: lines.map(({ productId, tierId, count, note }) => ({ productId, tierId, count, note: note || '' })) },
  })
}

export async function checkCoupon(code, items) {
  if (LIVE) return request('/account/coupon', { method: 'POST', body: { code, items } })
  await delay(400)
  if (code.toUpperCase() !== 'DEMO10') throw new Error('That code is not valid right now.')
  const subtotal = items.reduce((s, i) => s + (i.unitPrice || 0) * i.count, 0)
  return { code: 'DEMO10', discount: Math.floor(subtotal / 10), description: '10% off (demo)' }
}

export async function fetchReviewable() {
  if (LIVE) return (await request('/account/reviewable')).items
  return []
}

export async function postReview({ orderNumber, productId, rating, text, photo }) {
  const form = new FormData()
  form.append('orderNumber', orderNumber)
  form.append('productId', productId)
  form.append('rating', String(rating))
  form.append('text', text || '')
  if (photo) form.append('photo', photo)
  return request('/account/reviews', { method: 'POST', body: form })
}

export async function fetchReviews(slug) {
  if (LIVE) return request(`/products/${encodeURIComponent(slug)}/reviews`)
  return { reviews: [], summary: { average: 0, count: 0 } }
}

export async function findGifts(query) {
  if (LIVE) return request('/ai/gift-finder', { method: 'POST', body: { query } })
  await delay(900)
  return { intro: 'A few ideas (demo mode):', picks: [{ id: 'peony-bloom', reason: 'Looks like a fresh flower, burns for hours.' }, { id: 'cold-brew', reason: 'For the coffee person.' }] }
}

export async function matchPhoto(file) {
  const form = new FormData()
  form.append('photo', file)
  return request('/ai/match-photo', { method: 'POST', body: form })
}
