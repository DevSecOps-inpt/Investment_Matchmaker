import React from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  filters: {
    q?: string
    industry?: string
    stage?: string
    ticketMin?: number
    ticketMax?: number
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filters }) => {
  const hasFilters = Object.values(filters).some(value => value !== undefined && value !== '')

  if (hasFilters) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🔍</div>
        <h3 className="text-2xl font-semibold text-fg mb-4">No startups found</h3>
        <p className="text-muted mb-6 max-w-md mx-auto">
          Try adjusting your filters or search terms. No results match your current criteria.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-outline"
          >
            Clear All Filters
          </button>
          <Link to="/create" className="btn btn-primary">
            Post Your Startup
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-6">🚀</div>
      <h3 className="text-2xl font-semibold text-fg mb-4">No startups yet</h3>
      <p className="text-muted mb-6 max-w-md mx-auto">
        Be the first to post your startup idea and connect with potential investors!
      </p>
      <Link to="/create" className="btn btn-primary">
        Post Your Startup
      </Link>
    </div>
  )
}
