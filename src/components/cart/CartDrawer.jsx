import { useNavigate } from 'react-router-dom'
import Drawer from '../ui/Drawer.jsx'
import Button from '../ui/Button.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import CartLine from './CartLine.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useSettings } from '../../context/ShopContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { rupees } from '../../lib/format.js'

export default function CartDrawer() {
  const { lines, setCount, remove, subtotal, shipping, total, cartOpen, setCartOpen } = useCart()
  const { requireAuth } = useAuth()
  const navigate = useNavigate()

  const toCheckout = () => {
    setCartOpen(false)
    requireAuth(() => navigate('/checkout'))
  }

  const { freeShippingFrom } = useSettings()
  const away = freeShippingFrom - subtotal

  return (
    <Drawer
      open={cartOpen}
      onClose={() => setCartOpen(false)}
      title="Your cart"
      footer={
        lines.length > 0 && (
          <>
            <dl className="space-y-1.5 text-[14px]">
              <Row term="Subtotal" value={rupees(subtotal)} />
              <Row term="Delivery" value={shipping === 0 ? 'Free' : rupees(shipping)} />
              <div className="rule my-2.5" />
              <div className="flex items-baseline justify-between">
                <dt className="font-display text-[17px] text-soot">Total</dt>
                <dd className="font-display text-[20px] tabular-nums text-soot">{rupees(total)}</dd>
              </div>
            </dl>
            <Button onClick={toCheckout} size="block" className="mt-4">
              Checkout
            </Button>
            <p className="mt-2.5 text-center text-[12px] text-smoke">Made to order — allow 7 days</p>
          </>
        )
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          title="Nothing in here yet"
          body="Add a candle and it will show up here with its size and any colour notes."
          action={
            <Button variant="outline" onClick={() => setCartOpen(false)}>
              Keep browsing
            </Button>
          }
        />
      ) : (
        <div className="px-5">
          {away > 0 && (
            <p className="mt-4 rounded-xl bg-ash px-3.5 py-2.5 text-[13px] text-ink">
              {rupees(away)} more and delivery is on us.
            </p>
          )}
          <ul className="divide-y divide-wick">
            {lines.map((line) => (
              <CartLine
                key={line.key}
                line={line}
                onCount={(c) => setCount(line.key, c)}
                onRemove={() => remove(line.key)}
              />
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  )
}

function Row({ term, value }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-smoke">{term}</dt>
      <dd className="tabular-nums text-ink">{value}</dd>
    </div>
  )
}
