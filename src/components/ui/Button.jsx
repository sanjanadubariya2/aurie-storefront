const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium transition-all duration-200 ' +
  'disabled:opacity-45 disabled:pointer-events-none select-none active:scale-[0.97]'

const variants = {
  primary: 'bg-ember text-wax hover:bg-[#A93A19] shadow-[0_10px_24px_-14px_rgba(193,68,30,0.9)]',
  dark: 'bg-soot text-wax hover:bg-[#241F17]',
  outline: 'border border-soot/25 text-soot hover:border-soot hover:bg-soot hover:text-wax',
  ghost: 'text-soot hover:bg-soot/[0.06]',
  quiet: 'text-smoke hover:text-soot underline underline-offset-4 decoration-wick',
}

const sizes = {
  sm: 'h-9 px-4 text-[13px] rounded-full',
  md: 'h-11 px-6 text-sm rounded-full',
  lg: 'h-13 px-8 text-[15px] rounded-full',
  block: 'h-12 w-full text-sm rounded-full',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <Tag
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={Tag === 'button' ? loading || props.disabled : undefined}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </Tag>
  )
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  )
}
