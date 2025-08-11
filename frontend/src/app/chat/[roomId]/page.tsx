'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useRef } from 'react'
import { ChatRoom, Message } from '@shared/index'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatMessages } from '@/components/chat/chat-messages'
import { ChatInput } from '@/components/chat/chat-input'
import { useChatStore } from '@/store/chat-store'

interface ChatPageProps {
  params: {
    roomId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { roomId } = params
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const { addMessage, markMessageAsRead } = useChatStore()

  useEffect(() => {
    if (!session?.user?.id || !roomId) return

    const connectWebSocket = () => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4001'
      const socket = new WebSocket(wsUrl)

      socket.onopen = () => {
        console.log('Connected to WebSocket')
        setIsConnected(true)
        
        // Join the chat room
        socket.send(JSON.stringify({
          type: 'joinRoom',
          roomId,
          userId: session.user.id,
        }))
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'receiveMessage':
              const newMessage = data.payload
              setMessages(prev => [...prev, newMessage])
              addMessage(roomId, newMessage)
              
              // Mark message as read if it's from another user
              if (newMessage.senderId !== session.user.id) {
                markMessageAsRead(newMessage.id, session.user.id)
                socket.send(JSON.stringify({
                  type: 'readReceipt',
                  messageId: newMessage.id,
                  userId: session.user.id,
                }))
              }
              break
              
            case 'typing':
              setIsTyping(data.isTyping)
              break
              
            case 'roomJoined':
              console.log('Successfully joined room:', data.roomId)
              break
              
            case 'error':
              console.error('WebSocket error:', data.message)
              break
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      socket.onclose = () => {
        console.log('WebSocket connection closed')
        setIsConnected(false)
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000)
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }

      wsRef.current = socket
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [session?.user?.id, roomId, addMessage, markMessageAsRead])

  const sendMessage = (content: string, type: 'text' | 'file' | 'nda_request' = 'text') => {
    if (wsRef.current && content.trim()) {
      wsRef.current.send(JSON.stringify({
        type: 'sendMessage',
        roomId,
        senderId: session?.user?.id,
        content,
        type,
      }))
    }
  }

  const sendTypingStatus = (isTyping: boolean) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        roomId,
        senderId: session?.user?.id,
        isTyping,
      }))
    }
  }

  if (!session) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Sidebar */}
      <ChatSidebar currentRoomId={roomId} />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Chat Room</h1>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Connecting...'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ChatMessages 
          messages={messages}
          currentUserId={session.user.id}
          isTyping={isTyping}
        />

        {/* Chat Input */}
        <ChatInput 
          onSendMessage={sendMessage}
          onTyping={sendTypingStatus}
          disabled={!isConnected}
        />
      </div>
    </div>
  )
}
