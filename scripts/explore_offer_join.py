"""Exploratory, read-only analysis of candidate join keys between the
offer/supply files (OferecimentosEvagas) and the demand files (Query A / D).

This is investigation evidence, not the production pipeline -- it prints a
report to stdout and writes nothing. The numbers it prints are cited in
docs/opportunity-model.md and docs/data-understanding.md.

Key finding (see report): the reliable join key is the unit code cast to a
plain integer (no assumed zero-padding width) -- Query A's `unidade`,
Query D's `esc_codigo`, `Unidades_Unificadas_com_Localizacao`'s `DESIGNACAO`,
and the offer files' `CÓDIGO SGA` / `Designacao` columns all share the same
integer ID space. zfill-based padding schemes are WRONG because partner
units use short codes (e.g. 1004) and public units use longer codes (e.g.
101601) in the same field -- padding both to a fixed width corrupts the
shorter ones.

Run with:
    python scripts/explore_offer_join.py
"""

import duckdb
import pandas as pd

from _common import get_dataset_dir, query_a_path

pd.set_option("display.max_columns", None)
pd.set_option("display.width", 220)


def as_int_set(series: pd.Series) -> set:
    return set(pd.to_numeric(series, errors="coerce").dropna().astype("int64"))


def report_overlap(label: str, candidate_codes: set, reference_codes: set, reference_label: str = "unidade (Query A)") -> None:
    matched = candidate_codes & reference_codes
    total = len(candidate_codes)
    pct_of_candidate = 100 * len(matched) / total if total else 0.0
    pct_of_reference = 100 * len(matched) / len(reference_codes) if reference_codes else 0.0
    print(f"--- {label} ---")
    print(f"  candidatos (códigos distintos): {total}")
    print(f"  casados com {reference_label}: {len(matched)} "
          f"({pct_of_candidate:.1f}% do candidato, {pct_of_reference:.1f}% de {reference_label})")
    print(f"  {reference_label} sem candidato: {len(reference_codes - candidate_codes)}")
    print()


def main() -> None:
    dataset_dir = get_dataset_dir()
    offer_dir = dataset_dir / "OferecimentosEvagas"

    con = duckdb.connect()
    query_a = f"read_csv_auto('{query_a_path().as_posix()}', delim=';')"

    query_a_units_all = con.execute(f"SELECT DISTINCT unidade FROM {query_a}").fetchdf()
    qa_all = as_int_set(query_a_units_all["unidade"])
    query_a_units_2025 = con.execute(f"SELECT DISTINCT unidade FROM {query_a} WHERE ano = 2025").fetchdf()
    qa_2025 = as_int_set(query_a_units_2025["unidade"])
    print(f"Unidades distintas na Query A: {len(qa_all)} (5 anos), {len(qa_2025)} (só 2025)")
    print()

    # --- Query D (04_UnidadesEscolaresComEndereco) ---
    query_d_path = dataset_dir / "Bases IC_ ClassificadoseFila" / "04_UnidadesEscolaresComEndereco.csv"
    d = pd.read_csv(
        query_d_path, sep=";", header=None, encoding="utf-8-sig", na_values=["NULL"],
        names=["seq", "esc_codigo", "nome", "tipo", "logradouro", "numero", "complemento", "bairro", "cep"],
    )
    d_codes = as_int_set(d["esc_codigo"])
    dupe_rows = d.dropna(subset=["esc_codigo"])["esc_codigo"].astype("int64")
    print(f"Query D: {len(d)} linhas, {len(d_codes)} esc_codigo distintos, "
          f"{dupe_rows.duplicated().sum()} linhas com esc_codigo repetido (mesmo código em >1 linha)")
    report_overlap("Query D esc_codigo (int, sem padding)", d_codes, qa_all, "unidade (Query A, 5 anos)")

    # --- Unidades_Unificadas_com_Localizacao (territory master) ---
    uni_path = offer_dir / "Unidades_Unificadas_com_Localizacao.xlsx"
    u = pd.read_excel(uni_path, sheet_name="Unidades_Unificadas")
    print(f"Unidades_Unificadas: {len(u)} linhas, tipos: {dict(u['Tipo'].value_counts())}")
    print(f"  DESIGNACAO duplicada: {u['DESIGNACAO'].duplicated().sum()} "
          f"(chave: {'única' if u['DESIGNACAO'].is_unique else 'NÃO única'})")
    u_codes = as_int_set(u["DESIGNACAO"])
    report_overlap("Unidades_Unificadas DESIGNACAO (int)", u_codes, qa_all, "unidade (Query A, 5 anos)")
    has_latlong = (u["LATITUDE"].notna() & u["LONGITUDE"].notna()).sum()
    has_microarea = u["microárea"].notna().sum()
    print(f"  com lat/long: {has_latlong}/{len(u)}  com microárea preenchida: {has_microarea}/{len(u)}")
    print()

    # --- 2025 offer files (explicit, position-based parsing -- see build_opportunity.py) ---
    raw_p = pd.read_excel(offer_dir / "Parceiras2025.xlsx", sheet_name="MAIO -2025", header=None)
    p25_codes = as_int_set(raw_p.iloc[2:, 1])
    p25_dupes = pd.to_numeric(raw_p.iloc[2:, 1], errors="coerce").dropna().duplicated().sum()
    print(f"Parceiras2025 (CÓDIGO SGA): {len(p25_codes)} códigos distintos, {p25_dupes} duplicados")
    report_overlap("Parceiras2025 CÓDIGO SGA", p25_codes, qa_2025, "unidade (Query A, 2025)")

    raw_t = pd.read_excel(offer_dir / "totaalunoscreche2025.xlsx", sheet_name="Consolidado", header=None)
    t25_codes = as_int_set(raw_t.iloc[3:, 1])
    t25_dupes = pd.to_numeric(raw_t.iloc[3:, 1], errors="coerce").dropna().duplicated().sum()
    print(f"totalalunoscreche2025 (Designacao): {len(t25_codes)} códigos distintos, {t25_dupes} duplicados")
    report_overlap("totalalunoscreche2025 Designacao", t25_codes, qa_2025, "unidade (Query A, 2025)")

    union_2025 = p25_codes | t25_codes
    overlap_pp = p25_codes & t25_codes
    print(f"Códigos em AMBOS Parceiras2025 e totalalunoscreche2025 (colisão de namespace?): {len(overlap_pp)}")
    report_overlap("UNIÃO oferta 2025 (parceiras + públicas)", union_2025, qa_2025, "unidade (Query A, 2025)")

    missing = qa_2025 - union_2025
    print(f"Unidades da Query A 2025 SEM nenhum registro de oferta: {sorted(missing)}")
    missing_names = con.execute(
        f"SELECT DISTINCT unidade, nome_unidade FROM {query_a} WHERE ano = 2025 AND unidade IN "
        f"({','.join(str(m) for m in missing)})"
    ).fetchdf() if missing else pd.DataFrame()
    if not missing_names.empty:
        print(missing_names.to_string())


if __name__ == "__main__":
    main()
