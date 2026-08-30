import "server-only";

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5";

let client: Anthropic | null = null;

/**
 * Server-only Anthropic client. Import this module only from server
 * components, route handlers or server actions -- the `server-only`
 * import throws a build error if it ever ends up in a client bundle.
 * Reads the key exclusively from ANTHROPIC_API_KEY; never pass a key
 * from the browser.
 */
export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY não configurada. Defina em .env.local (nunca commitar).",
    );
  }
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export const ANTHROPIC_MODEL = MODEL;
