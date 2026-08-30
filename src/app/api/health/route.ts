import { NextResponse } from "next/server";

import { readDatasetSummary } from "@/lib/summary";
import { readOpportunitySummary } from "@/lib/opportunity";

// Reads small JSON aggregates from disk via node:fs -- needs the Node.js
// runtime, not Edge. No external calls, no env var presence is reported.
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    aggregates: {
      summary: readDatasetSummary() !== null,
      opportunity2025: readOpportunitySummary() !== null,
    },
  });
}
