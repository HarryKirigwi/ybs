// components/ProfileSkeleton.tsx
export default function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-6 bg-white/20 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-40 animate-pulse"></div>
          </div>
          <div className="w-8 h-8 bg-white/20 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Information Skeleton */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
                <div className="h-5 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Status Skeleton */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings Skeleton */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
                <div>
                  <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="w-12 h-6 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Information Skeleton */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="h-6 bg-slate-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-slate-200 rounded animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
