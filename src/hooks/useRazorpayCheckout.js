import { useCallback } from 'react'
import { useRazorpay } from './useRazorpay.js'
import { verifyPayment } from '../api/payments.js'

/**
 * One payment flow for everything that is paid by UPI — a cart or an accepted
 * custom quote:
 *   1. `create()` asks the API to create the Aurie order + Razorpay order
 *   2. the Razorpay widget takes the money
 *   3. /payments/verify checks the signature and returns the confirmed order
 * Rejects with `.dismissed = true` if the customer closes the widget.
 */
export function useRazorpayCheckout() {
  const openRazorpay = useRazorpay()

  return useCallback(
    async ({ create, prefill, description }) => {
      const { razorpayOrderId, amount, currency, keyId, orderId } = await create()
      const result = await openRazorpay({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'Aurie',
        description: description || `Order ${orderId}`,
        prefill,
        theme: { color: '#C1441E' },
      })
      const { order } = await verifyPayment({
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      })
      return order
    },
    [openRazorpay],
  )
}
