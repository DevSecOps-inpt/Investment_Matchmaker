import { http } from '../../../lib/http'
import { StartupSchema, StartupCreateSchema } from '../../../lib/schemas'
import { z } from 'zod'

const StartupArraySchema = z.array(StartupSchema)

export interface StartupsFilters {
  q?: string
  industry?: string
  stage?: string
  ticketMin?: number
  ticketMax?: number
  page?: number
  pageSize?: number
}

export const startupsApi = {
  // Get all startups with optional filtering
  async getStartups(filters: StartupsFilters = {}) {
    const params = new URLSearchParams()
    
    if (filters.q) params.append('q', filters.q)
    if (filters.industry) params.append('industry', filters.industry)
    if (filters.stage) params.append('stage', filters.stage)
    if (filters.ticketMin) params.append('ticketMin', filters.ticketMin.toString())
    if (filters.ticketMax) params.append('ticketMax', filters.ticketMax.toString())
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString())

    const endpoint = `/startups${params.toString() ? `?${params.toString()}` : ''}`
    return http.get(endpoint, StartupArraySchema)
  },

  // Get a single startup by ID
  async getStartup(id: string) {
    return http.get(`/startups/${id}`, StartupSchema)
  },

  // Create a new startup
  async createStartup(data: z.infer<typeof StartupCreateSchema>) {
    return http.post('/startups', data, StartupSchema)
  },

  // Update an existing startup
  async updateStartup(id: string, data: Partial<z.infer<typeof StartupCreateSchema>>) {
    return http.put(`/startups/${id}`, data, StartupSchema)
  },

  // Delete a startup (soft delete)
  async deleteStartup(id: string) {
    return http.delete(`/startups/${id}`)
  },
}

// React Query keys
export const startupKeys = {
  all: ['startups'] as const,
  lists: () => [...startupKeys.all, 'list'] as const,
  list: (filters: StartupsFilters) => [...startupKeys.lists(), filters] as const,
  details: () => [...startupKeys.all, 'detail'] as const,
  detail: (id: string) => [...startupKeys.details(), id] as const,
}
