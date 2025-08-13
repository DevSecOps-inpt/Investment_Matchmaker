import { API_BASE_URL } from './config'
import { ApiErrorSchema } from './schemas'
import { z } from 'zod'

class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

async function handleResponse<T>(response: Response, schema?: z.ZodType<T>): Promise<T> {
  if (!response.ok) {
    let errorData: { code: string; message: string; details?: unknown } = {
      code: 'HTTP_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`,
    }

    try {
      const errorResponse = await response.json()
      const parsed = ApiErrorSchema.safeParse(errorResponse)
      if (parsed.success) {
        errorData = parsed.data.error
      }
    } catch {
      // If we can't parse the error response, use the default error
    }

    throw new HttpError(response.status, errorData.code, errorData.message, errorData.details)
  }

  const data = await response.json()
  
  if (schema) {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw new HttpError(
        500,
        'VALIDATION_ERROR',
        'Response validation failed',
        { errors: result.error.errors }
      )
    }
    return result.data
  }

  return data
}

export const http = {
  async get<T>(endpoint: string, schema?: z.ZodType<T>): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return handleResponse(response, schema)
  },

  async post<T>(endpoint: string, data: unknown, schema?: z.ZodType<T>): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response, schema)
  },

  async put<T>(endpoint: string, data: unknown, schema?: z.ZodType<T>): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response, schema)
  },

  async delete<T>(endpoint: string, schema?: z.ZodType<T>): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return handleResponse(response, schema)
  },
}

export { HttpError }
