import React from 'react'

interface SkeletonProps {
  className?: string
  height?: string
  width?: string
}

// Individual skeleton element
export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  height = 'h-4', 
  width = 'w-full' 
}) => {
  return (
    <div 
      className={`${height} ${width} bg-slate-200 rounded animate-pulse ${className}`}
    />
  )
}

// Card skeleton for dashboard stats
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

// Table row skeleton
export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24 mb-1" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="text-right">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-16 h-6 rounded" />
      </div>
    </div>
  )
}

// Chart skeleton
export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-2 mb-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="p-6">
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Search bar skeleton
export const SearchBarSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-32 h-12 rounded-xl" />
          <Skeleton className="w-20 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Pagination skeleton
export const PaginationSkeleton: React.FC = () => {
  return (
    <div className="p-6 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center space-x-2">
          <Skeleton className="w-16 h-8 rounded-lg" />
          <Skeleton className="w-16 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Modal skeleton
export const ModalSkeleton: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="w-6 h-6 rounded" />
        </div>
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 mt-6">
          <Skeleton className="w-20 h-10 rounded-lg" />
          <Skeleton className="w-20 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Dashboard overview skeleton
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Analytics skeleton
export const AnalyticsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Users page skeleton
export const UsersSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center space-x-3">
          <Skeleton className="w-24 h-10 rounded-lg" />
          <Skeleton className="w-24 h-10 rounded-lg" />
        </div>
      </div>

      {/* Search and Filters */}
      <SearchBarSkeleton />

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </div>
        </div>
        <PaginationSkeleton />
      </div>
    </div>
  )
}

// Withdrawals page skeleton
export const WithdrawalsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>

      {/* Search and Filters */}
      <SearchBarSkeleton />

      {/* Withdrawals List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRowSkeleton key={index} />
            ))}
          </div>
        </div>
        <PaginationSkeleton />
      </div>
    </div>
  )
}

// System stats skeleton
export const SystemStatsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="w-24 h-10 rounded-lg" />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

