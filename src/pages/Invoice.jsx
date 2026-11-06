import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchOrders } from '../api/orders.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useSettings } from '../context/ShopContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { rupees, longDate } from '../lib/format.js'

/**
 * The customer's copy of their invoice — print or "Save as PDF" from the
 * browser. Business details and the GST rate come from GET /settings, so this
 * matches the copy the shop prints from the admin panel.
 */
export default function Invoice() {
  const { ref } = useParams()
  const { customer } = useAuth()
  const { business } = useSettings()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  useDocumentMeta({ title: `Invoice ${ref}`, path: `/orders/${ref}/invoice` })

  useEffect(() => {
    if (!customer) return
    fetchOrders()
      .then((list) => {
        const found = list.find((o) => o.id === ref)
        if (!found) throw new Error('We could not find that order on this account.')
        if (!found.invoiceNumber) throw new Error('This order does not have an invoice yet — it is issued once payment is confirmed.')
        setOrder(found)
      })
      .catch((e) => setError(e.message))
  }, [customer, ref])

  if (!customer) return <p className="mx-auto max-w-[800px] px-5 py-20 text-smoke">Sign in to see your invoice.</p>
  if (error) {
    return (
      <div className="mx-auto max-w-[800px] px-5 py-20">
        <p className="text-ink">{error}</p>
        <Link to="/orders" className="mt-4 inline-block text-[14px] underline underline-offset-4">
          Back to orders
        </Link>
      </div>
    )
  }
  if (!order || !business) return <p className="mx-auto max-w-[800px] px-5 py-20 text-smoke">Preparing your invoice…</p>

  const taxed = Boolean(business.gstin) && business.gstRate > 0
  const rate = business.gstRate / 100
  const net = (gross) => (taxed ? gross / (1 + rate) : gross)
  const intra = (order.address.state || '').toLowerCase() === (business.state || '').toLowerCase()
  const lines = [
    ...order.items.map((l) => ({ name: `${l.name} — ${l.tierLabel}`, qty: l.count, unit: l.unitPrice, gross: l.unitPrice * l.count })),
    ...(order.shipping ? [{ name: 'Delivery', qty: 1, unit: order.shipping, gross: order.shipping }] : []),
    ...(order.giftWrapFee ? [{ name: 'Gift wrap', qty: 1, unit: order.giftWrapFee, gross: order.giftWrapFee }] : []),
  ]
  const taxable = lines.reduce((s, l) => s + net(l.gross), 0)
  const tax = order.total - taxable

  return (
    <div className="mx-auto max-w-[820px] px-5 pb-20 pt-6 print:p-0">
      <div className="mb-6 flex justify-between print:hidden">
        <Link to="/orders" className="text-[14px] text-smoke underline underline-offset-4 hover:text-soot">
          Back to orders
        </Link>
        <button onClick={() => window.print()} className="rounded-full bg-soot px-4 py-2 text-[13px] text-wax">
          Print or save as PDF
        </button>
      </div>

      <article className="rounded-card bg-white p-8 text-[13px] text-soot shadow-lift print:rounded-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between border-b-2 border-soot pb-4">
          <div>
            <p className="font-display text-[24px] font-semibold tracking-[0.14em]">AURIE</p>
            <p className="mt-1 text-[12px] leading-snug text-smoke">
              {business.legalName}
              <br />
              {business.address}
              {business.gstin && (
                <>
                  <br />
                  GSTIN {business.gstin}
                </>
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-[20px]">{taxed ? 'Tax invoice' : 'Bill of supply'}</p>
            <p className="mt-1 text-[12px] leading-snug text-smoke">
              {order.invoiceNumber}
              <br />
              Order {order.id}
              <br />
              {longDate(order.createdAt)}
            </p>
          </div>
        </header>

        <p className="mt-5 text-[12px] leading-snug">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-smoke">Billed to</span>
          <br />
          {order.address.fullName}, {order.address.line1}, {order.address.city}, {order.address.state} {order.address.pincode}
          <br />
          {customer.email}
        </p>

        <table className="mt-5 w-full text-[12px]">
          <thead>
            <tr className="border-y border-soot text-left">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Rate</th>
              <th className="py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={i} className="border-b border-wick">
                <td className="py-2">{l.name}</td>
                <td className="py-2 text-right tabular-nums">{l.qty}</td>
                <td className="py-2 text-right tabular-nums">{rupees(l.unit)}</td>
                <td className="py-2 text-right tabular-nums">{rupees(l.gross)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-[260px] space-y-1 text-[12px]">
          {taxed && (
            <>
              <Line k="Taxable value" v={`₹${taxable.toFixed(2)}`} />
              {intra ? (
                <>
                  <Line k={`CGST ${business.gstRate / 2}%`} v={`₹${(tax / 2).toFixed(2)}`} />
                  <Line k={`SGST ${business.gstRate / 2}%`} v={`₹${(tax / 2).toFixed(2)}`} />
                </>
              ) : (
                <Line k={`IGST ${business.gstRate}%`} v={`₹${tax.toFixed(2)}`} />
              )}
            </>
          )}
          <div className="flex justify-between border-t border-soot pt-2 font-display text-[16px]">
            <span>Total</span>
            <span>{rupees(order.total)}</span>
          </div>
          <Line k="Paid by" v={order.payment === 'upi' ? 'UPI' : 'Cash on delivery'} />
          {order.refundedTotal > 0 && <Line k="Refunded" v={`− ${rupees(order.refundedTotal)}`} />}
        </div>

        <p className="mt-8 text-[11px] text-smoke">
          {taxed ? 'Prices are inclusive of GST.' : 'Not registered under GST — no tax charged.'} Computer-generated; no signature required.
        </p>
      </article>
    </div>
  )
}

function Line({ k, v }) {
  return (
    <div className="flex justify-between">
      <span className="text-smoke">{k}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  )
}
