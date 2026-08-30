# Deploy na Vercel

Este repositório (`app/`) é a raiz do projeto Next.js a ser publicado. Ele
**não depende de nada fora de si mesmo** em runtime: os agregados que a
aplicação lê já estão versionados em `data/processed/*.json`, e o pipeline
Python/DuckDB que os gera (`scripts/`, lendo `../dadoscreche`) roda só
localmente, nunca em produção.

## Por que não há `vercel.json`

Não foi criado. O Next.js é detectado automaticamente pela Vercel a partir
de `package.json` (`next`, `next build`, `next start`) sem nenhuma
configuração extra — não há monorepo, output customizado, rewrites ou
headers especiais que justifiquem um `vercel.json`. Se isso mudar no
futuro, crie um só para a necessidade concreta, não por precaução.

## Passo a passo

### 1. GitHub

Esta missão não faz push. Quando autorizado:

```bash
git push -u origin main
```

### 2. Vercel

1. Importar o repositório GitHub.
2. **Framework Preset**: `Next.js` (detectado automaticamente).
3. **Root Directory**: raiz do repositório (não mover para subpasta).
4. **Build/Install/Output Command**: não alterar os padrões
   (`npm ci` / `next build` / `.next`).
5. **Environment Variable**:
   - Name: `ANTHROPIC_API_KEY`
   - Value: chave da Anthropic (nunca commitar em nenhum arquivo)
   - Environments: Production, Preview e Development, conforme apropriado.
6. Deploy.
7. Validar a URL pública (página inicial deve carregar e mostrar os
   agregados de `data/processed/`).
8. Validar `GET /<url>/api/health` → deve responder
   `{"status":"ok","aggregates":{"summary":true,"opportunity2025":true}}`.

### 3. Atualizações seguintes

```text
commit → push main → Vercel redeploy automático
```

Sempre que o pipeline local (`python scripts/build_summary.py`,
`python scripts/build_opportunity.py`, `python scripts/build_regua.py`,
`python scripts/build_policy_lab.py`) gerar uma versão nova dos agregados,
commitar os JSONs atualizados em
`data/processed/` e dar push — o próximo deploy da Vercel já serve a versão
nova. A Vercel **não** roda Python nem acessa `../dadoscreche`; ela só
empacota o que já está no repositório.

## Configuração assumida

| Item | Valor |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | raiz do repositório |
| Install Command | padrão (`npm ci`) |
| Build Command | padrão (`next build`) |
| Output Directory | padrão do Next.js (`.next`) |
| Node.js | 22.x (`engines.node` em `package.json`) |
| Package manager | npm (`package-lock.json` versionado) |
| Environment Variable | `ANTHROPIC_API_KEY` (server-side apenas) |
| Production Branch | `main` |

## Node.js: por que 22.x, não 24.x

O ambiente de desenvolvimento local está em Node 24. Fixamos
`engines.node: "22.x"` no `package.json` por segurança de compatibilidade
com a plataforma de deploy: Node 22 é LTS estável e a escolha mais
conservadora para uma demo de hackathon, evitando depender de uma versão
mais recente que pode não estar disponível ou testada na Vercel. O build
completo (`npm ci`, lint, typecheck, build, start) foi validado nesta
missão rodando explicitamente sob Node 22.22.3 — ver relatório da missão.

## O que a aplicação publicada NÃO faz

- Não acessa `../dadoscreche` em nenhum momento (nem build, nem runtime) —
  todo o dado que ela lê é `data/processed/*.json`, versionado no repo.
- Não chama a API da Anthropic durante o build.
- Não exige `ANTHROPIC_API_KEY` para compilar ou para servir qualquer
  página (`/`, `/cre`, `/api/health`). A chave só é lida quando o usuário
  aciona uma das quatro chamadas Claude (`/api/claude/explain-family`,
  `/api/claude/analyze-unit`, `/api/claude/analyze-policy`,
  `/api/claude/triage-document`) — sem a chave, essas rotas respondem 503
  com uma mensagem amigável, sem derrubar a página.
- Não usa Edge Runtime em nenhuma rota que dependa de `node:fs` ou do SDK
  da Anthropic — `/api/health` e as quatro rotas `/api/claude/*` declaram
  `export const runtime = "nodejs"` explicitamente.
- Usa `claude-sonnet-5`, não `claude-opus-5`, nas quatro chamadas do
  produto: teste comparativo feito na Missão 005 (mesmo prompt curto)
  mediu Sonnet 5 respondendo em ~3,2s contra ~6,9s do Opus 5 (que inclusive
  truncou no mesmo `max_tokens`), ambos plenamente aderentes às regras do
  sistema. Para explicações curtas de dados já calculados, a diferença de
  latência compensa; Claude Code (este agente) continua usando Opus.

## Variáveis de ambiente

| Nome | Onde | Observação |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Servidor apenas (Vercel Environment Variables) | Nunca prefixar com `NEXT_PUBLIC_` — isso a exporia ao browser. Lida só em `src/lib/anthropic.ts`, dentro de uma função, nunca no escopo do módulo. |

Não existe (e não deve existir) nenhuma variável `NEXT_PUBLIC_ANTHROPIC*`.

## Atualizar os agregados versionados

```bash
uv venv .venv && source .venv/bin/activate   # uma vez
uv pip install -r scripts/requirements.txt
python scripts/build_summary.py
python scripts/build_opportunity.py
git add data/processed/*.json
git commit -m "chore(data): refresh processed aggregates"
git push
```
