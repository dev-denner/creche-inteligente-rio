// Client-safe: parses Claude's plain-text response into labeled sections
// (the system prompts ask for "Label: texto" paragraphs). Falls back to a
// single "Resposta" section if the expected labels aren't found -- never
// throws, never hides the raw text.

export type ClaudeSection = { titulo: string; corpo: string };

export function parseClaudeSections(text: string, labels: string[]): ClaudeSection[] {
  if (!text.trim()) return [];

  const pattern = new RegExp(`(?:^|\\n)\\s*\\**(${labels.map(escapeRegExp).join("|")})\\**\\s*:\\s*`, "gi");
  const matches = [...text.matchAll(pattern)];

  if (matches.length === 0) {
    return [{ titulo: "Resposta", corpo: text.trim() }];
  }

  const sections: ClaudeSection[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const start = match.index! + match[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const corpo = text.slice(start, end).trim();
    const titulo = labels.find((l) => l.toLowerCase() === match[1].toLowerCase()) ?? match[1];
    if (corpo) sections.push({ titulo, corpo });
  }

  return sections.length > 0 ? sections : [{ titulo: "Resposta", corpo: text.trim() }];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
