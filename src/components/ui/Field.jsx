export default function Field({ label, hint, error, id, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-1.5 block">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-ember">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-smoke">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ invalid, className = '', ...props }) {
  return (
    <input
      className={`h-11 w-full rounded-xl border bg-wax px-3.5 text-[15px] text-ink placeholder:text-smoke/60
        transition-colors focus:outline-none focus-visible:border-ember
        ${invalid ? 'border-ember' : 'border-wick'} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full rounded-xl border border-wick bg-wax px-3.5 py-2.5 text-[15px] text-ink
        placeholder:text-smoke/60 focus:outline-none focus-visible:border-ember ${className}`}
      {...props}
    />
  )
}
