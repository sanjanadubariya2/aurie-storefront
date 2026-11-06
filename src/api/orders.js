import { LIVE, request, delay } from './client.js'
import { estimateDelivery } from '../lib/format.js'
import { read, write } from '../lib/storage.js'

/**
 * Backend contract
 *   POST /orders          { items, address, payment } -> { order }
 *   GET  /orders                                      -> { orders: [...] }
 *
 * POST /orders is cash on delivery only. UPI goes through api/payments.js
 * (Razorpay), so the server — not this app — decides an order is paid.
 */

const KEY = 'aurie.orders'

export const STATUS_FLOW = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']

export const STATUS_COPY = {
  placed: { title: 'Order placed', body: 'We have your order and payment method.' },
  confirmed: { title: 'Pouring started', body: 'Your candles are being poured and cured.' },
  shipped: { title: 'Shipped', body: 'Handed to the courier with your tracking number.' },
  out_for_delivery: { title: 'Out for delivery', body: 'Arriving today. Keep your phone reachable.' },
  delivered: { title: 'Delivered', body: 'Trim the wick to 5mm before the first burn.' },
  cancelled: { title: 'Cancelled', body: 'This order was cancelled. UPI payments are refunded to the same account in 5–7 working days.' },
}

/** Never crash on a status this build does not know — show it plainly instead. */
export const statusCopy = (status) =>
  STATUS_COPY[status] || { title: String(status || 'Updated').replace(/_/g, ' '), body: '' }

export async function placeOrder({ items, address, payment, total, gift, neededBy }) {
  if (LIVE) {
    const { order } = await request('/orders', { method: 'POST', body: { items, address, payment, total, gift, neededBy } })
    return order
  }
  await delay(900)
  const order = {
    id: `AUR${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    items,
    address,
    payment,
    total,
    status: 'placed',
    paymentStatus: payment === 'upi' ? 'paid' : 'pending',
    trackingNumber: null,
    courier: null,
    expectedBy: estimateDelivery(),
  }
  write(KEY, [order, ...read(KEY, [])])
  return order
}

export async function fetchOrders() {
  if (LIVE) return request('/orders').then((d) => d.orders)
  await delay(400)
  return read(KEY, [])
}

/** POST /orders/:ref/cancel — only while the order is still "placed". Paid UPI is refunded automatically. */
export async function cancelOrder(ref) {
  if (LIVE) return (await request(`/orders/${encodeURIComponent(ref)}/cancel`, { method: 'POST' })).order
  await delay(500)
  const list = read(KEY, []).map((o) => (o.id === ref ? { ...o, status: 'cancelled' } : o))
  write(KEY, list)
  return list.find((o) => o.id === ref)
}

/** GET /shipping/serviceability?pincode= -> { live, available, codAvailable, transitDays, estimateDays } */
export async function checkPincode(pincode) {
  if (LIVE) return request(`/shipping/serviceability?pincode=${encodeURIComponent(pincode)}`)
  await delay(400)
  return { live: false, available: null, estimateDays: 7 }
}
