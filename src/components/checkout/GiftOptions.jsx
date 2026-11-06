import { useState } from 'react'
import Field, { Input, Textarea } from '../ui/Field.jsx'
import { useSettings } from '../../context/ShopContext.jsx'
import { rupees, longDate } from '../../lib/format.js'

/** Optional extras at checkout: gift wrap, a card note, no prices on the slip,
 *  and the date it is needed by (so we can pour it in time). */
export default function GiftOptions({ gift, onGift, neededBy, onNeededBy, error }) {
  const { giftWrapFee = 49, giftNoteMaxChars = 200, leadTimeDays = 7 } = useSettings()
  const [open, setOpen] = useState(Boolean(gift.wrap || gift.note || gift.hidePrices || neededBy))
  const earliest = new Date(Date.now() + leadTimeDays * 86_400_000).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const set = (patch) => onGift({ ...gift, ...patch })

  return (
    <section className="mt-8 rounded-card border border-wick bg-wax/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span>
          <span className="block font-display text-[18px] text-soot">Is it a gift, or for a date?</span>
          <span className="mt-0.5 block text-[13px] text-smoke">Gift wrap, a card note, and when you need it by</span>
        </span>
        <span className={`text-[20px] text-smoke transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>

      {open && (
        <div className="animate-fadeIn space-y-5 border-t border-wick p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={gift.wrap} onChange={(e) => set({ wrap: e.target.checked })} className="mt-1 h-4 w-4 accent-[#C1441E]" />
            <span>
              <span className="block text-[15px] text-ink">
                Gift wrap <span className="text-smoke">+{rupees(giftWrapFee)}</span>
              </span>
              <span className="text-[13px] text-smoke">Kraft box, ribbon and dried flowers.</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={gift.hidePrices} onChange={(e) => set({ hidePrices: e.target.checked })} className="mt-1 h-4 w-4 accent-[#C1441E]" />
            <span>
              <span className="block text-[15px] text-ink">Hide prices</span>
              <span className="text-[13px] text-smoke">No prices on the packing slip — handy when sending to someone else.</span>
            </span>
          </label>

          <Field label="Note for the card" id="giftNote" hint={`${gift.note.length}/${giftNoteMaxChars} · handwritten on a card in the box`}>
            <Textarea
              id="giftNote"
              rows={2}
              maxLength={giftNoteMaxChars}
              value={gift.note}
              onChange={(e) => set({ note: e.target.value })}
              placeholder="Happy Diwali, Maa — with love from Riya"
            />
          </Field>

          <Field label="Need it by a date?" id="neededBy" error={error} hint={`Earliest we can promise: ${longDate(earliest)}`}>
            <Input id="neededBy" type="date" min={earliest} value={neededBy} invalid={error} onChange={(e) => onNeededBy(e.target.value)} className="max-w-[220px]" />
          </Field>
        </div>
      )}
    </section>
  )
}
