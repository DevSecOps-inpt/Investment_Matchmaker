import React from 'react'
import { Link } from 'react-router-dom'
import { Startup } from '../../../lib/schemas'
import { useAuthStore } from '../../../store/auth'
import { chatApi } from '../../chat/api/chat'
import { useNavigate } from 'react-router-dom'

interface StartupCardProps {
  startup: Startup
}

export const StartupCard: React.FC<StartupCardProps> = ({ startup }) => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1d ago'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return `${Math.floor(diffDays / 365)}y ago`
  }

  const getVisibilityBadge = () => {
    const badges = {
      public: { label: 'Public', className: 'bg-gray-100 text-gray-700' },
      verified: { label: 'Verified', className: 'bg-blue-100 text-blue-700' },
      request: { label: 'Request', className: 'bg-amber-100 text-amber-700' },
    }
    const badge = badges[startup.visibility]
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    )
  }

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

  return (
    <div className="card p-6 hover:shadow-2 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-fg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {startup.title}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            {getVisibilityBadge()}
            {startup.isVerified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                ✓ Verified Founder
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted line-clamp-4 mb-4 leading-relaxed">
        {startup.description}
      </p>

      {/* Tags and Meta */}
      <div className="space-y-3 mb-4">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
            {startup.industry}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-accent/10 text-accent">
            {startup.stage}
          </span>
          {startup.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted/20 text-muted">
              {tag}
            </span>
          ))}
        </div>

        {/* Traction Snapshot */}
        {startup.traction && (
          <div className="flex items-center gap-4 text-xs text-muted">
            {startup.traction.mrr && (
              <span>${startup.traction.mrr.toLocaleString()} MRR</span>
            )}
            {startup.traction.users && (
              <span>{startup.traction.users.toLocaleString()} users</span>
            )}
            {startup.traction.growth && (
              <span>{startup.traction.growth}% MoM</span>
            )}
          </div>
        )}

        {/* Team Info */}
        {startup.team && (
          <div className="text-xs text-muted">
            {startup.team.size && <span>{startup.team.size} person team</span>}
            {startup.team.background && (
              <span className="ml-2">• {startup.team.background}</span>
            )}
          </div>
        )}
      </div>

      {/* Funding Info */}
      {startup.funding_needed && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/20 rounded-lg">
          <span className="text-lg">🔥</span>
          <div className="flex-1">
            <div className="text-sm font-medium text-fg">Funding needed</div>
            <div className="text-lg font-bold text-primary">
              {formatCurrency(startup.funding_needed)}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted mb-4">
        <div className="flex items-center gap-2">
          <span>📍 {startup.location}</span>
          <span>•</span>
          <span>Updated {formatDate(startup.created_at)}</span>
        </div>
        <span>By: {startup.owner}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link 
          to={`/startup/${startup.id}`} 
          className="btn btn-outline flex-1"
        >
          View Details
        </Link>
        <button 
          onClick={handleContactFounder}
          className="btn btn-primary flex-1"
        >
          Contact Founder
        </button>
      </div>
    </div>
  )
}
