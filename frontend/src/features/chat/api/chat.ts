import { z } from 'zod'
import { ChatRoomSchema, MessageSchema } from '../../../lib/schemas'
import { http } from '../../../lib/http'

const MessageArraySchema = z.array(MessageSchema)

export interface CreateChatRoomRequest {
  startup_id: string
  investor_id: string
}

export const chatApi = {
  // Create a new chat room
  async createChatRoom(data: CreateChatRoomRequest) {
    return http.post('/chat-rooms', data, ChatRoomSchema)
  },

  // Get chat room messages
  async getRoomMessages(roomId: string, after?: string) {
    const params = after ? `?after=${after}` : ''
    return http.get(`/chat-rooms/${roomId}/messages${params}`, MessageArraySchema)
  },

  // Get chat room details
  async getChatRoom(roomId: string) {
    return http.get(`/chat-rooms/${roomId}`, ChatRoomSchema)
  },
}

// React Query keys
export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  room: (id: string) => [...chatKeys.rooms(), id] as const,
  messages: (roomId: string) => [...chatKeys.room(roomId), 'messages'] as const,
}
