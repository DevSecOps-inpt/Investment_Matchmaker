import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { startupsApi } from '../api/startups'
import type { StartupsFilters } from '../api/startups'
import { StartupCard } from './StartupCard'
import { SearchFilters } from './SearchFilters'
import { StartupListSkeleton } from './StartupListSkeleton'
import { EmptyState } from './EmptyState'


export const StartupList: React.FC = () => {
  const [filters, setFilters] = useState<StartupsFilters>({
    q: '',
    industry: '',
    stage: '',
    ticketMin: undefined,
    ticketMax: undefined,
  })

  const { data: startups, isLoading, error } = useQuery({
    queryKey: ['startups', filters],
    queryFn: () => startupsApi.getStartups(filters)
  })



  if (isLoading) {
    return <StartupListSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Error loading startups</h2>
        <p className="text-muted mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-fg">🚀 Startup Opportunities</h2>
          <p className="text-muted mt-2">
            Discover innovative startups seeking investment
          </p>
        </div>
        <Link to="/create" className="btn btn-primary">
          + Post Your Startup
        </Link>
      </div>

      {/* Filters */}
      <SearchFilters filters={filters} onFiltersChange={setFilters} />

      {/* Results */}
      {!startups || startups.length === 0 ? (
        <EmptyState filters={filters} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => (
            <StartupCard
              key={startup.id}
              startup={{
                ...startup,
                isActive: startup.isActive ?? true,
                isVerified: startup.isVerified ?? false,
                team: startup.team ?? undefined,
                visibility: startup.visibility ?? 'public',
                tags: startup.tags ?? [],
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
