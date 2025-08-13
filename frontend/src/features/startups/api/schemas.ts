import { z } from "zod";

// Shape actually returned by the backend (snake_case + owner string)
export const StartupApiSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  funding_needed: z.number(),
  created_at: z.string(),
  owner: z.string(),
  owner_id: z.string()
});

// App-level shape used by your UI (camelCase, explicit ownerName)
export const StartupSchema = StartupApiSchema.transform((raw) => ({
  id: raw.id,
  title: raw.title,
  category: raw.category,
  description: raw.description,
  fundingNeeded: raw.funding_needed,
  createdAt: raw.created_at,
  ownerName: raw.owner,
  ownerId: raw.owner_id
}));

export type Startup = z.infer<typeof StartupSchema>;
