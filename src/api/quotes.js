import { LIVE, request, delay } from './client.js'
import { read, write } from '../lib/storage.js'

/**
 * Backend contract (customer session required)
 *   POST /quotes       multipart { productId?, occasion?, budget?, message?, details, neededBy?, images[] } -> { quote }
 *   GET  /quotes                                                                                          -> { quotes }
 *   GET  /quotes/:id                                                                                      -> { quote }
 *   POST /payments/quote/:id   { address, gift? } -> { razorpayOrderId, amount, currency, keyId, orderId }
 */

const KEY = 'aurie.mock.quotes'

export async function createQuote(fields, files = []) {
  if (LIVE) {
    const form = new FormData()
    Object.entries(fields).forEach(([k, v]) => v !== undefined && v !== null && form.append(k, v))
    files.forEach((f) => form.append('images', f))
    return (await request('/quotes', { method: 'POST', body: form })).quote
  }
  await delay(700)
  const quote = {
    ...fields,
    id: `mock-${Date.now()}`,
    number: `Q${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'new',
    price: null,
    images: files.map((f) => URL.createObjectURL(f)),
    createdAt: new Date().toISOString(),
  }
  write(KEY, [quote, ...read(KEY, [])])
  return quote
}

export async function fetchQuotes() {
  if (LIVE) return (await request('/quotes')).quotes
  await delay(300)
  return read(KEY, [])
}

export async function fetchQuote(id) {
  if (LIVE) return (await request(`/quotes/${id}`)).quote
  await delay(300)
  const q = read(KEY, []).find((x) => x.id === id)
  if (!q) throw Object.assign(new Error('Quote not found'), { status: 404 })
  return q
}

export async function payQuote(id, { address, gift }) {
  return request(`/payments/quote/${id}`, { method: 'POST', body: { address, gift } })
}
