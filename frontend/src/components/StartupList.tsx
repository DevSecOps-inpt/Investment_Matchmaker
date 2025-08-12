import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface Startup {
  id: string;
  title: string;
  description: string;
  owner: string;
  category: string;
  funding_needed?: number;
  created_at: string;
  owner_id?: string;
}

const StartupList: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      const response = await fetch('/startups');
      if (!response.ok) {
        throw new Error('Failed to fetch startups');
      }
      const data = await response.json();
      setStartups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (startupId: string, ownerId: string) => {
    try {
      // For now, using a placeholder investor ID - this would come from auth in the future
      const investorId = "investor_123";
      
      const response = await fetch('/chat-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startup_id: startupId,
          investor_id: investorId
        }),
      });

      if (response.ok) {
        const chatRoom = await response.json();
        // Navigate to the chat room
        navigate(`/chat/${chatRoom.id}`);
      } else {
        console.error('Failed to create chat room');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="App-main">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Loading startups...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App-main">
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchStartups}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App-main">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>🚀 Startup Opportunities</h2>
        <Link to="/create" className="btn btn-primary">
          + Post Your Startup
        </Link>
      </div>

      {startups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>No startups yet</h3>
          <p>Be the first to post your startup idea!</p>
          <Link to="/create" className="btn btn-primary">
            Post Your Startup
          </Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {startups.map((startup) => (
            <div key={startup.id} className="card">
              <h3>{startup.title}</h3>
              <p>{startup.description}</p>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ 
                  background: '#e9ecef', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.9rem',
                  marginRight: '0.5rem'
                }}>
                  {startup.category}
                </span>
                {startup.funding_needed && (
                  <span style={{ 
                    background: '#d4edda', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.9rem'
                  }}>
                    ${startup.funding_needed.toLocaleString()} needed
                  </span>
                )}
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <span>By: {startup.owner}</span>
                <span>{formatDate(startup.created_at)}</span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div className="flex gap-2">
                  <Link to={`/startup/${startup.id}`} className="btn btn-secondary" style={{ flex: 1 }}>
                    View Details
                  </Link>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => openChat(startup.id, startup.owner_id || startup.owner)}
                    style={{ flex: 1 }}
                  >
                    Contact Founder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StartupList;
