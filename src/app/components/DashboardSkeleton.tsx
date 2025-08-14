// components/DashboardSkeleton.tsx
export default function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-0 space-y-6">
      {/* Desktop Grid Layout */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-6 md:space-y-0">
        {/* Left Column - Main Content */}
        <div className="md:col-span-8 space-y-6">
          {/* Welcome Header Skeleton */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-8 bg-white/20 rounded-lg mb-2 w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-1/2 animate-pulse"></div>
                <div className="h-6 bg-yellow-500/20 rounded-lg mt-3 w-full animate-pulse"></div>
              </div>
              <div className="text-right ml-4">
                <div className="h-3 bg-white/20 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-4 mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-slate-200 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-24 animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Earning Opportunities Skeleton */}
          <div>
            <div className="mb-4">
              <div className="h-6 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-64 animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl p-6 shadow-lg">
                  <div className="bg-white/20 w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"></div>
                  <div className="h-5 bg-white/20 rounded w-24 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-3 bg-white/20 rounded w-full mb-4 animate-pulse"></div>
                  <div className="h-10 bg-white/20 rounded-xl w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
            <div className="h-5 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white border border-slate-200 h-12 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="md:col-span-4 space-y-6">
          {/* Account Status Skeleton */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-24 mb-1 animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
          </div>

          {/* Referral Code Skeleton */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-slate-200 rounded w-40 mb-2 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
            
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="h-8 bg-slate-300 rounded w-32 animate-pulse"></div>
                <div className="flex space-x-2">
                  <div className="w-10 h-10 bg-slate-300 rounded-lg animate-pulse"></div>
                  <div className="w-10 h-10 bg-slate-300 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <div className="h-10 bg-slate-200 rounded-xl w-full animate-pulse"></div>
          </div>

          {/* Balance Card Skeleton */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="h-3 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="h-3 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-slate-200 rounded w-20 animate-pulse"></div>
              </div>
            </div>
            <div className="h-10 bg-slate-200 rounded-xl w-full mt-4 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        {/* Welcome Header Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-6 bg-white/20 rounded-lg mb-2 w-3/4 animate-pulse"></div>
              <div className="h-3 bg-white/20 rounded w-1/2 animate-pulse"></div>
              <div className="h-5 bg-yellow-500/20 rounded-lg mt-3 w-full animate-pulse"></div>
            </div>
            <div className="text-right ml-4">
              <div className="h-3 bg-white/20 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-4 mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Quick Stats Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-4 h-4 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-12 animate-pulse"></div>
              </div>
              <div className="h-5 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-20 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Account Status Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-28 animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
        </div>

        {/* Referral Code Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-40 animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-slate-300 rounded w-28 animate-pulse"></div>
              <div className="flex space-x-2">
                <div className="w-10 h-10 bg-slate-300 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-slate-300 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="h-10 bg-slate-200 rounded-xl w-full animate-pulse"></div>
        </div>

        {/* Balance Card Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="h-5 bg-slate-200 rounded w-28 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="h-3 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-14 animate-pulse"></div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="h-3 bg-slate-200 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-14 animate-pulse"></div>
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-200 rounded w-12 animate-pulse"></div>
              <div className="h-5 bg-slate-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-full mt-4 animate-pulse"></div>
        </div>

        {/* Earning Opportunities Skeleton */}
        <div>
          <div className="mb-4">
            <div className="h-5 bg-slate-200 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-3 bg-slate-200 rounded w-56 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl p-6 shadow-lg">
                <div className="bg-white/20 w-12 h-12 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-20 mx-auto mb-2 animate-pulse"></div>
                <div className="h-3 bg-white/20 rounded w-full mb-4 animate-pulse"></div>
                <div className="h-10 bg-white/20 rounded-xl w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
          <div className="h-5 bg-slate-200 rounded w-28 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-slate-200 h-12 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
