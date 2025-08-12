import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // For now, using placeholder sender ID - this would come from auth in the future
  const senderId = "investor_123";

  useEffect(() => {
    if (roomId) {
      connectWebSocket();
      fetchExistingMessages();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const connectWebSocket = () => {
    const socket = new WebSocket('ws://localhost:8000/ws');
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
      setLoading(false);
      
      // Join the chat room
      socket.send(JSON.stringify({ 
        type: 'joinRoom', 
        roomId: roomId 
      }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'receiveMessage') {
          setMessages(prev => [...prev, data.payload]);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    setWs(socket);
  };

  const fetchExistingMessages = async () => {
    try {
      const response = await fetch(`/chat-rooms/${roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender_id,
          content: msg.content,
          timestamp: msg.timestamp
        })));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    if (!ws || !input.trim() || !connected) return;

    const messageData = {
      type: 'sendMessage',
      roomId: roomId,
      senderId: senderId,
      content: input.trim()
    };

    ws.send(JSON.stringify(messageData));
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="App-main">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Connecting to chat...</h2>
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
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2>💬 Chat Room</h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <span>Status:</span>
            <span style={{ 
              color: connected ? '#28a745' : '#dc3545',
              fontWeight: 'bold'
            }}>
              {connected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#666', 
              padding: '2rem',
              fontStyle: 'italic'
            }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.senderId === senderId ? 'sent' : 'received'}`}
              >
                <div className="sender">
                  {message.senderId === senderId ? 'You' : message.senderId}
                </div>
                <div className="content">{message.content}</div>
                <div className="timestamp">{formatTime(message.timestamp)}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="form-control"
            disabled={!connected}
          />
          <button
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
          >
            Send
          </button>
        </div>
      </div>

      {!connected && (
        <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Connection lost. Trying to reconnect...
          </p>
          <button 
            className="btn btn-primary" 
            onClick={connectWebSocket}
          >
            Reconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
