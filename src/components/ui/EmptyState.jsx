/** `level={1}` when this is the whole page (signed out, not found…), so the
 *  page still has exactly one h1; otherwise it sits under the page's h1. */
export default function EmptyState({ title, body, action, level = 2 }) {
  const Heading = `h${level}`
  return (
    <div className="mx-auto max-w-sm py-16 text-center">
      <Heading className="font-display text-2xl text-soot">{title}</Heading>
      <p className="mt-2 text-[15px] text-smoke">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  )
}
