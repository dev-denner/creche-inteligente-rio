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

Um cenário demonstrativo (sem dado pessoal real) mostrando como uma família
poderia acompanhar sua inscrição: status da convocação, prazo, as até 5
opções escolhidas com status e linha do tempo, a régua de pontuação
histórica de 2025 explicada, concorrência histórica da unidade, sugestão de
outras unidades e uma explicação em linguagem simples gerada por Claude.

### Visão CRE (`/cre`)

Um painel operacional real, construído sobre `data/processed/opportunity-2025.json`
(o agregado oferta×demanda 2025 da Missão 002): cobertura da junção,
ranking de unidades por pressão, destaque do maior caso de pressão real do
dataset (unidade 7013), e um drawer de detalhe por unidade com "Analisar
com Claude".

## Arquitetura

Ver [`docs/architecture.md`](docs/architecture.md) e
[`docs/deployment.md`](docs/deployment.md) para o detalhamento. Em resumo:

```text
Dataset SME → pipeline offline (Python/DuckDB) → agregados auditáveis (JSON)
→ Next.js (Portal da Família + Visão CRE) → Claude (explicação, server-side)
```

## Onde o Claude atua -- e onde não atua

**Claude NUNCA**: classifica crianças, cria pontuação, altera posição de
fila, decide vulnerabilidade, inventa vagas ou inventa regra normativa.
Todo cálculo (régua de pontuação, demanda, oferta, pressão) é código
determinístico, auditável independente de LLM -- ver
[`docs/opportunity-model.md`](docs/opportunity-model.md).

**Claude SÓ**: explica, resume, contextualiza e sugere próximos passos
permitidos, a partir de dados estruturados já calculados. Duas chamadas
reais, server-side (`src/lib/anthropic.ts`, `ANTHROPIC_API_KEY` nunca
exposta ao browser):

- **"Explique minha situação"** (Portal da Família) --
  `POST /api/claude/explain-family`.
- **"Analisar com Claude"** (Visão CRE, por unidade) --
  `POST /api/claude/analyze-unit`.

Ambas tratam a ausência/erro da API com uma mensagem amigável, sem quebrar
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
[http://localhost:3000/cre](http://localhost:3000/cre) (Visão CRE).

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
```

Isso gera `data/processed/summary.json`, `opportunity-2025.json` e
`regua-2025.json` -- os únicos artefatos que a aplicação lê em tempo de
execução (nunca o dataset bruto).

## Deploy

Ver [`docs/deployment.md`](docs/deployment.md).
