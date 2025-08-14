// components/TransactionSkeleton.tsx
export default function TransactionSkeleton() {
  return (
    <div className="flex items-center space-x-3 p-3">
      <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
      </div>
      <div className="text-right">
        <div className="h-4 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
        <div className="h-3 bg-slate-200 rounded w-12 animate-pulse"></div>
      </div>
    </div>
  )
}

export function TransactionListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4, 5].map((i) => (
        <TransactionSkeleton key={i} />
      ))}
    </div>
  )
}
