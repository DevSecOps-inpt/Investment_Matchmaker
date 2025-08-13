import React, { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/auth'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-bg text-fg">
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-brand">
            <span className="text-2xl">🚀</span>
            Investment Matchmaker
          </a>

          <button 
            className="navbar-toggle" 
            aria-label="Toggle navigation"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round"/>
            </svg>
          </button>

          <div className={`navbar-nav ${isMobileMenuOpen ? 'show' : ''}`}>
            <a href="/startups" className="nav-link">Startups</a>
            <a href="/investors" className="nav-link">Investors</a>
            
            <div className="navbar-dropdown" ref={dropdownRef}>
              <button 
                className="dropdown-toggle"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Account
                <svg 
                  width="16" 
                  height="16" 
                  fill="none" 
                  stroke="currentColor"
                  style={{ 
                    transform: `rotate(${isDropdownOpen ? '180deg' : '0deg'})`,
                    transition: 'transform 0.2s ease-out'
                  }}
                >
                  <path d="M4 6l4 4 4-4" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                <a href="/profile" className="dropdown-item">
                  <span>👤</span> Profile
                </a>
                <a href="/settings" className="dropdown-item">
                  <span>⚙️</span> Settings
                </a>
                <button onClick={toggleTheme} className="dropdown-item">
                  <span>{theme === 'dark' ? '🌞' : '🌙'}</span>
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
