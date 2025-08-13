import { z } from "zod";

const StartupApiSnake = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  funding_needed: z.number().nullable().default(0),
  created_at: z.string(),
  owner: z.string(),
  owner_id: z.string()
});

const StartupApp = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  description: z.string(),
  fundingNeeded: z.number(),
  createdAt: z.string(),
  ownerName: z.string(),
  ownerId: z.string()
});

// transform one item
export const StartupSchema = StartupApiSnake.transform((raw): z.infer<typeof StartupApp> => ({
  id: raw.id,
  title: raw.title,
  category: raw.category,
  description: raw.description,
  fundingNeeded: raw.funding_needed ?? 0,
  createdAt: raw.created_at,
  ownerName: raw.owner,
  ownerId: raw.owner_id
}));

// accept array OR {items: []}
const ListUnion = z.union([
  z.array(StartupApiSnake),
  z.object({ items: z.array(StartupApiSnake) }).transform((o) => o.items),
]);

export const StartupListSchema = ListUnion.transform((arr) =>
  arr.map((raw) => StartupSchema.parse(raw))
);

export type Startup = z.infer<typeof StartupApp>;
