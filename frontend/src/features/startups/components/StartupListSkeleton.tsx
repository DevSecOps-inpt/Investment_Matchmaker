import React from 'react'

export const StartupListSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-9 bg-muted/20 rounded animate-pulse w-80"></div>
          <div className="h-5 bg-muted/20 rounded animate-pulse w-64"></div>
        </div>
        <div className="h-10 bg-muted/20 rounded animate-pulse w-32"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-muted/20 rounded animate-pulse w-24"></div>
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-muted/20 rounded animate-pulse w-20"></div>
          ))}
        </div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card p-6 space-y-4">
            <div className="space-y-3">
              <div className="h-6 bg-muted/20 rounded animate-pulse w-3/4"></div>
              <div className="flex gap-2">
                <div className="h-5 bg-muted/20 rounded animate-pulse w-16"></div>
                <div className="h-5 bg-muted/20 rounded animate-pulse w-20"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 bg-muted/20 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse w-4/6"></div>
            </div>

            <div className="flex gap-2">
              <div className="h-5 bg-muted/20 rounded animate-pulse w-16"></div>
              <div className="h-5 bg-muted/20 rounded animate-pulse w-20"></div>
            </div>

            <div className="h-12 bg-muted/20 rounded animate-pulse w-full"></div>

            <div className="flex justify-between text-xs">
              <div className="h-3 bg-muted/20 rounded animate-pulse w-20"></div>
              <div className="h-3 bg-muted/20 rounded animate-pulse w-16"></div>
            </div>

            <div className="flex gap-2">
              <div className="h-10 bg-muted/20 rounded animate-pulse flex-1"></div>
              <div className="h-10 bg-muted/20 rounded animate-pulse flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
