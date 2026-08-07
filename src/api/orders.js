import { LIVE, request, delay } from './client.js'
import { estimateDelivery } from '../lib/format.js'
import { read, write } from '../lib/storage.js'

/**
 * Backend contract
 *   POST /orders          { items, address, payment } -> { order }
 *   GET  /orders                                      -> { orders: [...] }
 *   POST /payments/upi    { orderId, amount }         -> { razorpayOrderId, key }
 *
 * For UPI, create the Razorpay order server-side and return its id here, then
 * open the Razorpay checkout from PaymentPicker. Never put the secret key in
 * this app.
 */

const KEY = 'aurie.orders'

export const STATUS_FLOW = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered']

export const STATUS_COPY = {
  placed: { title: 'Order placed', body: 'We have your order and payment method.' },
  confirmed: { title: 'Pouring started', body: 'Your candles are being poured and cured.' },
  shipped: { title: 'Shipped', body: 'Handed to the courier with your tracking number.' },
  out_for_delivery: { title: 'Out for delivery', body: 'Arriving today. Keep your phone reachable.' },
  delivered: { title: 'Delivered', body: 'Trim the wick to 5mm before the first burn.' },
}

export async function placeOrder({ items, address, payment, total }) {
  if (LIVE) {
    const { order } = await request('/orders', { method: 'POST', body: { items, address, payment, total } })
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
