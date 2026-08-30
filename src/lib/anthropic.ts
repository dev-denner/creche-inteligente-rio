import "server-only";

import Anthropic from "@anthropic-ai/sdk";

// claude-sonnet-5, not claude-opus-5: measured in this repo (Missão 005) with
// the same short explanatory prompt -- Sonnet 5 answered in ~3.2s vs Opus 5's
// ~6.9s (Opus even got truncated at the same max_tokens), both fully on-policy.
// These are short, low-complexity explanations of already-computed data, not
// long-horizon reasoning, so the latency win is worth taking for the demo.
const MODEL = "claude-sonnet-5";

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

const STRUCTURE_3 = `
Estruture a resposta em exatamente estas três linhas (cada uma seguida de ":" e o texto na sequência, sem markdown, sem título extra antes da primeira): "Resumo:", "Pontos de atenção:", "Próximo passo:".
`.trim();

const FAMILY_SYSTEM_PROMPT = `
Você ajuda uma família a entender a situação da inscrição de creche dela, usando SOMENTE os dados estruturados fornecidos na mensagem do usuário (um cenário demonstrativo baseado no desafio de dados da SME-Rio).

${SHARED_RULES}

${STRUCTURE_3}

Contexto adicional: os dados que você recebe podem ser de um cenário demonstrativo (não uma família real) -- trate-os normalmente para fins de explicação, mas nunca chame o cenário de real.
`.trim();

const CRE_SYSTEM_PROMPT = `
Você ajuda um servidor da Coordenadoria Regional de Educação (CRE) a entender por que uma unidade de creche aparece com pressão entre oferta e demanda, usando SOMENTE os dados estruturados fornecidos na mensagem do usuário (agregados históricos de 2025 do desafio de dados da SME-Rio).

${SHARED_RULES}

${STRUCTURE_3}

Além disso:
- Nunca diga diretamente "abra X vagas" como uma ordem definitiva. Prefira formulações como "avaliar expansão de capacidade", "verificar unidades próximas", "investigar redistribuição territorial" ou "confirmar disponibilidade/capacidade oficial".
- Se a unidade não tiver capacidade/meta conhecida nos dados, diga isso explicitamente e recomende confirmar a capacidade oficial antes de qualquer decisão.
- Em "Pontos de atenção", cubra fatores observados e limitações dos dados. Em "Próximo passo", cubra possíveis ações de investigação.
`.trim();

const POLICY_SYSTEM_PROMPT = `
Você ajuda um servidor da SME/CRE a entender o resultado de uma simulação feita no Laboratório de Política Pública: o efeito de somar peso pela ordem de preferência da família à pontuação socioeconômica, em uma amostra real de filas de creche de 2025.

${SHARED_RULES}

Estruture a resposta em exatamente estas quatro linhas (cada uma seguida de ":" e o texto na sequência, sem markdown, sem título extra antes da primeira): "O que mudou:", "Benefícios potenciais:", "Riscos e efeitos adversos:", "Pontos para análise normativa:".

Além disso:
- Esta é uma simulação/proposta em avaliação, NUNCA uma regra vigente. Nunca recomende aplicá-la automaticamente.
- Você NÃO escolhe os pesos nem decide se a política deve ser adotada -- isso é decisão institucional/normativa humana.
- Em "O que mudou", cubra as principais mudanças observadas e grupos/unidades mais afetados. Em "Pontos para análise normativa", cubra o que exigiria avaliação institucional antes de qualquer adoção.
- Lembre que a amostra é real mas parcial (15 filas de maior demanda de 2025, sem replicar critérios de desempate oficiais) -- não generalize para toda a rede sem ressalva.
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

export async function analyzePolicyImpact(context: unknown): Promise<string> {
  const userContent = `Analise o impacto desta simulação de política com base nestes dados estruturados (JSON):\n\n${JSON.stringify(context, null, 2)}`;
  return callClaude(POLICY_SYSTEM_PROMPT, userContent);
}

const DOCUMENT_SYSTEM_PROMPT = `
Você faz uma triagem inicial e assistida de um documento enviado por uma família, para apoiar (nunca substituir) um servidor humano responsável.

${SHARED_RULES}

Você recebe SOMENTE metadados do arquivo (nome, tipo MIME, tamanho) -- nunca o conteúdo/bytes reais do documento neste protótipo. Por isso:
- Você NÃO pode confirmar legibilidade real do conteúdo -- diga explicitamente que isso não é verificável neste protótipo sem acesso ao conteúdo do arquivo, e que precisa de revisão humana.
- Você pode inferir um "tipo aparente" plausível a partir do nome do arquivo (ex.: "comprovante_residencia.pdf" sugere comprovante de residência), sempre deixando claro que é uma inferência pelo nome, não uma leitura do conteúdo.
- Você NUNCA valida oficialmente vulnerabilidade, concede pontuação, rejeita benefício ou decide algo -- sua saída é só um apoio para o servidor revisar.
- Estruture a resposta em exatamente estas linhas: "Documento legível:", "Tipo aparente:", "Ponto de atenção:", "Recomendação:" (a recomendação deve sempre mencionar revisão humana).
`.trim();

export async function triageDocument(context: unknown): Promise<string> {
  const userContent = `Faça a triagem inicial deste documento com base nestes metadados (JSON, sem conteúdo do arquivo):\n\n${JSON.stringify(context, null, 2)}`;
  return callClaude(DOCUMENT_SYSTEM_PROMPT, userContent);
}
