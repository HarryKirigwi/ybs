// components/TasksSkeleton.tsx
import { Calendar } from 'lucide-react'

export default function TasksSkeleton() {
  return (
    <div className="p-4 space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6" />
          <div>
            <div className="h-6 bg-white/20 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-48 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-4 bg-white/20 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-white/20 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-white/20 rounded w-20 animate-pulse"></div>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div className="bg-white h-2 rounded-full w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Daily Tasks Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-24 animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-48 animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 bg-slate-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Challenges Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-32 animate-pulse"></div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 rounded w-36 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-56 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-40 animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 bg-slate-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
