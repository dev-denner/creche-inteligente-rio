import fs from "node:fs";
import path from "node:path";

import type { OpportunityData } from "@/lib/opportunity";

// Server-only file reading. Import this ONLY from server components/route
// handlers, never from a "use client" component -- see the note in
// ./opportunity for why mixing this with client-safe helpers breaks the
// client bundle.
export function readOpportunityData(): OpportunityData | null {
  const filePath = path.join(process.cwd(), "data", "processed", "opportunity-2025.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
