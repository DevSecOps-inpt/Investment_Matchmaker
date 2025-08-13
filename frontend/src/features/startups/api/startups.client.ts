import { z } from "zod";
import { StartupSchema } from "./schemas";

export async function getStartups() {
  const response = await fetch('/api/startups');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return z.array(StartupSchema).parse(data);
}
