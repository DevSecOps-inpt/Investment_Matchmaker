import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { chatApi, chatKeys } from '../api/chat'
import { Message } from '../../../lib/schemas'
import { useAuthStore } from '../../../store/auth'

export const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch chat room details and messages
  const { data: chatRoom, isLoading: roomLoading } = useQuery({
    queryKey: chatKeys.room(roomId!),
    queryFn: () => chatApi.getChatRoom(roomId!),
    enabled: !!roomId,
  })

  const { data: existingMessages, isLoading: messagesLoading } = useQuery({
    queryKey: chatKeys.messages(roomId!),
    queryFn: () => chatApi.getRoomMessages(roomId!),
    enabled: !!roomId,
  })

  useEffect(() => {
    if (existingMessages && Array.isArray(existingMessages)) {
        setMessages(existingMessages.map(msg => ({
          ...msg,
          status: (msg.status === 'sending' || msg.status === 'sent' || msg.status === 'failed') ? msg.status : 'sent',
        })))
    }
  }, [existingMessages])

  useEffect(() => {
    if (roomId) {
      connectWebSocket()
    }

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    const socket = new WebSocket('ws://localhost:8000/ws')
    
    socket.onopen = () => {
      console.log('WebSocket connected')
      setConnected(true)
      
      // Join the chat room
      socket.send(JSON.stringify({ 
        type: 'joinRoom', 
        roomId: roomId 
      }))
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'receiveMessage') {
          setMessages(prev => [...prev, data.payload])
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    socket.onclose = () => {
      console.log('WebSocket disconnected')
      setConnected(false)
    }

    socket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnected(false)
    }

    setWs(socket)
  }

  const sendMessage = () => {
    if (!ws || !input.trim() || !connected || !user) return

    const messageData = {
      type: 'sendMessage',
      roomId: roomId,
      senderId: user.id,
      content: input.trim()
    }

    ws.send(JSON.stringify(messageData))
    setInput('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (roomLoading || messagesLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted">Loading chat...</p>
      </div>
    )
  }

  if (!chatRoom) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">Chat room not found</h2>
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-primary"
        >
          Back to Startups
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="btn btn-ghost"
        >
          ← Back to Startups
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted">
            Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="card p-0 overflow-hidden">
        {/* Messages */}
        <div className="h-[600px] overflow-y-auto p-6 bg-muted/20">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-lg">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-card ${
                      message.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <div className="text-sm opacity-80 mb-1">
                      {message.sender_id === user?.id ? 'You' : 'Founder'}
                    </div>
                    <div className="text-sm">{message.content}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="input flex-1"
              disabled={!connected}
            />
            <button
              onClick={sendMessage}
              disabled={!connected || !input.trim()}
              className="btn btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!connected && (
        <div className="card p-4 text-center">
          <p className="text-red-600 mb-3">Connection lost. Trying to reconnect...</p>
          <button 
            onClick={connectWebSocket}
            className="btn btn-primary"
          >
            Reconnect
          </button>
        </div>
      )}
    </div>
  )
}
