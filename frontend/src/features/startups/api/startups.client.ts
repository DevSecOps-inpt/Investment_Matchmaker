import { StartupListSchema, Startup } from "./schemas";
import { http } from "../../../lib/http";
import { parseOrThrow } from "../../../lib/zod-helpers";

export async function getStartups(): Promise<Startup[]> {
  const data = await http.get<unknown>("/api/startups");
  return parseOrThrow<Startup[]>(StartupListSchema, data);
}
