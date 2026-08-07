import { useEffect, useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import TierPicker from './TierPicker.jsx'
import { Textarea } from '../ui/Field.jsx'
import { rupees } from '../../lib/format.js'
import { useCart } from '../../context/CartContext.jsx'
import { collectionOf } from '../../data/products.js'

const WHATSAPP = import.meta.env.VITE_WHATSAPP || '919769469765'

export default function QuickView({ product, onClose }) {
  const { add } = useCart()
  const [tier, setTier] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    setTier(product?.tiers?.[0] || null)
    setNote('')
  }, [product])

  if (!product) return null
  const collection = collectionOf(product.collection)

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={product.name} size="lg">
      <div className="grid sm:grid-cols-2">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover sm:aspect-auto sm:h-full"
        />

        <div className="flex max-h-[70vh] flex-col overflow-y-auto p-6 sm:max-h-[560px] sm:p-7">
          <span className="label">{collection?.name}</span>
          <h2 className="mt-1.5 font-display text-[26px] leading-tight text-soot">{product.name}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-smoke">{product.blurb}</p>

          {(product.scent || product.burn) && (
            <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-wick py-4">
              {product.scent && (
                <div>
                  <dt className="label">Scent</dt>
                  <dd className="mt-1 text-[14px] text-ink">{product.scent}</dd>
                </div>
              )}
              {product.burn && (
                <div>
                  <dt className="label">Burn time</dt>
                  <dd className="mt-1 text-[14px] text-ink">{product.burn}</dd>
                </div>
              )}
            </dl>
          )}

          {product.quote ? (
            <div className="mt-6">
              <p className="text-[15px] text-ink">
                Priced after we agree on the contents. Send us the occasion and a budget and we will come back with
                options.
              </p>
              <Button
                as="a"
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi Aurie, I'd like a quote for the ${product.name}.`)}`}
                target="_blank"
                rel="noreferrer"
                size="block"
                className="mt-5"
              >
                Ask on WhatsApp
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <span className="label mb-2 block">Choose a size</span>
                <TierPicker tiers={product.tiers} value={tier} onChange={setTier} />
              </div>

              <div className="mt-5">
                <label htmlFor="note" className="label mb-1.5 block">
                  Colour or scent request (optional)
                </label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. sage green, unscented, gift wrap in kraft paper"
                  maxLength={200}
                />
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-wick pt-5">
                <div>
                  <span className="label">Total</span>
                  <p className="font-display text-2xl tabular-nums text-soot">{rupees(tier?.price ?? 0)}</p>
                </div>
                <Button
                  onClick={() => {
                    add(product, tier, note.trim())
                    onClose()
                  }}
                >
                  Add to cart
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
