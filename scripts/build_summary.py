"""Builds a small, auditable JSON summary from Query A (inscricoes).

Reads the raw dataset via DuckDB (streamed, no full in-memory load) and
writes an aggregate artifact to data/processed/summary.json. This is the
only thing the Next.js diagnostic page reads at runtime -- never the
raw multi-hundred-MB CSVs.

Usage:
    python scripts/build_summary.py
"""

import json

import duckdb

from _common import PROCESSED_DIR, query_a_path


def main() -> None:
    query_a = query_a_path()
    con = duckdb.connect()
    read_csv = f"read_csv_auto('{query_a.as_posix()}', delim=';')"

    total_opcoes = con.execute(f"SELECT COUNT(*) FROM {read_csv}").fetchone()[0]

    by_year = con.execute(
        f"""
        SELECT ano,
               COUNT(*) AS opcoes,
               COUNT(DISTINCT aluno_anon) AS criancas_distintas,
               COUNT(DISTINCT unidade) AS unidades_distintas
        FROM {read_csv}
        GROUP BY ano
        ORDER BY ano
        """
    ).fetchdf()

    by_situacao = con.execute(
        f"""
        SELECT situacao, COUNT(*) AS opcoes
        FROM {read_csv}
        GROUP BY situacao
        ORDER BY opcoes DESC
        """
    ).fetchdf()

    summary = {
        "fonte": "dadoscreche/Bases IC_ ClassificadoseFila/01_QueryA_InscricoesPorAno.csv.gz",
        "grao": "uma opcao de creche escolhida dentro de uma inscricao",
        "total_opcoes": int(total_opcoes),
        "anos": [
            {
                "ano": int(row.ano),
                "opcoes": int(row.opcoes),
                "criancas_distintas": int(row.criancas_distintas),
                "unidades_distintas": int(row.unidades_distintas),
            }
            for row in by_year.itertuples()
        ],
        "situacao": [
            {"situacao": row.situacao, "opcoes": int(row.opcoes)}
            for row in by_situacao.itertuples()
        ],
    }

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / "summary.json"
    out_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path} ({total_opcoes} opcoes across {len(by_year)} anos)")


if __name__ == "__main__":
    main()
