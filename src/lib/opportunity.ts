import fs from "node:fs";
import path from "node:path";

export type OpportunitySummary = {
  ano: number;
  cobertura: {
    unidades_query_a_2025: number;
    unidades_com_registro_de_oferta: number;
    cobertura_oferta_pct: number;
    unidades_com_territorio: number;
    cobertura_territorio_pct: number;
  };
  registros: unknown[];
  top10_maior_pressao_com_capacidade_conhecida: unknown[];
};

export function readOpportunitySummary(): OpportunitySummary | null {
  const filePath = path.join(process.cwd(), "data", "processed", "opportunity-2025.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
