# Claude Impact Lab Rio 2026 — Copiloto da Fila da Creche (nome provisório)

Submissão do **Claude Impact Lab Rio 2026** para o desafio de dados da
SME-Rio: inteligência acionável para oferta, fila e convocação de vagas de
creche.

> Este README é o placeholder inicial da submissão. Campos marcados como
> `_(preencher)_` ainda não foram definidos e não devem ser inventados.

## Equipe

- Nome da equipe: `_(preencher)_`
- Membros: `_(preencher)_`

## Resumo

A SME-Rio tem, simultaneamente, vagas ociosas em creches e famílias em fila
de espera. Este projeto usa os dados históricos de inscrição em creche
(2021–2025, anonimizados) para ajudar a responder três perguntas:

1. Quantas vagas abrir e onde?
2. Em que ordem chamar a fila?
3. Como garantir que a família chegue à vaga dentro do prazo?

A jornada de produto completa ainda está em definição pelo time — o estado
atual deste repositório é o bootstrap técnico (pipeline de dados + app +
página de diagnóstico), não a experiência final.

## Arquitetura

Ver [`docs/architecture.md`](docs/architecture.md) para o detalhamento. Em
resumo:

```text
Dataset SME → pipeline offline (Python/DuckDB) → agregados auditáveis (JSON)
→ Next.js → Claude (explicação, server-side) → recomendações para o servidor
```

O cálculo que decide prioridade/classificação é sempre determinístico e
auditável; o Claude só explica e comunica, nunca inventa uma classificação.

Entendimento detalhado dos dados brutos da SME em
[`docs/data-understanding.md`](docs/data-understanding.md).

## Uso do Claude durante o desenvolvimento

`_(preencher)_` — registrar aqui como o Claude Code foi usado para construir
este projeto durante o hackathon (ex.: bootstrap, exploração de dados,
revisão de código).

## Uso do Claude dentro da aplicação

Nesta fase, apenas a integração server-side foi preparada
(`src/lib/anthropic.ts`, chave via `ANTHROPIC_API_KEY`) — nenhuma feature de
IA está ativa no produto ainda. `_(preencher)_` quando a jornada de
uso do Claude no produto for definida.

## Link da aplicação

`_(preencher)_`

## Vídeo demo

`_(preencher)_`

## Rodando localmente

### Aplicação (Next.js)

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para habilitar a integração com Claude, copie `.env.example` para
`.env.local` e preencha `ANTHROPIC_API_KEY` (nunca commitar `.env.local`).

### Pipeline de dados (Python)

Requer o dataset da SME como pasta irmã deste repositório
(`../dadoscreche`) — ver [`scripts/README.md`](scripts/README.md).

```bash
uv venv .venv && source .venv/bin/activate
uv pip install -r scripts/requirements.txt
python scripts/build_summary.py
```

Isso gera `data/processed/summary.json`, o único artefato que a aplicação lê
em tempo de execução.
