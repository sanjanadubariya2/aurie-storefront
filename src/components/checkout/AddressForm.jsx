import Field, { Input, Textarea } from '../ui/Field.jsx'

const STATES = [
  'Maharashtra', 'Gujarat', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Telangana', 'West Bengal',
  'Rajasthan', 'Uttar Pradesh', 'Madhya Pradesh', 'Kerala', 'Punjab', 'Haryana', 'Goa', 'Other',
]

export default function AddressForm({ value, errors, onChange }) {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value })

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" id="fullName" error={errors.fullName} className="sm:col-span-2">
        <Input id="fullName" autoComplete="name" value={value.fullName} invalid={errors.fullName} onChange={set('fullName')} />
      </Field>

      <Field
        label="Mobile number"
        id="phone"
        error={errors.phone}
        hint="We verify this before the order is placed"
        className="sm:col-span-2"
      >
        <div className="flex items-center gap-2">
          <span className="grid h-11 shrink-0 place-items-center rounded-xl border border-wick bg-ash px-3 text-[15px] text-smoke">
            +91
          </span>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            placeholder="9876543210"
            value={value.phone}
            invalid={errors.phone}
            onChange={(e) => onChange({ ...value, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
          />
        </div>
      </Field>

      <Field label="Flat, building, street" id="line1" error={errors.line1} className="sm:col-span-2">
        <Input id="line1" autoComplete="address-line1" value={value.line1} invalid={errors.line1} onChange={set('line1')} />
      </Field>

      <Field label="Area or landmark" id="line2" className="sm:col-span-2">
        <Input id="line2" autoComplete="address-line2" value={value.line2} onChange={set('line2')} placeholder="Optional" />
      </Field>

      <Field label="City" id="city" error={errors.city}>
        <Input id="city" autoComplete="address-level2" value={value.city} invalid={errors.city} onChange={set('city')} />
      </Field>

      <Field label="PIN code" id="pincode" error={errors.pincode}>
        <Input
          id="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={value.pincode}
          invalid={errors.pincode}
          onChange={(e) => onChange({ ...value, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
        />
      </Field>

      <Field label="State" id="state" error={errors.state} className="sm:col-span-2">
        <select
          id="state"
          value={value.state}
          onChange={set('state')}
          className={`h-11 w-full rounded-xl border bg-wax px-3 text-[15px] text-ink focus:outline-none focus-visible:border-ember
            ${errors.state ? 'border-ember' : 'border-wick'}`}
        >
          <option value="">Select a state</option>
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>

      <Field label="Delivery instructions" id="notes" className="sm:col-span-2">
        <Textarea
          id="notes"
          value={value.notes}
          onChange={set('notes')}
          placeholder="Optional — gate code, best time to deliver, or leave with a neighbour"
        />
      </Field>
    </div>
  )
}
