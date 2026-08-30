# Creche Inteligente Rio (nome provisório)

**Transparência para a família. Inteligência para a CRE.**

Submissão do **Time 6** para o **Claude Impact Lab Rio 2026**, desafio de
dados da SME-Rio.

> Campos marcados como `_(preencher)_` ainda não foram definidos e não
> devem ser inventados.

## Equipe

- Time: Time 6
- Membros: `_(preencher)_`

## Problema

A SME-Rio tem, simultaneamente, vagas ociosas em creches e famílias em fila
de espera. O desafio pede inteligência acionável para responder:

1. Quantas vagas abrir e onde?
2. Em que ordem chamar a fila?
3. Como garantir que a família chegue à vaga dentro do prazo?

## Solução: duas perspectivas do mesmo processo

### Portal da Família (`/`)

Um cenário demonstrativo (sem dado pessoal real, Maria Souza/Ana Souza são
nomes fictícios) organizado em abas -- Minha inscrição, Minha classificação,
Minhas opções, Documentos e dados e, quando convocada, Convocação: status
da convocação, prazo, as até 5 opções escolhidas (cada uma com sub-abas de
situação/histórico, classificação, preferência e concorrência), a régua de
pontuação histórica de 2025 explicada, concorrência histórica da unidade,
sugestão de outras unidades, identidade por CPF (fictício, totalmente
mascarado), central de convocação multicanal com escalonamento, contatos
de confiança, comprovação documental com triagem assistida por Claude
(human-in-the-loop), acesso via gov.br (mock) e transparência sobre
CadÚnico/Bolsa Família, e uma explicação em linguagem simples gerada por
Claude. A **preferência da família é tratada como uma hipótese de
política em estudo** (aba "Preferência"), nunca como regra aplicada hoje.

### Painel CRE / SME (`/cre`)

Um painel operacional organizado em abas -- Visão geral, Unidades e
pressão, Convocações, Inconsistências, Auditoria e Laboratório de Política
Pública --, construído sobre `data/processed/opportunity-2025.json` (o
agregado oferta×demanda 2025 da Missão 002): cobertura da junção, ranking
de unidades por pressão, painel territorial (dados reais vs. sinais
propostos), destaque do maior caso de pressão real do dataset (unidade
7013), um drawer de detalhe por unidade com "Analisar com Claude", uma
demonstração de **classificação viva** (o que acontece quando uma
convocação expira, com trilha de auditoria), uma tela de **inconsistências**
com fluxo humano de revisão, e o **Laboratório de Política Pública** -- o
simulador de peso por ordem de preferência, com auditabilidade de ponta a
ponta (cada ação relevante gera um evento na Trilha de auditoria).

## Diferenciais

- **Laboratório de Política Pública**: simula, sobre uma amostra real de
  2025 (15 filas de maior demanda, 5.070 candidatos reais reconstruídos a
  partir da régua oficial), o efeito de somar peso pela ordem de
  preferência à pontuação socioeconômica -- pesos parametrizáveis,
  cálculo determinístico no navegador, isolado do Portal da Família.
  Sempre `Proposta`. Ver [`docs/policy-lab.md`](docs/policy-lab.md).
- **Classificação viva**: demonstra o recálculo da fila quando uma
  convocação expira (candidato convocado → prazo expira → encerramento →
  próximo elegível), sobre a ordenação real por pontuação de uma fila real.
- **Convocação multicanal com escalonamento** e **contatos de confiança**:
  mecânica demonstrativa (nenhum envio real) de como a convocação poderia
  escalar entre canais até um atendimento humano.
- **Triagem assistida por Claude + human-in-the-loop**: upload local de
  documento (nunca enviado a nenhum storage), triagem por metadados
  (nome/tipo/tamanho -- não o conteúdo do arquivo), sempre terminando em
  encaminhamento para revisão humana explícita.
- **IA explicável**: toda análise de Claude é sobre dados já calculados
  deterministicamente, nunca a fonte da classificação ou da decisão.
- **Human-in-the-loop e auditabilidade**: toda triagem por IA (documentos,
  inconsistências) termina em revisão humana explícita, e cada uma dessas
  ações gera um evento real na Trilha de auditoria do Painel CRE/SME.
- **Modo Demo**: painel guiado (header) com um roteiro de 9 passos para
  apresentar a jornada completa família→CRE em poucos minutos.

## Arquitetura

Ver [`docs/architecture.md`](docs/architecture.md) e
[`docs/deployment.md`](docs/deployment.md) para o detalhamento. Em resumo:

```text
Dataset SME → pipeline offline (Python/DuckDB) → agregados auditáveis (JSON)
→ Next.js (Portal da Família + Painel CRE/SME) → Claude (explicação, server-side)
```

## Onde o Claude atua -- e onde não atua

**Claude NUNCA**: classifica crianças, cria pontuação, altera posição de
fila, decide vulnerabilidade, inventa vagas ou inventa regra normativa.
Todo cálculo (régua de pontuação, demanda, oferta, pressão) é código
determinístico, auditável independente de LLM -- ver
[`docs/opportunity-model.md`](docs/opportunity-model.md).

**Claude SÓ**: explica, resume, contextualiza e sugere próximos passos
permitidos, a partir de dados estruturados já calculados. Quatro chamadas
reais, server-side (`src/lib/anthropic.ts`, `ANTHROPIC_API_KEY` nunca
exposta ao browser, modelo `claude-sonnet-5` -- ver
[`docs/deployment.md`](docs/deployment.md) para a justificativa da
escolha de modelo):

- **"Explique minha situação"** (Portal da Família) --
  `POST /api/claude/explain-family`.
- **"Analisar com Claude"** (Painel CRE/SME, por unidade) --
  `POST /api/claude/analyze-unit`.
- **"Analisar impacto da política"** (Laboratório de Política Pública) --
  `POST /api/claude/analyze-policy`. Nunca escolhe pesos nem recomenda
  adotar a política.
- **"Triagem assistida por Claude"** (comprovação documental) --
  `POST /api/claude/triage-document`. Nunca valida vulnerabilidade,
  concede pontuação ou decide -- sempre recomenda revisão humana.

Todas tratam a ausência/erro da API com uma mensagem amigável, sem quebrar
a página.

## Transparência normativa

A aplicação usa 5 estados visuais consistentes para nunca apresentar
hipótese como regra vigente: **Dado do desafio**, **Histórico 2025**,
**Demonstração**, **Proposta**, **Pendente SME**. Por exemplo: a duração do
prazo de confirmação de vaga não foi fornecida pelo desafio -- o cronômetro
é claramente rotulado "prazo demonstrativo", nunca uma regra oficial de 24h/48h.

## Limitações do dataset

O dataset é anonimizado (aleatorização, generalização, supressão) e seus
indicadores **não representam a realidade atual da rede** -- servem para
ilustrar a dinâmica do processo. Detalhamento completo em
[`docs/data-understanding.md`](docs/data-understanding.md) e
[`docs/opportunity-model.md`](docs/opportunity-model.md), incluindo: a
régua de pontuação muda de ano para ano; unidades públicas não têm coluna
de capacidade/meta nesta extração (só matrícula e turmas); cobertura da
junção oferta×demanda de 2025 é 99,4% (831/836 unidades), com território
disponível para 98,1%.

## O que funciona de verdade na demo

- Todos os agregados (`opportunity-2025.json`, `regua-2025.json`,
  `policy-lab-2025.json`) vêm de dados reais de 2025, com pipeline
  reprodutível (`scripts/`) e cobertura/limitações documentadas.
- As quatro chamadas Claude listadas acima são reais (não mockadas):
  chamam a API da Anthropic de verdade, server-side, e retornam a
  resposta real do modelo.
- O Laboratório de Política Pública recalcula posições de verdade
  (determinístico, no navegador) sobre os 5.070 candidatos reais da
  amostra, ao vivo conforme os sliders mudam.
- O upload de documento é real (arquivo local do navegador) e os
  metadados (nome/tamanho/tipo) enviados à triagem são reais -- só o
  conteúdo do arquivo não é lido.
- Adicionar/remover contatos de confiança e simular expiração de
  convocação alteram estado real do componente (local, sem persistência).
- Simular expiração de convocação e revisar uma inconsistência geram
  eventos reais na Trilha de auditoria (dentro da sessão, sem persistência).
- O Modo Demo navega de verdade entre as páginas e mantém o passo atual
  entre telas (via `localStorage`); ele guia e organiza a apresentação, mas
  não automatiza cliques dentro dos outros componentes (confirmar vaga,
  simular expiração etc. continuam exigindo o clique do apresentador).

## O que é integração simulada / roadmap

- **Convocação multicanal** (Portal/E-mail/WhatsApp/SMS) e o
  escalonamento: nenhum envio real acontece; é uma demonstração da
  mecânica, com WhatsApp/SMS marcados `Pendente SME` (dependem de
  integração institucional real).
- **gov.br**: botão "Entrar com gov.br" abre um modal explicativo, não faz
  OAuth nem redireciona a nenhum site externo.
- **CadÚnico / Bolsa Família**: aparecem como "Fontes de validação"
  necessárias, nunca como consulta realizada -- são dependências externas
  visíveis, não integrações reais.
- **Identidade por CPF**: os CPFs mostrados são valores totalmente
  mascarados/fictícios (`***.***.***-**`), não uma autenticação real.
- **Encerramento oficial de opções após confirmação** e **duração real do
  prazo de confirmação**: não fornecidos pelo desafio -- marcados
  `Pendente SME` em vez de uma norma inventada.
- **Classificação viva**: a expiração e o recálculo são simulados sobre
  dados reais de uma fila real; não há um job/cronjob real de expiração.

## Link da aplicação

`_(preencher)_` (ex.: `https://creche-inteligente-rio.vercel.app/`)

## Vídeo demo

`_(preencher)_`

## Rodando localmente

### Aplicação (Next.js)

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) (Portal da Família) e
[http://localhost:3000/cre](http://localhost:3000/cre) (Painel CRE/SME).

Para habilitar a integração com Claude, copie `.env.example` para
`.env.local` e preencha `ANTHROPIC_API_KEY` (nunca commitar `.env.local`).
Sem a chave, a aplicação continua funcionando normalmente -- só os botões
"Explique minha situação" e "Analisar com Claude" retornam um aviso
amigável.

### Pipeline de dados (Python)

Requer o dataset da SME como pasta irmã deste repositório
(`../dadoscreche`) -- ver [`scripts/README.md`](scripts/README.md).

```bash
uv venv .venv && source .venv/bin/activate
uv pip install -r scripts/requirements.txt
python scripts/build_summary.py
python scripts/build_opportunity.py
python scripts/build_regua.py
python scripts/build_policy_lab.py
```

Isso gera `data/processed/summary.json`, `opportunity-2025.json`,
`regua-2025.json` e `policy-lab-2025.json` -- os únicos artefatos que a
aplicação lê em tempo de execução (nunca o dataset bruto).

## Deploy

Ver [`docs/deployment.md`](docs/deployment.md).
