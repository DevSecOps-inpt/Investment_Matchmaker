import React, { useState, useEffect } from 'react'
import { useDebounce } from '../../../lib/hooks/useDebounce'

interface SearchFiltersProps {
  filters: {
    q?: string
    industry?: string
    stage?: string
    ticketMin?: number
    ticketMax?: number
  }
  onFiltersChange: (filters: any) => void
}

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 
  'Transportation', 'Energy', 'Food & Beverage', 'Real Estate', 'Entertainment'
]

const STAGES = [
  'Idea', 'MVP', 'Seed', 'Series A', 'Series B', 'Growth'
]

export const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const debouncedFilters = useDebounce(localFilters, 300)

  useEffect(() => {
    onFiltersChange(debouncedFilters)
  }, [debouncedFilters, onFiltersChange])

  const handleFilterChange = (key: string, value: string | number | undefined) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  const clearFilters = () => {
    const clearedFilters = {
      q: '',
      industry: '',
      stage: '',
      ticketMin: undefined,
      ticketMax: undefined,
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '')

  return (
    <div className="space-y-6 p-6 bg-muted/20 rounded-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-fg">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted hover:text-fg transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-fg">Search</label>
          <input
            type="text"
            placeholder="Search startups..."
            value={localFilters.q || ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="input"
          />
        </div>

        {/* Industry */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-fg">Industry</label>
          <select
            value={localFilters.industry || ''}
            onChange={(e) => handleFilterChange('industry', e.target.value)}
            className="input"
          >
            <option value="">All Industries</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-fg">Stage</label>
          <select
            value={localFilters.stage || ''}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="input"
          >
            <option value="">All Stages</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>

        {/* Funding Range */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-fg">Funding Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.ticketMin || ''}
              onChange={(e) => handleFilterChange('ticketMin', e.target.value ? Number(e.target.value) : undefined)}
              className="input text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={localFilters.ticketMax || ''}
              onChange={(e) => handleFilterChange('ticketMax', e.target.value ? Number(e.target.value) : undefined)}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.q && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
              Search: "{filters.q}"
              <button
                onClick={() => handleFilterChange('q', '')}
                className="ml-2 text-primary/70 hover:text-primary"
              >
                ×
              </button>
            </span>
          )}
          {filters.industry && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent/10 text-accent">
              Industry: {filters.industry}
              <button
                onClick={() => handleFilterChange('industry', '')}
                className="ml-2 text-accent/70 hover:text-accent"
              >
                ×
              </button>
            </span>
          )}
          {filters.stage && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
              Stage: {filters.stage}
              <button
                onClick={() => handleFilterChange('stage', '')}
                className="ml-2 text-accent/70 hover:text-accent"
              >
                ×
              </button>
            </span>
          )}
          {(filters.ticketMin || filters.ticketMax) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-700">
              Funding: ${filters.ticketMin?.toLocaleString() || '0'} - ${filters.ticketMax?.toLocaleString() || '∞'}
              <button
                onClick={() => {
                  handleFilterChange('ticketMin', undefined)
                  handleFilterChange('ticketMax', undefined)
                }}
                className="ml-2 text-amber-500 hover:text-amber-700"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
