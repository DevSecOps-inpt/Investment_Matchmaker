import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStartups } from '../features/startups/api/startups.client';
import type { Startup } from '../features/startups/api/schemas';

interface ChatRoom {
  id: string;
}

const StartupList: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const openChat = async (startupId: string): Promise<void> => {
    try {
      const response = await fetch('/api/chat-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startup_id: startupId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }

      const chatRoom: ChatRoom = await response.json();
      navigate(`/chat/${chatRoom.id}`);
    } catch (error) {
      console.error('Failed to create chat room:', error);
      alert('Failed to open chat. Please try again.');
    }
  };

  const fetchStartups = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const startupData = await getStartups();
      setStartups(startupData);
    } catch (error: any) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to fetch startups');
      }
      console.error('Error fetching startups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  const renderHeader = () => (
    <div className="page-header">
      <h1 className="page-title">Startup Opportunities</h1>
      <Link to="/create-startup" className="btn btn-primary">
        Post Your Startup
      </Link>
    </div>
  );

  return (
    <div className="App-main">
      {renderHeader()}

      {loading ? (
        <div className="state-container">
          <div className="state-icon loading-icon">
            <div className="loading-spinner" />
          </div>
          <h2 className="state-title">Loading startups...</h2>
          <p className="state-message">Please wait while we fetch the latest opportunities</p>
        </div>
      ) : error ? (
        <div className="state-container">
          <div className="state-icon error-icon">⚠️</div>
          <h2 className="state-title">Error loading startups</h2>
          <p className="state-message">{error}</p>
          <button className="btn btn-primary" onClick={fetchStartups}>
            Try Again
          </button>
        </div>
      ) : startups.length === 0 ? (
        <div className="state-container">
          <div className="state-icon">🚀</div>
          <h2 className="state-title">No startups yet</h2>
          <p className="state-message">Be the first to post your startup idea!</p>
          <Link to="/create-startup" className="btn btn-primary">
            Post Your Startup
          </Link>
        </div>
      ) : (
        <div className="startup-grid">
          {startups.map((startup) => (
            <div key={startup.id} className="startup-card">
              <div className="startup-card-body">
                <h3 className="startup-card-title">{startup.title}</h3>
                <p className="startup-card-description">{startup.description}</p>
                <div className="startup-card-tags">
                  <span className="startup-tag">{startup.category}</span>
                  {startup.fundingNeeded > 0 && (
                    <span className="startup-tag funding">
                      ${startup.fundingNeeded.toLocaleString()} needed
                    </span>
                  )}
                </div>
              </div>
              <div className="startup-card-meta">
                <span>By {startup.ownerName}</span>
                <span>{formatDate(startup.createdAt)}</span>
              </div>
              <div className="startup-card-actions">
                <Link
                  to={`/startup/${startup.id}`}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  View Details
                </Link>
                <button
                  className="btn btn-primary"
                  onClick={() => openChat(startup.id)}
                  style={{ flex: 1 }}
                >
                  Contact Founder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StartupList;
