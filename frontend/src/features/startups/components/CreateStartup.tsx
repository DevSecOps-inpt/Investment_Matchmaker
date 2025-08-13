import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { startupsApi, startupKeys } from '../api/startups'
import { StartupCreateSchema } from '../../../lib/schemas'
import { z } from 'zod'

export const CreateStartup: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createStartupMutation = useMutation({
    mutationFn: startupsApi.createStartup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: startupKeys.lists() })
      navigate(`/startup/${data.id}`)
    },
    onError: (error: any) => {
      console.error('Error creating startup:', error)
      setErrors({ general: error.message || 'Failed to create startup' })
    },
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner: '',
    category: 'Technology',
    funding_needed: '',
    industry: 'Technology',
    stage: 'Idea',
    location: '',
    website: '',
    linkedin: '',
    tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validatedData = StartupCreateSchema.parse({
        ...formData,
        funding_needed: formData.funding_needed ? Number(formData.funding_needed) : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      })

      createStartupMutation.mutate(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 
    'Transportation', 'Energy', 'Food & Beverage', 'Real Estate', 'Entertainment'
  ]

  const stages = [
    'Idea', 'MVP', 'Seed', 'Series A', 'Series B', 'Growth'
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-fg">🚀 Post Your Startup</h1>
        <p className="text-lg text-muted mt-2">
          Share your innovative idea with potential investors
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-card text-red-700">
            {errors.general}
          </div>
        )}

        <div className="card p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-fg">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Startup Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., AI-Powered Healthcare Platform"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`input min-h-[120px] resize-none ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe your startup idea, problem it solves, and your vision..."
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                className={`input ${errors.owner ? 'border-red-500' : ''}`}
                placeholder="Your full name"
              />
              {errors.owner && (
                <p className="text-red-600 text-sm mt-1">{errors.owner}</p>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-fg">Business Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="input"
                >
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Stage *
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="input"
                >
                  {stages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={`input ${errors.location ? 'border-red-500' : ''}`}
                placeholder="e.g., San Francisco, CA"
              />
              {errors.location && (
                <p className="text-red-600 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Funding Needed (USD)
              </label>
              <input
                type="number"
                value={formData.funding_needed}
                onChange={(e) => handleInputChange('funding_needed', e.target.value)}
                className="input"
                placeholder="e.g., 500000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="input"
                placeholder="e.g., AI, Healthcare, B2B (comma-separated)"
              />
              <p className="text-xs text-muted mt-1">
                Add relevant tags to help investors find your startup
              </p>
            </div>
          </div>

          {/* Contact & Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-fg">Contact & Links</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="input"
                  placeholder="https://yourstartup.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  className="input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createStartupMutation.isPending}
            className="btn btn-primary"
          >
            {createStartupMutation.isPending ? 'Creating...' : 'Post Startup'}
          </button>
        </div>
      </form>
    </div>
  )
}
