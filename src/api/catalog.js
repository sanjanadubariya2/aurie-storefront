import { LIVE, request, delay } from './client.js'
import { products as seed, collections as seedCollections } from '../data/products.js'

/**
 * Backend contract
 *   GET /products     -> { products: [...] }   same shape as src/data/products.js
 *   GET /collections  -> { collections: [...] }
 */

export async function fetchProducts() {
  if (LIVE) return request('/products', { auth: false }).then((d) => d.products)
  await delay(400)
  return seed
}

export async function fetchCollections() {
  if (LIVE) return request('/collections', { auth: false }).then((d) => d.collections)
  await delay(200)
  return seedCollections
}
