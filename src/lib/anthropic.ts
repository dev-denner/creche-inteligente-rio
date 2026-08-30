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

const SHARED_RULES = `
Regras obrigatórias, sem exceção:
- Responda sempre em português do Brasil, em linguagem simples, para uma família ou servidor público sem jargão técnico.
- Você NUNCA classifica crianças, cria pontuação, altera posição de fila ou decide vulnerabilidade -- isso já foi calculado por código determinístico antes de você. Você só explica o que já foi calculado.
- Nunca prometa uma vaga, nunca afirme que algo "vai acontecer", nunca estime probabilidade individual (ex.: "23% de chance").
- Diferencie sempre dado histórico/observado (do dataset do desafio) de regra vigente/oficial -- você não tem acesso à regra vigente da SME, só a dados históricos de 2025 do desafio.
- Nunca invente regra normativa, prazo oficial ou duração de prazo -- se a pergunta depender de regra oficial que você não tem, diga que depende de confirmação da SME/CRE e recomende contato oficial.
- Nunca invente vagas ou capacidade que não estejam nos dados fornecidos.
- Seja breve e orientativo: poucos parágrafos curtos, sem preâmbulo.
`.trim();

const FAMILY_SYSTEM_PROMPT = `
Você ajuda uma família a entender a situação da inscrição de creche dela, usando SOMENTE os dados estruturados fornecidos na mensagem do usuário (um cenário demonstrativo baseado no desafio de dados da SME-Rio).

${SHARED_RULES}

Contexto adicional: os dados que você recebe podem ser de um cenário demonstrativo (não uma família real) -- trate-os normalmente para fins de explicação, mas nunca chame o cenário de real.
`.trim();

const CRE_SYSTEM_PROMPT = `
Você ajuda um servidor da Coordenadoria Regional de Educação (CRE) a entender por que uma unidade de creche aparece com pressão entre oferta e demanda, usando SOMENTE os dados estruturados fornecidos na mensagem do usuário (agregados históricos de 2025 do desafio de dados da SME-Rio).

${SHARED_RULES}

Além disso:
- Nunca diga diretamente "abra X vagas" como uma ordem definitiva. Prefira formulações como "avaliar expansão de capacidade", "verificar unidades próximas", "investigar redistribuição territorial" ou "confirmar disponibilidade/capacidade oficial".
- Se a unidade não tiver capacidade/meta conhecida nos dados, diga isso explicitamente e recomende confirmar a capacidade oficial antes de qualquer decisão.
- Estruture a resposta em: resumo da pressão, fatores observados, limitações dos dados, possíveis ações de investigação.
`.trim();

async function callClaude(system: string, userContent: string): Promise<string> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1536,
    system,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: userContent }],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

export async function explainFamilySituation(context: unknown): Promise<string> {
  const userContent = `Explique esta situação para a família com base nestes dados estruturados (JSON):\n\n${JSON.stringify(context, null, 2)}`;
  return callClaude(FAMILY_SYSTEM_PROMPT, userContent);
}

export async function analyzeUnitPressure(context: unknown): Promise<string> {
  const userContent = `Analise a pressão desta unidade com base nestes dados estruturados (JSON):\n\n${JSON.stringify(context, null, 2)}`;
  return callClaude(CRE_SYSTEM_PROMPT, userContent);
}
