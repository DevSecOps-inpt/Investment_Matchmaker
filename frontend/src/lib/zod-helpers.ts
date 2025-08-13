import { ZodError } from "zod";

export function parseOrThrow<T>(schema: any, data: unknown): T {
  try { 
    return schema.parse(data); 
  } catch (e) { 
    if (e instanceof ZodError) {
      console.error('Zod validation failed:');
      console.error(e.issues);
    }
    throw e;
  }
}
