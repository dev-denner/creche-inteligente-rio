"""Builds a REAL sample for the Policy Lab (preference-weight simulator).

For a curated sample of real, high-demand 2025 queues (unidade x
grupamento x horario), reconstructs each queue's real candidate list:
their real `opcao` (preference order used for that specific application)
and their real total score, computed from the actual 2025 rubric
(Query C) applied to their actual questionnaire answers (Query B) --
not invented, not estimated.

What this does NOT do: it does not replicate SME's official tie-break
rules (perg_criterio questions), does not filter by `situacao` (a
candidate's queue position here is score-based only), and does not know
whether SME's real classification used `resposta` or `confirmado`. See
docs/policy-lab.md for the exact caveats.

Privacy: candidates are labelled with a sequential candidato_id assigned
here (stable across base/simulated ranking), NOT the dataset's own
`aluno_anon` pseudonym -- so this sample cannot be correlated back to a
child's appearance elsewhere in the dataset. No per-question answer
breakdown is exposed, only the aggregate total score.

Usage:
    python scripts/build_policy_lab.py
"""

import json

import duckdb
import pandas as pd

from _common import PROCESSED_DIR, get_dataset_dir, query_a_path
from build_opportunity import load_territory

N_QUEUES = 15
PESO_PADRAO = {"1": 20, "2": 15, "3": 10, "4": 5, "5": 0, "6": 0}


def main() -> None:
    dataset_dir = get_dataset_dir()
    offer_dir = dataset_dir / "OferecimentosEvagas"
    query_b = dataset_dir / "Bases IC_ ClassificadoseFila" / "02_QueryB_RespostasSocioEconomicas.csv.gz"
    query_c = dataset_dir / "Bases IC_ ClassificadoseFila" / "03_QueryC_PerguntasComDescricao.csv"

    con = duckdb.connect()
    qa = f"read_csv_auto('{query_a_path().as_posix()}', delim=';')"
    qb = f"read_csv_auto('{query_b.as_posix()}', delim=';')"
    qc = f"read_csv_auto('{query_c.as_posix()}', delim=';')"

    top_queues = con.execute(
        f"""
        SELECT unidade, TRIM(grupamento) AS grupamento, horario, COUNT(*) AS n
        FROM {qa}
        WHERE ano = 2025 AND opcao = 1
        GROUP BY 1, 2, 3
        ORDER BY n DESC
        LIMIT {N_QUEUES}
        """
    ).fetchdf()

    candidatos = con.execute(
        f"""
        WITH pontos AS (
            SELECT b.prm_id, b.plm_id, b.ipl_id,
                   SUM(CASE WHEN b.resposta = 'Sim' THEN c.perg_pontuacao ELSE 0 END) AS pontuacao
            FROM {qb} b
            JOIN {qc} c ON b.ano = c.ano AND b.ich_perg_id = c.ich_perg_id
            WHERE b.ano = 2025
            GROUP BY 1, 2, 3
        )
        SELECT a.unidade, TRIM(a.grupamento) AS grupamento, a.horario, a.opcao, a.situacao,
               COALESCE(p.pontuacao, 0) AS pontuacao
        FROM {qa} a
        LEFT JOIN pontos p ON a.prm_id = p.prm_id AND a.plm_id = p.plm_id AND a.ipl_id = p.ipl_id
        WHERE a.ano = 2025
        """
    ).fetchdf()

    territory = load_territory(offer_dir).set_index("unidade_int")

    filas = []
    for _, q in top_queues.iterrows():
        unidade_int = int(q["unidade"])
        mask = (
            (candidatos["unidade"] == q["unidade"])
            & (candidatos["grupamento"] == q["grupamento"])
            & (candidatos["horario"] == q["horario"])
        )
        rows = candidatos[mask].reset_index(drop=True)
        assert len(rows) > 0, f"fila vazia para unidade {q['unidade']}"

        terr = territory.loc[unidade_int] if unidade_int in territory.index else None
        nome_unidade = None if terr is None or pd.isna(terr["denominacao_territorio"]) else str(terr["denominacao_territorio"])
        cre = None if terr is None or pd.isna(terr["cre"]) else int(terr["cre"])
        bairro = None if terr is None or pd.isna(terr["bairro"]) else str(terr["bairro"])

        candidatos_list = [
            {
                "candidato_id": i + 1,
                "opcao": int(rows.loc[i, "opcao"]),
                "pontuacao": int(rows.loc[i, "pontuacao"]),
                "situacao": rows.loc[i, "situacao"],
            }
            for i in range(len(rows))
        ]

        ids = [c["candidato_id"] for c in candidatos_list]
        assert len(ids) == len(set(ids)), "candidato_id duplicado dentro da fila"

        filas.append({
            "unidade": unidade_int,
            "nome_unidade": nome_unidade,
            "grupamento": q["grupamento"],
            "horario": q["horario"],
            "cre": cre,
            "bairro": bairro,
            "candidatos": candidatos_list,
        })

    total_candidatos = sum(len(f["candidatos"]) for f in filas)
    assert len(filas) == N_QUEUES
    assert total_candidatos > 0

    output = {
        "ano": 2025,
        "rotulo": "Amostra real de filas 2025 para o Laboratório de Política Pública",
        "fonte": (
            "Query A (opcao/situacao) + Query B (respostas) + Query C (regua 2025), "
            "join documentado em scripts/build_policy_lab.py"
        ),
        "aviso": (
            "Pontuação total reconstruída a partir da régua oficial de 2025 aplicada às respostas "
            "reais da inscrição (resposta='Sim'). Não representa o desempate oficial completo da SME "
            "(critérios perg_criterio não são aplicados aqui) nem confirma se a classificação oficial "
            "usa 'resposta' ou 'confirmado'. Não revela quais critérios específicos cada candidato "
            "atendeu -- apenas o total agregado. candidato_id é um rótulo sequencial atribuído aqui, "
            "não o aluno_anon do dataset."
        ),
        "peso_padrao": PESO_PADRAO,
        "amostra": f"{N_QUEUES} filas (unidade x grupamento x horario) de maior demanda de 1ª preferência em 2025",
        "filas": filas,
        "total_candidatos": total_candidatos,
    }

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / "policy-lab-2025.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}: {len(filas)} filas, {total_candidatos} candidatos")


if __name__ == "__main__":
    main()
