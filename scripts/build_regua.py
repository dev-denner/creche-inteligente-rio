"""Builds a small artifact with the 2025 scoring rubric (Query C), used by
the "Entenda sua classificacao" section of the Family Portal.

This is the REAL rubric used by SME in the 2025 selection process -- point
values and criteria are historical fact from the dataset, not invented.
What IS demonstrative is any example answer applied to it in the UI (a
fictional scenario), never a reconstructed real child.

Usage:
    python scripts/build_regua.py
"""

import json

import pandas as pd

from _common import PROCESSED_DIR, query_c_path


def main() -> None:
    c = pd.read_csv(query_c_path(), sep=";", encoding="utf-8-sig")
    c_2025 = c[c["ano"] == 2025].sort_values("perg_ordemVisualizacao")

    perguntas = [
        {
            "perg_id": int(row.perg_id),
            "pergunta_texto": row.pergunta_texto,
            "pontuacao": int(row.perg_pontuacao),
            "criterio_desempate": row.perg_criterio == "Sim",
            "ordem": int(row.perg_ordemVisualizacao),
        }
        for row in c_2025.itertuples()
    ]

    assert len(perguntas) > 0, "regua 2025 vazia -- Query C nao tem linhas para ano=2025"

    output = {
        "ano": 2025,
        "fonte": "dadoscreche/Bases IC_ ClassificadoseFila/03_QueryC_PerguntasComDescricao.csv",
        "rotulo": "Régua histórica 2025 — dataset do desafio",
        "aviso": (
            "Esta é a régua de pontuação usada pela SME no processo seletivo de 2025, "
            "conforme o dataset do desafio. Não é necessariamente a régua vigente do "
            "processo atual -- a régua muda de ano para ano (ver docs/data-understanding.md)."
        ),
        "perguntas": perguntas,
        "pontuacao_maxima_teorica": sum(p["pontuacao"] for p in perguntas),
    }

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / "regua-2025.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}: {len(perguntas)} perguntas, {output['pontuacao_maxima_teorica']} pontos no total teórico")


if __name__ == "__main__":
    main()
