"""Builds the 2025 offer x demand opportunity model.

Produces data/processed/opportunity-2025.json: a small, auditable aggregate
joining demand (Query A opcoes), territory (Unidades_Unificadas_com_Localizacao)
and offer/capacity (Parceiras2025.xlsx + totaalunoscreche2025.xlsx).

Join key (validated in scripts/explore_offer_join.py): the unit code cast to
a plain integer, with NO assumed zero-padding width. Query A's `unidade`,
`Unidades_Unificadas...DESIGNACAO`, Parceiras' `CÓDIGO SGA` and
totalalunoscreche's `Designacao` all live in the same integer ID space.

IMPORTANT ASYMMETRY (see docs/opportunity-model.md for the full writeup):
- Partner units (Parceiras2025.xlsx) carry a `Meta` (contracted capacity)
  column, so a real vagas/deficit/surplus figure can be computed for them.
- Public units (totaalunoscreche2025.xlsx) carry only `Aluno` (enrolled) and
  `Turma` (class count) -- there is NO capacity/meta column in this
  extraction. We do NOT invent one. Their "vagas" fields are left null and
  flagged `capacidade_disponivel: false`.

Usage:
    python scripts/build_opportunity.py
"""

import json

import duckdb
import pandas as pd

from _common import PROCESSED_DIR, get_dataset_dir, query_a_path

PARCEIRAS_COLS = [
    "cre", "codigo_sga", "nome", "grupamentos_autorizados", "meta_total",
    "bi_aluno", "bi_incluido", "bi_meta", "bi_vagas",
    "bii_aluno", "bii_incluido", "bii_meta", "bii_vagas",
    "mi_aluno", "mi_incluido", "mi_meta", "mi_vagas",
    "mii_aluno", "mii_incluido", "mii_meta", "mii_vagas",
    "total_alunos", "total_incluidos", "abatimentos", "total_vagas",
]

PUBLICAS_COLS = [
    "cre", "designacao", "denominacao",
    "ber_integral_aluno", "ber_integral_turma", "ber_parcial_aluno", "ber_parcial_turma",
    "mi_integral_aluno", "mi_integral_turma", "mi_parcial_aluno", "mi_parcial_turma",
    "mii_integral_aluno", "mii_integral_turma", "mii_parcial_aluno", "mii_parcial_turma",
    "tot_integral_aluno", "tot_integral_turma", "tot_parcial_aluno", "tot_parcial_turma",
]

SITUACOES = [
    "Confirmado", "Lista de espera", "Cancelado na confirmacao",
    "Cancelado pelo sistema", "Cancelado", "Selecionado da lista",
    "Ativo", "Selecionado",
]


def load_demand(dataset_dir) -> dict:
    con = duckdb.connect()
    query_a = f"read_csv_auto('{query_a_path().as_posix()}', delim=';')"

    # trim(grupamento): Query A stores "Maternal II " with a trailing space
    # in at least one processo -- the offer files don't. Without trimming,
    # every Maternal II row silently fails the join. See docs/opportunity-model.md.
    first_pref = con.execute(
        f"""
        SELECT unidade, TRIM(grupamento) AS grupamento, horario, COUNT(*) AS demanda_1a_preferencia
        FROM {query_a}
        WHERE ano = 2025 AND opcao = 1
        GROUP BY 1, 2, 3
        """
    ).fetchdf()

    total_pref_by_unit = con.execute(
        f"""
        SELECT unidade, COUNT(DISTINCT prm_id || '-' || plm_id || '-' || ipl_id) AS demanda_total_preferencia
        FROM {query_a}
        WHERE ano = 2025
        GROUP BY 1
        """
    ).fetchdf()

    situacao_counts = con.execute(
        f"""
        SELECT unidade, TRIM(grupamento) AS grupamento, horario, situacao, COUNT(*) AS opcoes
        FROM {query_a}
        WHERE ano = 2025
        GROUP BY 1, 2, 3, 4
        """
    ).fetchdf()

    # sanity: opcao=1 must be at most one row per inscription (guards double counting in A)
    dup_check = con.execute(
        f"""
        SELECT COUNT(*) FROM (
            SELECT prm_id, plm_id, ipl_id, COUNT(*) AS n
            FROM {query_a}
            WHERE ano = 2025 AND opcao = 1
            GROUP BY 1, 2, 3
            HAVING COUNT(*) > 1
        )
        """
    ).fetchone()[0]
    assert dup_check == 0, "inscricao com mais de uma linha opcao=1 -- quebra a premissa de nao duplicar demanda"

    return {
        "first_pref": first_pref,
        "total_pref_by_unit": total_pref_by_unit,
        "situacao_counts": situacao_counts,
    }


def load_territory(offer_dir) -> pd.DataFrame:
    u = pd.read_excel(offer_dir / "Unidades_Unificadas_com_Localizacao.xlsx", sheet_name="Unidades_Unificadas")
    u = u.rename(columns={
        "DESIGNACAO": "unidade_int", "CRE": "cre", "microárea": "microarea",
        "DENOMINACAO": "denominacao_territorio", "BAIRRO": "bairro",
        "LATITUDE": "latitude", "LONGITUDE": "longitude", "Tipo": "tipo_territorio",
    })
    u["unidade_int"] = pd.to_numeric(u["unidade_int"], errors="coerce").astype("Int64")
    assert u["unidade_int"].is_unique, "DESIGNACAO deveria ser chave única em Unidades_Unificadas"
    return u[["unidade_int", "cre", "bairro", "microarea", "latitude", "longitude",
              "tipo_territorio", "denominacao_territorio"]]


def load_offer_partners(offer_dir) -> pd.DataFrame:
    raw = pd.read_excel(offer_dir / "Parceiras2025.xlsx", sheet_name="MAIO -2025", header=None)
    df = raw.iloc[2:, : len(PARCEIRAS_COLS)].copy()
    df.columns = PARCEIRAS_COLS
    df["codigo_sga"] = pd.to_numeric(df["codigo_sga"], errors="coerce")
    df = df.dropna(subset=["codigo_sga"]).copy()
    df["codigo_sga"] = df["codigo_sga"].astype("int64")
    assert not df["codigo_sga"].duplicated().any(), "CÓDIGO SGA duplicado em Parceiras2025"

    numeric_cols = [c for c in PARCEIRAS_COLS if c not in ("cre", "codigo_sga", "nome", "grupamentos_autorizados")]
    for c in numeric_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    # Query A 2025 grupamento has a single "Berçário" bucket; the partner
    # file splits BI/BII -- sum them to make the join grain match.
    rows = []
    for _, r in df.iterrows():
        rows.append({
            "codigo_sga": r["codigo_sga"], "nome": r["nome"], "grupamento": "Berçário",
            "meta": r["bi_meta"] + r["bii_meta"], "aluno": r["bi_aluno"] + r["bii_aluno"],
            "vagas": r["bi_vagas"] + r["bii_vagas"],
        })
        rows.append({
            "codigo_sga": r["codigo_sga"], "nome": r["nome"], "grupamento": "Maternal I",
            "meta": r["mi_meta"], "aluno": r["mi_aluno"], "vagas": r["mi_vagas"],
        })
        rows.append({
            "codigo_sga": r["codigo_sga"], "nome": r["nome"], "grupamento": "Maternal II",
            "meta": r["mii_meta"], "aluno": r["mii_aluno"], "vagas": r["mii_vagas"],
        })
    return pd.DataFrame(rows)


def load_offer_publicas(offer_dir) -> pd.DataFrame:
    raw = pd.read_excel(offer_dir / "totaalunoscreche2025.xlsx", sheet_name="Consolidado", header=None)
    df = raw.iloc[3:, : len(PUBLICAS_COLS)].copy()
    df.columns = PUBLICAS_COLS
    df["designacao"] = pd.to_numeric(df["designacao"], errors="coerce")
    df = df.dropna(subset=["designacao"]).copy()
    df["designacao"] = df["designacao"].astype("int64")
    assert not df["designacao"].duplicated().any(), "Designacao duplicada em totalalunoscreche2025"

    numeric_cols = [c for c in PUBLICAS_COLS if c not in ("cre", "designacao", "denominacao")]
    for c in numeric_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    rows = []
    grupamentos = [
        ("Berçário", "ber_integral_aluno", "ber_integral_turma", "ber_parcial_aluno", "ber_parcial_turma"),
        ("Maternal I", "mi_integral_aluno", "mi_integral_turma", "mi_parcial_aluno", "mi_parcial_turma"),
        ("Maternal II", "mii_integral_aluno", "mii_integral_turma", "mii_parcial_aluno", "mii_parcial_turma"),
    ]
    for _, r in df.iterrows():
        for grup, int_aluno, int_turma, par_aluno, par_turma in grupamentos:
            rows.append({
                "designacao": r["designacao"], "denominacao": r["denominacao"], "grupamento": grup,
                "horario": "Integral", "aluno": r[int_aluno], "turmas": r[int_turma],
            })
            rows.append({
                "designacao": r["designacao"], "denominacao": r["denominacao"], "grupamento": grup,
                "horario": "Parcial", "aluno": r[par_aluno], "turmas": r[par_turma],
            })
    return pd.DataFrame(rows)


def main() -> None:
    dataset_dir = get_dataset_dir()
    offer_dir = dataset_dir / "OferecimentosEvagas"

    demand = load_demand(dataset_dir)
    territory = load_territory(offer_dir)
    partners = load_offer_partners(offer_dir)
    publicas = load_offer_publicas(offer_dir)

    first_pref = demand["first_pref"].copy()
    first_pref["unidade"] = first_pref["unidade"].astype("int64")
    total_pref = demand["total_pref_by_unit"].set_index(
        demand["total_pref_by_unit"]["unidade"].astype("int64")
    )["demanda_total_preferencia"].to_dict()

    situacao = demand["situacao_counts"].copy()
    situacao["unidade"] = situacao["unidade"].astype("int64")
    situacao_pivot = situacao.pivot_table(
        index=["unidade", "grupamento", "horario"], columns="situacao", values="opcoes",
        aggfunc="sum", fill_value=0,
    )
    for s in SITUACOES:
        if s not in situacao_pivot.columns:
            situacao_pivot[s] = 0

    partners_idx = partners.set_index(["codigo_sga", "grupamento"])
    publicas_idx = publicas.set_index(["designacao", "grupamento", "horario"])
    partner_units = set(partners["codigo_sga"])
    public_units = set(publicas["designacao"])
    territory_idx = territory.set_index("unidade_int")

    records = []
    for _, row in first_pref.iterrows():
        unidade = int(row["unidade"])
        grupamento = row["grupamento"]
        horario = row["horario"]
        demanda_1a = int(row["demanda_1a_preferencia"])

        key = (unidade, grupamento, horario)
        sit = situacao_pivot.loc[key] if key in situacao_pivot.index else None
        fila_por_situacao = {s: int(sit[s]) if sit is not None else 0 for s in SITUACOES}

        terr = territory_idx.loc[unidade] if unidade in territory_idx.index else None

        is_partner = unidade in partner_units
        is_public = unidade in public_units

        nome_unidade = (
            str(terr["denominacao_territorio"])
            if terr is not None and not pd.isna(terr["denominacao_territorio"])
            else None
        )

        record = {
            "unidade": unidade,
            "nome_unidade": nome_unidade,
            "grupamento": grupamento,
            "horario": horario,
            "cre": (None if terr is None or pd.isna(terr["cre"]) else int(terr["cre"])),
            "bairro": (None if terr is None or pd.isna(terr["bairro"]) else str(terr["bairro"])),
            "microarea": (None if terr is None or pd.isna(terr["microarea"]) else str(terr["microarea"])),
            "latitude": (None if terr is None or pd.isna(terr["latitude"]) else float(terr["latitude"])),
            "longitude": (None if terr is None or pd.isna(terr["longitude"]) else float(terr["longitude"])),
            "tipo_unidade": (None if terr is None else str(terr["tipo_territorio"])),
            "demanda_1a_preferencia": demanda_1a,
            "demanda_total_preferencia_unidade": int(total_pref.get(unidade, 0)),
            "fila_por_situacao": fila_por_situacao,
            "tipo_oferta": None,
            "capacidade_disponivel": False,
            "meta_capacidade": None,
            "matriculas": None,
            "turmas": None,
            "vagas_ofertadas": None,
            "relacao_demanda_1a_por_capacidade": None,
            "saldo_potencial": None,
        }

        if is_partner:
            pkey = (unidade, grupamento)
            if pkey in partners_idx.index:
                p = partners_idx.loc[pkey]
                meta = float(p["meta"])
                if record["nome_unidade"] is None:
                    record["nome_unidade"] = str(p["nome"])
                record.update({
                    "tipo_oferta": "parceira",
                    "capacidade_disponivel": True,
                    "meta_capacidade": meta,
                    "matriculas": float(p["aluno"]),
                    "vagas_ofertadas": float(p["vagas"]),
                    "relacao_demanda_1a_por_capacidade": (round(demanda_1a / meta, 3) if meta > 0 else None),
                    "saldo_potencial": float(p["vagas"]) - fila_por_situacao["Lista de espera"],
                })
        elif is_public:
            pukey = (unidade, grupamento, horario)
            if pukey in publicas_idx.index:
                pu = publicas_idx.loc[pukey]
                if record["nome_unidade"] is None:
                    record["nome_unidade"] = str(pu["denominacao"])
                record.update({
                    "tipo_oferta": "publica",
                    "capacidade_disponivel": False,
                    "matriculas": float(pu["aluno"]),
                    "turmas": float(pu["turmas"]),
                })

        records.append(record)

    assert len(records) > 0, "opportunity model gerou zero registros"
    key_tuples = [(r["unidade"], r["grupamento"], r["horario"]) for r in records]
    assert len(key_tuples) == len(set(key_tuples)), "chave (unidade, grupamento, horario) duplicada no agregado"
    for r in records:
        assert r["demanda_1a_preferencia"] >= 0
        assert all(v >= 0 for v in r["fila_por_situacao"].values())

    # coverage checks (Part 2 findings) -- guard against silent regressions
    units_2025 = {r["unidade"] for r in records}
    units_with_offer = {r["unidade"] for r in records if r["tipo_oferta"] is not None}
    coverage_pct = 100 * len(units_with_offer) / len(units_2025)
    assert coverage_pct >= 95.0, (
        f"cobertura da junção oferta caiu para {coverage_pct:.1f}% (esperado >= 95%, "
        "ver scripts/explore_offer_join.py) -- investigar antes de publicar o agregado"
    )

    units_with_territory = {r["unidade"] for r in records if r["cre"] is not None}
    territory_coverage_pct = 100 * len(units_with_territory) / len(units_2025)

    RANKING_SIZE = 30
    partner_rows = [r for r in records if r["capacidade_disponivel"]]
    top_pressao = sorted(
        [r for r in partner_rows if r["saldo_potencial"] is not None and r["saldo_potencial"] < 0],
        key=lambda r: r["saldo_potencial"],
    )[:RANKING_SIZE]
    top_superavit = sorted(
        [r for r in partner_rows if r["saldo_potencial"] is not None and r["saldo_potencial"] > 0],
        key=lambda r: -r["saldo_potencial"],
    )[:RANKING_SIZE]
    top_demanda = sorted(records, key=lambda r: -r["demanda_1a_preferencia"])[:RANKING_SIZE]

    output = {
        "ano": 2025,
        "grao": "unidade x grupamento x horario (parceiras: unidade x grupamento, sem quebra por horario)",
        "join_key": "int(unidade) == int(esc_codigo) == int(DESIGNACAO) == int(codigo_sga/designacao); ver scripts/explore_offer_join.py",
        "definicoes": {
            "nome_unidade": "nome de Unidades_Unificadas_com_Localizacao (preferido) ou do proprio arquivo de oferta; ausente em 15/2173 registros (unidades sem correspondencia em nenhuma das duas fontes)",
            "demanda_1a_preferencia": "inscricoes distintas com opcao=1 nessa unidade/grupamento/horario (uma por inscricao, sem duplicidade)",
            "demanda_total_preferencia_unidade": "inscricoes distintas que citaram a unidade em qualquer opcao (1-6), agregado por unidade",
            "fila_por_situacao": "contagem de opcoes por situacao da inscricao (ver dadoscreche README para o enum completo); NAO escolhemos uma definicao unica de 'fila ativa'",
            "meta_capacidade": "so disponivel para unidades parceiras (coluna Meta do Parceiras2025.xlsx); unidades publicas nao tem essa coluna nesta extracao",
            "vagas_ofertadas": "coluna Vagas do Parceiras2025.xlsx = Meta - Aluno (matricula), calculada pela propria SME, nao por nos",
            "saldo_potencial": "vagas_ofertadas - fila_por_situacao['Lista de espera']; positivo sugere vaga potencialmente aproveitavel, negativo sugere pressao; SO calculado quando capacidade_disponivel=true",
            "matriculas_turmas_publicas": "para unidades publicas so temos aluno matriculado e numero de turmas, sem capacidade/meta -- NAO derivamos vagas para elas",
        },
        "cobertura": {
            "unidades_query_a_2025": len(units_2025),
            "unidades_com_registro_de_oferta": len(units_with_offer),
            "cobertura_oferta_pct": round(coverage_pct, 1),
            "unidades_com_territorio": len(units_with_territory),
            "cobertura_territorio_pct": round(territory_coverage_pct, 1),
        },
        "registros": records,
        "ranking_maior_pressao_com_capacidade_conhecida": top_pressao,
        "ranking_possivel_superavit_com_capacidade_conhecida": top_superavit,
        "ranking_maior_demanda_1a_preferencia_geral": top_demanda,
    }

    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PROCESSED_DIR / "opportunity-2025.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path}: {len(records)} registros, cobertura oferta {coverage_pct:.1f}%, "
          f"cobertura território {territory_coverage_pct:.1f}%")


if __name__ == "__main__":
    main()
