# Pipeline offline

Scripts Python que leem o dataset bruto da SME (`../dadoscreche`, fora deste
repositório) e produzem agregados pequenos e auditáveis em `data/processed/`.
A aplicação Next.js só consome esses agregados -- nunca os CSVs brutos.

## Setup

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -r scripts/requirements.txt
```

(ou `pip install -r scripts/requirements.txt` com um venv criado por `python -m venv`.)

## Localização do dataset

Por padrão os scripts esperam `dadoscreche/` como pasta irmã de `app/`
(mesmo layout deste repositório). Para apontar para outro lugar:

```bash
export DADOSCRECHE_DIR=/caminho/para/dadoscreche
```

## Scripts

- `build_summary.py` -- lê a Query A via DuckDB (streaming, sem carregar o
  CSV inteiro em memória) e gera `data/processed/summary.json` com
  contagens por ano e por situação da inscrição.

```bash
python scripts/build_summary.py
```
