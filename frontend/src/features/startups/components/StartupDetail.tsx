import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { startupsApi, startupKeys } from '../api/startups'
import { chatApi } from '../../chat/api/chat'
import { useAuthStore } from '../../../store/auth'
import { StartupDetailSkeleton } from './StartupDetailSkeleton'

type TabType = 'overview' | 'traction' | 'team' | 'documents' | 'qa'

export const StartupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const { data: startup, isLoading, error } = useQuery({
    queryKey: startupKeys.detail(id!),
    queryFn: () => startupsApi.getStartup(id!),
    enabled: !!id,
  })

  const handleContactFounder = async () => {
    if (!startup) return
    
    try {
      const investorId = user?.id || "investor_123"
      
      const chatRoom = await chatApi.createChatRoom({
        startup_id: startup.id,
        investor_id: investorId,
      })
      
      navigate(`/chat/${chatRoom.id}`)
    } catch (error) {
      console.error('Error opening chat:', error)
    }
  }

  if (isLoading) {
    return <StartupDetailSkeleton />
  }

  if (error || !startup) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Startup not found</h2>
        <p className="text-muted mb-6">{error?.message || 'The startup you are looking for does not exist.'}</p>
        <Link to="/" className="btn btn-primary">
          Back to Startups
        </Link>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'traction', label: 'Traction', icon: '📈' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'qa', label: 'Q&A', icon: '❓' },
  ]

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-muted">
        <Link to="/" className="hover:text-fg transition-colors">Startups</Link>
        <span className="mx-2">/</span>
        <span className="text-fg">{startup.industry}</span>
        <span className="mx-2">/</span>
        <span className="text-fg">{startup.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-fg mb-4">{startup.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {startup.industry}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 text-accent">
                    {startup.stage}
                  </span>
                  {startup.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      ✓ Verified Founder
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-lg text-muted leading-relaxed">{startup.description}</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-fg'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-fg mb-3">About</h3>
                  <p className="text-muted leading-relaxed">{startup.description}</p>
                </div>
                
                {startup.tags && startup.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-fg mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {startup.tags.map((tag: string) => (
                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-muted/20 text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'traction' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-fg mb-4">Traction & Metrics</h3>
                {startup.traction ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {startup.traction.mrr && (
                      <div className="text-center p-6 bg-muted/20 rounded-card">
                        <div className="text-3xl font-bold text-primary">
                          ${startup.traction.mrr.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted">Monthly Recurring Revenue</div>
                      </div>
                    )}
                    {startup.traction.users && (
                      <div className="text-center p-6 bg-muted/20 rounded-card">
                        <div className="text-3xl font-bold text-primary">
                          {startup.traction.users.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted">Active Users</div>
                      </div>
                    )}
                    {startup.traction.growth && (
                      <div className="text-center p-6 bg-muted/20 rounded-card">
                        <div className="text-3xl font-bold text-primary">
                          {startup.traction.growth}%
                        </div>
                        <div className="text-sm text-muted">Month over Month Growth</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted text-center py-8">No traction data available yet.</p>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-fg mb-4">Team</h3>
                {startup.team ? (
                  <div className="space-y-4">
                    {startup.team.size && (
                      <div className="p-4 bg-muted/20 rounded-card">
                        <div className="font-medium text-fg">Team Size</div>
                        <div className="text-muted">{startup.team.size} people</div>
                      </div>
                    )}
                    {startup.team.background && (
                      <div className="p-4 bg-muted/20 rounded-card">
                        <div className="font-medium text-fg">Background</div>
                        <div className="text-muted">{startup.team.background}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted text-center py-8">No team information available yet.</p>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-fg mb-4">Documents</h3>
                <p className="text-muted text-center py-8">No documents uploaded yet.</p>
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-fg mb-4">Questions & Answers</h3>
                <p className="text-muted text-center py-8">No Q&A available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Key Facts */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-fg">Key Facts</h3>
            
            <div className="space-y-3">
              {startup.funding_needed && (
                <div>
                  <div className="text-sm text-muted">Funding Ask</div>
                  <div className="text-xl font-bold text-primary">
                    {formatCurrency(startup.funding_needed)}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-muted">Stage</div>
                <div className="font-medium text-fg">{startup.stage}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted">Location</div>
                <div className="font-medium text-fg">📍 {startup.location}</div>
              </div>
              
              {startup.website && (
                <div>
                  <div className="text-sm text-muted">Website</div>
                  <a 
                    href={startup.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              
              {startup.linkedin && (
                <div>
                  <div className="text-sm text-muted">LinkedIn</div>
                  <a 
                    href={startup.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Contact Actions */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-fg">Get in Touch</h3>
            
            <button 
              onClick={handleContactFounder}
              className="btn btn-primary w-full"
            >
              💬 Contact Founder
            </button>
            
            <button className="btn btn-outline w-full">
              📤 Share Startup
            </button>
            
            <button className="btn btn-ghost w-full">
              💾 Save for Later
            </button>
          </div>

          {/* Founder Info */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-fg">Founder</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                {startup.owner.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-fg">{startup.owner}</div>
                <div className="text-sm text-muted">Posted {formatDate(startup.created_at)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
