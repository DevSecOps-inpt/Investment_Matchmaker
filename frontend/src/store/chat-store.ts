import { create } from 'zustand'
import { Message, ChatRoom } from '@shared/index'

interface ChatState {
  // Chat rooms
  rooms: ChatRoom[]
  currentRoom: ChatRoom | null
  
  // Messages by room ID
  messages: Record<string, Message[]>
  
  // Unread counts by room ID
  unreadCounts: Record<string, number>
  
  // Actions
  setRooms: (rooms: ChatRoom[]) => void
  addRoom: (room: ChatRoom) => void
  setCurrentRoom: (room: ChatRoom | null) => void
  
  addMessage: (roomId: string, message: Message) => void
  setMessages: (roomId: string, messages: Message[]) => void
  
  markMessageAsRead: (messageId: string, userId: string) => void
  markRoomAsRead: (roomId: string, userId: string) => void
  
  updateUnreadCount: (roomId: string, count: number) => void
  incrementUnreadCount: (roomId: string) => void
  
  // Chat state
  isTyping: Record<string, boolean>
  setTypingStatus: (roomId: string, isTyping: boolean) => void
  
  // Clear all data
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  rooms: [],
  currentRoom: null,
  messages: {},
  unreadCounts: {},
  isTyping: {},

  // Actions
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set((state) => ({
    rooms: [...state.rooms.filter(r => r.id !== room.id), room]
  })),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  addMessage: (roomId, message) => set((state) => {
    const existingMessages = state.messages[roomId] || []
    const updatedMessages = [...existingMessages, message]
    
    // Update unread count if message is from another user
    const currentUserId = state.currentRoom?.participants.find(p => p.userId !== message.senderId)?.userId
    if (currentUserId && message.senderId !== currentUserId) {
      const currentUnreadCount = state.unreadCounts[roomId] || 0
      state.unreadCounts[roomId] = currentUnreadCount + 1
    }
    
    return {
      messages: {
        ...state.messages,
        [roomId]: updatedMessages
      }
    }
  }),
  
  setMessages: (roomId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: messages
    }
  })),
  
  markMessageAsRead: (messageId, userId) => set((state) => {
    const updatedMessages = { ...state.messages }
    
    Object.keys(updatedMessages).forEach(roomId => {
      updatedMessages[roomId] = updatedMessages[roomId].map(message => {
        if (message.id === messageId) {
          return {
            ...message,
            readBy: [...(message.readBy || []), userId]
          }
        }
        return message
      })
    })
    
    return { messages: updatedMessages }
  }),
  
  markRoomAsRead: (roomId, userId) => set((state) => {
    const updatedMessages = { ...state.messages }
    const roomMessages = updatedMessages[roomId] || []
    
    updatedMessages[roomId] = roomMessages.map(message => ({
      ...message,
      readBy: [...(message.readBy || []), userId]
    }))
    
    // Reset unread count for this room
    const updatedUnreadCounts = { ...state.unreadCounts }
    updatedUnreadCounts[roomId] = 0
    
    return {
      messages: updatedMessages,
      unreadCounts: updatedUnreadCounts
    }
  }),
  
  updateUnreadCount: (roomId, count) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [roomId]: count
    }
  })),
  
  incrementUnreadCount: (roomId) => set((state) => {
    const currentCount = state.unreadCounts[roomId] || 0
    return {
      unreadCounts: {
        ...state.unreadCounts,
        [roomId]: currentCount + 1
      }
    }
  }),
  
  setTypingStatus: (roomId, isTyping) => set((state) => ({
    isTyping: {
      ...state.isTyping,
      [roomId]: isTyping
    }
  })),
  
  clearChat: () => set({
    rooms: [],
    currentRoom: null,
    messages: {},
    unreadCounts: {},
    isTyping: {}
  })
}))

// Selectors
export const useChatRooms = () => useChatStore((state) => state.rooms)
export const useCurrentRoom = () => useChatStore((state) => state.currentRoom)
export const useRoomMessages = (roomId: string) => useChatStore((state) => state.messages[roomId] || [])
export const useUnreadCount = (roomId: string) => useChatStore((state) => state.unreadCounts[roomId] || 0)
export const useTotalUnreadCount = () => useChatStore((state) => 
  Object.values(state.unreadCounts).reduce((total, count) => total + count, 0)
)
export const useTypingStatus = (roomId: string) => useChatStore((state) => state.isTyping[roomId] || false)
