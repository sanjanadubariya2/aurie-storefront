import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import OrderTimeline from '../components/orders/OrderTimeline.jsx'
import { fetchOrders, statusCopy } from '../api/orders.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useDocumentMeta } from '../hooks/useDocumentMeta.js'
import { rupees, shortDate, longDate, paymentLabel } from '../lib/format.js'

export default function Orders() {
  const { customer, setAuthOpen } = useAuth()
  useDocumentMeta({ title: 'Your orders', path: '/orders' })
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState(null)

  const load = () => {
    setError('')
    setOrders(null)
    fetchOrders()
      .then((list) => {
        setOrders(list)
        setOpenId(list[0]?.id ?? null)
      })
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    if (customer) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer])

  if (!customer) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 lg:px-8">
        <EmptyState
          title="Sign in to see your orders"
          body="Your order history is tied to the email you ordered with."
          action={<Button onClick={() => setAuthOpen(true)}>Sign in</Button>}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px] px-5 pb-24 lg:px-8">
      <header className="py-8 sm:py-10">
        <h1 className="font-display text-[34px] leading-tight text-soot sm:text-[42px]">Your orders</h1>
        <p className="mt-2 text-[15px] text-smoke">
          Every status change is also emailed to {customer.email}.
        </p>
      </header>

      {error ? (
        <EmptyState
          title="Could not load your orders"
          body={error}
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      ) : orders === null ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-card" />
          <Skeleton className="h-28 w-full rounded-card" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          body="Once you place one, its progress from pouring to your door shows up here."
          action={
            <Button as={Link} to="/shop">
              Go to the catalogue
            </Button>
          }
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const expanded = openId === order.id
            return (
              <li key={order.id} className="overflow-hidden rounded-card border border-wick bg-wax">
                <button
                  onClick={() => setOpenId(expanded ? null : order.id)}
                  aria-expanded={expanded}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((i) => (
                      <img
                        key={i.key}
                        src={i.image}
                        alt=""
                        className="h-12 w-12 rounded-lg border-2 border-wax object-cover"
                      />
                    ))}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[17px] text-soot">{statusCopy(order.status).title}</p>
                    <p className="mt-0.5 text-[13px] text-smoke">
                      {order.id} · {shortDate(order.createdAt)} · {rupees(order.total)}
                    </p>
                  </div>

                  <svg
                    viewBox="0 0 12 8"
                    className={`h-3 w-3 shrink-0 text-smoke transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M1 1l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {expanded && (
                  <div className="animate-fadeIn border-t border-wick p-5">
                    <dl className="grid gap-4 sm:grid-cols-3">
                      <Detail term="Expected by" value={longDate(order.expectedBy)} />
                      <Detail
                        term="Tracking"
                        value={
                          order.trackingNumber
                            ? `${order.courier} · ${order.trackingNumber}`
                            : 'Added the day it ships'
                        }
                      />
                      <Detail term="Payment" value={paymentLabel(order)} />
                    </dl>

                    <OrderTimeline status={order.status} />

                    <div className="rule my-4" />

                    <ul className="space-y-2.5">
                      {order.items.map((i) => (
                        <li key={i.key} className="flex items-center gap-3 text-[14px]">
                          <img src={i.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          <span className="flex-1 text-ink">
                            {i.name} <span className="text-smoke">· {i.tierLabel} × {i.count}</span>
                          </span>
                          <span className="tabular-nums text-ink">{rupees(i.unitPrice * i.count)}</span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-5 text-[13px] text-smoke">
                      Delivering to {order.address.fullName}, {order.address.line1}, {order.address.city}{' '}
                      {order.address.pincode}
                    </p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Detail({ term, value }) {
  return (
    <div>
      <dt className="label">{term}</dt>
      <dd className="mt-1 text-[14px] text-ink">{value}</dd>
    </div>
  )
}
