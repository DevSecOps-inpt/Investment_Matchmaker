import React from 'react'

export const StartupDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs Skeleton */}
      <div className="flex items-center space-x-2 text-sm">
        <div className="h-4 bg-muted/20 rounded animate-pulse w-16"></div>
        <div className="h-4 bg-muted/20 rounded animate-pulse w-4"></div>
        <div className="h-4 bg-muted/20 rounded animate-pulse w-20"></div>
        <div className="h-4 bg-muted/20 rounded animate-pulse w-4"></div>
        <div className="h-4 bg-muted/20 rounded animate-pulse w-32"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="h-12 bg-muted/20 rounded animate-pulse w-3/4"></div>
            <div className="flex gap-3">
              <div className="h-6 bg-muted/20 rounded animate-pulse w-20"></div>
              <div className="h-6 bg-muted/20 rounded animate-pulse w-24"></div>
            </div>
            <div className="space-y-2">
              <div className="h-5 bg-muted/20 rounded animate-pulse w-full"></div>
              <div className="h-5 bg-muted/20 rounded animate-pulse w-5/6"></div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="border-b border-border">
            <div className="flex space-x-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted/20 rounded animate-pulse w-20"></div>
              ))}
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="min-h-[400px] space-y-6">
            <div className="h-8 bg-muted/20 rounded animate-pulse w-32"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/20 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-muted/20 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 space-y-4">
              <div className="h-6 bg-muted/20 rounded animate-pulse w-24"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 bg-muted/20 rounded animate-pulse w-20"></div>
                    <div className="h-5 bg-muted/20 rounded animate-pulse w-32"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
