import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:8000'),
  VITE_WS_URL: z.string().url().default('ws://localhost:8000/ws'),
})

export const config = envSchema.parse({
  VITE_API_URL: 'http://localhost:8000',
  VITE_WS_URL: 'ws://localhost:8000/ws',
})

export const API_BASE_URL = config.VITE_API_URL
export const WS_BASE_URL = config.VITE_WS_URL
