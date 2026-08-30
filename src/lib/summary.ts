import fs from "node:fs";
import path from "node:path";

export type DatasetSummary = {
  fonte: string;
  grao: string;
  total_opcoes: number;
  anos: { ano: number; opcoes: number; criancas_distintas: number; unidades_distintas: number }[];
  situacao: { situacao: string; opcoes: number }[];
};

export function readDatasetSummary(): DatasetSummary | null {
  const summaryPath = path.join(process.cwd(), "data", "processed", "summary.json");
  if (!fs.existsSync(summaryPath)) return null;
  return JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
}
