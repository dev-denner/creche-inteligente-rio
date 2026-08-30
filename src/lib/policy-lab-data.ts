import fs from "node:fs";
import path from "node:path";

import type { PolicyLabData } from "@/lib/policy-lab";

// Server-only file reading -- see the note in lib/opportunity-data.ts.
export function readPolicyLabData(): PolicyLabData | null {
  const filePath = path.join(process.cwd(), "data", "processed", "policy-lab-2025.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
