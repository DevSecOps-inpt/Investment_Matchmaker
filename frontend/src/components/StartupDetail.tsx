import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Startup {
  id: string;
  title: string;
  description: string;
  owner: string;
  category: string;
  funding_needed?: number;
  created_at: string;
}

interface ChatRoom {
  id: string;
  startup_id: string;
  investor_id: string;
  entrepreneur_id: string;
  created_at: string;
}

const StartupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStartup(id);
    }
  }, [id]);

  const fetchStartup = async (startupId: string) => {
    try {
      const response = await fetch(`/startups/${startupId}`);
      if (!response.ok) {
        throw new Error('Startup not found');
      }
      const data = await response.json();
      setStartup(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const startChat = async () => {
    if (!startup) return;
    
    setCreatingChat(true);
    try {
      // For now, using a placeholder investor ID
      const investorId = "investor_123"; // This would come from auth in the future
      
      const response = await fetch('/chat-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startup_id: startup.id,
          investor_id: investorId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }

      const chatRoom: ChatRoom = await response.json();
      navigate(`/chat/${chatRoom.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start chat');
    } finally {
      setCreatingChat(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="App-main">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Loading startup details...</h2>
        </div>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="App-main">
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>Error</h2>
          <p>{error || 'Startup not found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Startups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App-main">
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Startups
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{startup.title}</h1>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <span style={{ 
              background: '#e9ecef', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              fontSize: '1rem'
            }}>
              {startup.category}
            </span>
            {startup.funding_needed && (
              <span style={{ 
                background: '#d4edda', 
                padding: '0.5rem 1rem', 
                borderRadius: '8px', 
                fontSize: '1rem'
              }}>
                💰 ${startup.funding_needed.toLocaleString()} funding needed
              </span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>About This Startup</h3>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555' }}>
            {startup.description}
          </p>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Startup Details</h3>
          <div className="grid grid-2">
            <div>
              <strong>Founder:</strong> {startup.owner}
            </div>
            <div>
              <strong>Posted:</strong> {formatDate(startup.created_at)}
            </div>
            <div>
              <strong>Category:</strong> {startup.category}
            </div>
            {startup.funding_needed && (
              <div>
                <strong>Funding Goal:</strong> ${startup.funding_needed.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>Interested in this startup?</h3>
          <p style={{ marginBottom: '2rem', color: '#666' }}>
            Start a conversation with the founder to learn more and discuss potential investment opportunities.
          </p>
          <button 
            className="btn btn-success" 
            onClick={startChat}
            disabled={creatingChat}
            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
          >
            {creatingChat ? 'Creating Chat...' : '💬 Start Chat with Founder'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartupDetail;
