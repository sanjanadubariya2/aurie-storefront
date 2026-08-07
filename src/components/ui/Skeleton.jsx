export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-wick/60 ${className}`} />
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full rounded-card" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  )
}
