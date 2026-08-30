# Arquitetura

Estado desta missão: bootstrap técnico. A jornada de produto final ainda não
está definida — esta arquitetura é intencionalmente simples e deve evoluir
conforme o time decidir o que construir.

```text
Dataset SME (../dadoscreche, fora do repo)
    ↓
Pipeline offline (Python: DuckDB/Pandas) — scripts/
    ↓
Dados agregados auditáveis (JSON/CSV pequenos) — data/processed/
    ↓
Next.js (App Router, server components leem os agregados do disco)
    ↓
Claude (server-side, ANTHROPIC_API_KEY) — camada de explicação/recomendação
    ↓
Explicações e recomendações apresentadas ao servidor público
```

## Separação de responsabilidades

**Cálculo determinístico (Python + DuckDB/Pandas, offline):**
- Lê os CSVs/XLSX brutos de `../dadoscreche`.
- Faz contagens, agregações, junções e a régua de pontuação declarada em
  `03_QueryC_PerguntasComDescricao` — tudo com lógica auditável e testável.
- Produz artefatos pequenos em `data/processed/` (hoje: `summary.json`).
- Roda fora do ciclo de request do usuário. A aplicação nunca processa os
  CSVs brutos em tempo real.

**Aplicação (Next.js, App Router):**
- Server components leem os agregados de `data/processed/` do disco.
- Não há banco de dados nesta fase — os agregados são arquivos.
- Renderiza os números e explicações; não reimplementa nenhuma regra de
  classificação em JavaScript.

**Análise/recomendação com IA (Claude, server-side):**
- Usada apenas para **explicar e comunicar** o que o cálculo determinístico já
  produziu (ex.: "por que esta criança está nesta posição da fila", "onde
  abrir vagas e por quê") em linguagem compreensível para um servidor público.
- Nunca é a fonte da classificação, da pontuação ou de qualquer decisão sobre
  vaga — essas vêm do cálculo determinístico, auditável independente de LLM.
- Chamada exclusivamente server-side (`src/lib/anthropic.ts`), lendo
  `ANTHROPIC_API_KEY` do ambiente. A chave nunca chega ao browser.
- Nesta missão, apenas a abstração de cliente foi preparada — nenhuma feature
  de chat ou chamada real à API foi implementada, para não gastar tokens sem
  necessidade.

## Por que essa separação importa aqui

O uso será por servidores públicos decidindo sobre vagas e fila de crianças
reais (ainda que sobre dados anonimizados/de treino neste hackathon). Uma
recomendação que define prioridade de atendimento precisa ser auditável e
reproduzível sem depender de um modelo de linguagem "inventar" uma
classificação — por isso a régua de pontuação e os agregados vêm de código
determinístico versionado, e o Claude entra só na camada de explicação.
