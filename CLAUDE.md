@AGENTS.md

# Creche Inteligente Rio

Produto público de demonstração para a SME-Rio. Time 6, Claude Impact Lab
Rio 2026. Prioriza MVP demonstrável, impacto e clareza — evitar
overengineering.

Referências (não replicar aqui, consultar quando necessário):
@README.md
@docs/architecture.md
@docs/data-understanding.md
@docs/opportunity-model.md
@docs/policy-lab.md
@docs/deployment.md

## Arquitetura

- Next.js 16 / TypeScript / Tailwind / Vercel.
- Pipeline offline Python + DuckDB (`scripts/`).
- Dados brutos oficiais ficam fora do repo em `../dadoscreche` e são
  **somente leitura** — nunca modificar, nunca copiar dataset bruto para
  o repo.
- Produção consome apenas pequenos agregados versionados em
  `data/processed/` (nunca o dataset bruto, nunca em runtime).
- Sem banco de dados no MVP.
- Anthropic API somente server-side (`src/lib/anthropic.ts`).
- Cálculos e regras determinísticas em código. Claude explica, analisa e
  apoia; **Claude não decide** classificação, pontuação normativa,
  vulnerabilidade ou abertura de vagas.

## Proveniência obrigatória

Toda feature apresentada ao usuário deve se enquadrar claramente em uma
destas categorias (badges já existem em `src/components/ProvenanceBadge.tsx`):

1. `Dado do desafio`
2. `Histórico 2025`
3. `Demonstração`
4. `Proposta`
5. `Pendente SME`

Nunca apresentar mock, hipótese ou regra proposta como dado real ou regra
vigente.

## Dados

- Dataset 2021–2025 é anonimizado; indicadores **não representam a
  realidade atual da rede**.
- Demo operacional usa principalmente 2025.
- Query A possui múltiplas opções por inscrição — demanda de 1ª
  preferência e demanda total são conceitos diferentes, nunca confundir.
- Capacidade/vaga confiável está disponível principalmente para unidades
  **parceiras**. Unidade pública sem capacidade conhecida deve mostrar
  `Capacidade não disponível nesta extração`, **nunca zero**.
- Chave de relacionamento validada: código institucional convertido para
  **inteiro simples, sem padding de zeros assumido** (não usar zfill
  uniforme — quebra unidades parceiras). Ver `docs/opportunity-model.md`.
- `TRIM()` no campo `grupamento` é obrigatório (traz espaço em branco à
  direita em pelo menos um valor).
- Não usar fuzzy matching silencioso em nenhuma junção.
- Não comparar pontuação/régua entre anos sem considerar que a régua muda
  de composição e peso ano a ano.

## Identidade

Decisão validada com representantes da Prefeitura durante o hackathon:

- CPF do responsável pode autenticar/acessar.
- CPF da própria criança é o identificador individual da criança.
- O dataset anonimizado **não possui CPF real**.
- Todo CPF usado na demo deve ser **obviamente fictício** e não derivado
  do dataset (nunca gerar um CPF que pareça real ou válido).

## Preferência — diferencial central

A ordem de preferência da família é uma das principais hipóteses de
inovação do produto. A aplicação deve permitir demonstrar/simular uma
política em que:

- 1ª a 5ª opção podem receber pesos parametrizáveis;
- esse peso pode ser combinado à pontuação socioeconômica;
- mudanças de peso permitem comparar cenário atual vs. cenário simulado;
- cálculo é determinístico e auditável (nunca calculado por Claude);
- Claude pode explicar impactos sobre posição/fila/unidade quando os
  dados permitirem, mas não calcula nem escolhe a política.

Tratar sempre como **Simulador de Política Pública**: badge `Proposta`
sempre visível, nunca aplicar silenciosamente ao fluxo atual, deixar
explícito que preferência-como-pontuação **não é regra vigente**.

## Regras parametrizáveis

Critérios, pesos, desempate, prazo e transições de status não devem ser
hardcoded como regras permanentes da SME — preferir estruturas
parametrizáveis. Se a regra oficial não estiver disponível: marcar
`Pendente SME`, demonstrar o mecanismo, **nunca inventar a norma**.

## Convocação

Diferencial a demonstrar: timeline por opção, classificação viva,
convocação, cronômetro, confirmação, avanço de fila, comunicação
multicanal, contatos de confiança. Integrações reais com
WhatsApp/SMS/e-mail **não são necessárias no MVP**. Quando simuladas:
mostrar estado do canal, marcar `Demonstração` ou `Pendente SME`, **nunca
afirmar envio real**.

## Documentos e IA

Upload/triagem documental deve demonstrar human-in-the-loop. Claude pode:
identificar tipo aparente, resumir, verificar legibilidade, sinalizar
inconsistências, recomendar revisão. Claude **não pode**: validar
oficialmente vulnerabilidade, conceder pontuação, rejeitar benefício,
substituir servidor responsável. Toda decisão sensível termina em ação
humana explícita.

## Integrações externas

CadÚnico, Bolsa Família, gov.br, ICH, WhatsApp, SMS e equivalentes podem
aparecer como arquitetura ou mocks interativos. Obrigatório: marcar a
dependência externa, não fingir que a integração foi realizada, deixar
claro o contrato/intenção de integração.

## Produto

Duas perspectivas do mesmo processo:

**Portal da Família** (transparência): opções, posição/status, timeline,
pontuação, concorrência histórica, convocação, prazo, confirmação,
explicação Claude, documentos, comunicações.

**Visão CRE** (inteligência operacional): pressão oferta × demanda,
território, grupamento/turno, fila observada, capacidade quando
conhecida, análise Claude, simulador de política pública.

## UX

- Linguagem simples; interface institucional, moderna e acessível.
- Não parecer dashboard técnico.
- Não usar textos como "em construção" na experiência principal.
- Mock deve parecer protótipo funcional, mas claramente identificado
  (badges de proveniência).
- Priorizar demo navegável em poucos minutos.

## Segurança

Nunca:
- commitar secrets;
- usar `NEXT_PUBLIC_ANTHROPIC_API_KEY`;
- enviar dados pessoais reais para Claude;
- colocar CPFs reais na demo;
- modificar `../dadoscreche`;
- fazer push sem instrução explícita.

## Git

- Commits pequenos por missão.
- Pode commitar localmente ao final da missão.
- **Não fazer push sem autorização explícita**, mesmo que uma missão
  anterior tenha sido pushed pelo usuário.

## Validação

```bash
npm run lint
npm run typecheck
npm run build
```

Executar somente as validações pertinentes à mudança feita; não gastar
tempo com verificações redundantes sem motivo.

## Prioridade do hackathon

Entre arquitetura perfeita e feature demonstrável, preferir feature
demonstrável — desde que não comprometa integridade dos dados,
transparência ou segurança.
