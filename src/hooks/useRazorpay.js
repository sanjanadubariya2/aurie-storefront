import { useCallback } from 'react'

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise = null

/** Injects Razorpay's hosted script once, only when someone actually calls
 *  this — not from index.html, which would load it for every visitor whether
 *  or not they ever reach payment. */
function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => {
        scriptPromise = null // let a later attempt try fetching again instead of hanging on a dead promise
        reject(
          new Error(
            'Could not load the payment page — an ad blocker or a firewall may be blocking it. Try cash on delivery instead.',
          ),
        )
      }
      document.body.appendChild(script)
    })
  }
  return scriptPromise
}

/**
 * Returns a function that opens Razorpay Checkout with the given options and
 * resolves with `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
 * on success.
 *
 * Rejects on failure or if the customer just closes the widget — in the
 * latter case the rejected Error has `.dismissed = true`, so callers can tell
 * "changed their mind" apart from "something actually went wrong".
 */
export function useRazorpay() {
  return useCallback(async (options) => {
    await loadRazorpayScript()

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        ...options,
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => {
            const err = new Error('Payment cancelled.')
            err.dismissed = true
            reject(err)
          },
        },
      })
      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed. Try again or pay cash on delivery.'))
      })
      rzp.open()
    })
  }, [])
}
