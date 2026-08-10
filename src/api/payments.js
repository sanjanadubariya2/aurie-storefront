import { LIVE, request, delay } from './client.js'

/**
 * Backend contract
 *   POST /payments/order    { items, address }                                          -> { razorpayOrderId, amount, currency, keyId, orderId }
 *   POST /payments/verify   { razorpay_order_id, razorpay_payment_id, razorpay_signature } -> { order }
 *
 * The cart goes to the server and the server decides what it costs — this
 * file never computes or sends an amount.
 */

export async function createRazorpayOrder({ items, address }) {
  if (LIVE) return request('/payments/order', { method: 'POST', body: { items, address } })
  await delay(400)
  return {
    razorpayOrderId: `order_mock_${Date.now()}`,
    amount: 0,
    currency: 'INR',
    keyId: 'rzp_test_mock',
    orderId: `AUR${Math.floor(100000 + Math.random() * 900000)}`,
  }
}

export async function verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (LIVE) {
    return request('/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      },
    })
  }
  await delay(300)
  return { order: null }
}
