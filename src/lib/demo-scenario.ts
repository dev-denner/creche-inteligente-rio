/**
 * Fixed demo scenario for the Family Portal.
 *
 * The unit codes below (unidade/grupamento/horario) are REAL and looked up
 * live against data/processed/opportunity-2025.json -- names, demand,
 * queue counts and capacity shown for them are real 2025 aggregates.
 *
 * What is FICTIONAL: that any specific anonymous family applied to exactly
 * these 5 units, the status assigned to each option below, and the
 * timeline/dates. This does not reconstruct any real child or family from
 * the dataset. Never treat this file as a source of real per-child data.
 */

export type DemoOption = {
  ordem: number;
  unidade: number;
  grupamento: string;
  horario: string;
  statusReal: string;
};

export const DEMO_OPTIONS: DemoOption[] = [
  { ordem: 1, unidade: 7013, grupamento: "Berçário", horario: "Integral", statusReal: "Selecionado" },
  { ordem: 2, unidade: 7040, grupamento: "Berçário", horario: "Integral", statusReal: "Lista de espera" },
  { ordem: 3, unidade: 716609, grupamento: "Berçário", horario: "Integral", statusReal: "Lista de espera" },
  { ordem: 4, unidade: 7044, grupamento: "Berçário", horario: "Integral", statusReal: "Lista de espera" },
  { ordem: 5, unidade: 7042, grupamento: "Berçário", horario: "Integral", statusReal: "Cancelado pelo sistema" },
];

export const DEMO_SUGGESTION = { unidade: 7027, grupamento: "Berçário", horario: "Integral" };

export type DemoTimelineEvent = {
  data: string;
  hora: string;
  evento: string;
  detalhe: string;
};

const BASE_TIMELINE: DemoTimelineEvent[] = [
  { data: "12/xx", hora: "09:41", evento: "Inscrição registrada", detalhe: "Cadastro da inscrição recebido no sistema" },
  { data: "15/xx", hora: "14:20", evento: "Classificação processada", detalhe: "Pontuação aplicada conforme a régua do processo" },
  { data: "16/xx", hora: "08:00", evento: "Entrada na lista", detalhe: "Inscrição posicionada na lista de espera da opção" },
];

/** Builds a per-option demo timeline whose last step matches that option's demo status -- never a fixed script. */
export function buildDemoTimeline(statusReal: string): DemoTimelineEvent[] {
  const timeline = [...BASE_TIMELINE];
  if (statusReal === "Selecionado" || statusReal === "Selecionado da lista") {
    timeline.push({
      data: "18/xx",
      hora: "11:32",
      evento: "Convocação",
      detalhe: "Família selecionada para confirmar a vaga",
    });
  } else if (statusReal.startsWith("Cancelado")) {
    timeline.push({
      data: "18/xx",
      hora: "07:15",
      evento: "Encerramento da opção",
      detalhe: `Status registrado: ${statusReal}`,
    });
  }
  return timeline;
}

export const DEMO_PRAZO_LABEL = "01d 14h 32m";
export const DEMO_PRAZO_MS = ((1 * 24 + 14) * 60 + 32) * 60 * 1000;

/** Fictional example answers to the real 2025 rubric, keyed by perg_id. Never a real child. */
export const DEMO_RESPOSTAS: Record<number, boolean> = {
  28: true, // CadÚnico
  31: false,
  6: false,
  17: false,
  20: true, // família monoparental
  25: false,
  18: false,
  16: false,
  12: false,
  23: false,
  27: true, // aguardou fila ano anterior
  29: false,
  30: false,
};
