import fs from "node:fs";
import path from "node:path";

export type ReguaPergunta = {
  perg_id: number;
  pergunta_texto: string;
  pontuacao: number;
  criterio_desempate: boolean;
  ordem: number;
};

export type ReguaData = {
  ano: number;
  fonte: string;
  rotulo: string;
  aviso: string;
  perguntas: ReguaPergunta[];
  pontuacao_maxima_teorica: number;
};

export function readRegua(): ReguaData | null {
  const filePath = path.join(process.cwd(), "data", "processed", "regua-2025.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
