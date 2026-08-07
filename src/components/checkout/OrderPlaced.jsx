import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import Flame from '../ui/Flame.jsx'
import { rupees, longDate } from '../../lib/format.js'

export default function OrderPlaced({ order }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <Flame className="mx-auto h-12 w-7 text-ember" />
      <h1 className="mt-6 font-display text-[32px] leading-tight text-soot">Order placed</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-smoke">
        We have sent a confirmation to your email. Pouring starts tomorrow morning and you will get a tracking
        number the day it ships.
      </p>

      <dl className="mt-8 divide-y divide-wick rounded-card border border-wick bg-wax text-left">
        <Row term="Order number" value={order.id} mono />
        <Row term="Total" value={rupees(order.total)} />
        <Row term="Payment" value={order.payment === 'upi' ? 'Paid by UPI' : 'Cash on delivery'} />
        <Row term="Expected by" value={longDate(order.expectedBy)} />
        <Row term="Delivering to" value={`${order.address.line1}, ${order.address.city} ${order.address.pincode}`} />
      </dl>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/orders">
          Track this order
        </Button>
        <Button as={Link} to="/shop" variant="outline">
          Keep browsing
        </Button>
      </div>
    </div>
  )
}

function Row({ term, value, mono }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3.5">
      <dt className="label">{term}</dt>
      <dd className={`text-right text-[14px] text-ink ${mono ? 'font-display tabular-nums' : ''}`}>{value}</dd>
    </div>
  )
}
