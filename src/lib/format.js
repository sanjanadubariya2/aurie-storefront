export const rupees = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export const longDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })

/** What to call an order's payment. A UPI order the server has not seen paid
 *  must never read "Paid". Mock orders carry no paymentStatus and count as paid. */
export const paymentLabel = (order) => {
  if (order.payment !== 'upi') return 'Cash on delivery'
  return order.paymentStatus && order.paymentStatus !== 'paid' ? 'UPI — payment not confirmed' : 'Paid by UPI'
}

/** Made-to-order lead time: 4 days to pour and cure, 3 days to ship. */
export const estimateDelivery = (from = new Date()) => {
  const d = new Date(from)
  d.setDate(d.getDate() + 7)
  return d.toISOString()
}
