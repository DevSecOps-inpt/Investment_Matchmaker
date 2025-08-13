import { z } from 'zod'

// Startup schemas
export const StartupCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  owner: z.string().min(1, 'Owner name is required'),
  category: z.string().min(1, 'Category is required'),
  funding_needed: z.number().min(0, 'Funding must be positive').optional(),
  industry: z.string().min(1, 'Industry is required'),
  stage: z.enum(['Idea', 'MVP', 'Seed', 'Series A', 'Series B', 'Growth']),
  location: z.string().min(1, 'Location is required'),
  website: z.string().url('Invalid website URL').optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional(),
})

export const StartupSchema = StartupCreateSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  owner_id: z.string(),
  isActive: z.boolean().optional().default(true),
  isVerified: z.boolean().optional().default(false),
  visibility: z.enum(['public', 'verified', 'request']).default('public'),
  traction: z.object({
    mrr: z.number().optional(),
    users: z.number().optional(),
    growth: z.number().optional(),
  }).optional(),
  team: z.object({
    size: z.number().optional(),
    background: z.string().optional(),
  }).optional(),
  tags: z.array(z.string()).default([]),
})

export type StartupCreate = z.infer<typeof StartupCreateSchema>
export type Startup = z.infer<typeof StartupSchema>

// Message schemas
export const MessageSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  sender_id: z.string(),
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  timestamp: z.string().datetime(),
  status: z.enum(['sending', 'sent', 'failed']).default('sent'),
})

export type Message = z.infer<typeof MessageSchema>

// Chat room schemas
export const ChatRoomSchema = z.object({
  id: z.string().uuid(),
  startup_id: z.string().uuid(),
  investor_id: z.string(),
  entrepreneur_id: z.string(),
  created_at: z.string().datetime(),
})

export type ChatRoom = z.infer<typeof ChatRoomSchema>

// API response schemas
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    error: z.never().optional(),
  })

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
  data: z.never().optional(),
})

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    hasMore: z.boolean(),
  })

// WebSocket message schemas
export const WebSocketJoinRoomSchema = z.object({
  type: z.literal('joinRoom'),
  roomId: z.string().uuid(),
})

export const WebSocketLeaveRoomSchema = z.object({
  type: z.literal('leaveRoom'),
  roomId: z.string().uuid(),
})

export const WebSocketSendMessageSchema = z.object({
  type: z.literal('sendMessage'),
  roomId: z.string().uuid(),
  senderId: z.string(),
  content: z.string(),
  tempId: z.string().optional(),
})

export const WebSocketReceiveMessageSchema = z.object({
  type: z.literal('receiveMessage'),
  payload: MessageSchema,
})

export const WebSocketAckSchema = z.object({
  type: z.literal('ack'),
  tempId: z.string(),
  messageId: z.string().uuid(),
})

export const WebSocketErrorSchema = z.object({
  type: z.literal('error'),
  code: z.string(),
  message: z.string(),
})

export const WebSocketMessageSchema = z.union([
  WebSocketReceiveMessageSchema,
  WebSocketAckSchema,
  WebSocketErrorSchema,
])

export type WebSocketJoinRoom = z.infer<typeof WebSocketJoinRoomSchema>
export type WebSocketLeaveRoom = z.infer<typeof WebSocketLeaveRoomSchema>
export type WebSocketSendMessage = z.infer<typeof WebSocketSendMessageSchema>
export type WebSocketReceiveMessage = z.infer<typeof WebSocketReceiveMessageSchema>
export type WebSocketAck = z.infer<typeof WebSocketAckSchema>
export type WebSocketError = z.infer<typeof WebSocketErrorSchema>
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>
