/**
 * Plain-language gloss for each raw `situacao` value observed in the
 * dataset (see docs/data-understanding.md). The raw value is always shown
 * -- this only adds a friendlier explanation, it does not claim any
 * normative equivalence between statuses.
 */
export type StatusTone = "positivo" | "neutro" | "atencao";

export type StatusMeta = {
  gloss: string;
  tone: StatusTone;
};

export const STATUS_META: Record<string, StatusMeta> = {
  "Selecionado": {
    gloss: "Selecionada para uma vaga -- aguardando confirmação da família",
    tone: "positivo",
  },
  "Selecionado da lista": {
    gloss: "Chamada a partir da lista de espera",
    tone: "positivo",
  },
  "Confirmado": {
    gloss: "Vaga confirmada pela família",
    tone: "positivo",
  },
  "Ativo": {
    gloss: "Inscrição ativa, sem desfecho ainda",
    tone: "neutro",
  },
  "Lista de espera": {
    gloss: "Aguardando na lista de espera desta opção",
    tone: "neutro",
  },
  "Cancelado": {
    gloss: "Cancelada",
    tone: "atencao",
  },
  "Cancelado na confirmacao": {
    gloss: "Cancelada no momento da confirmação",
    tone: "atencao",
  },
  "Cancelado pelo sistema": {
    gloss: "Cancelada automaticamente pelo sistema",
    tone: "atencao",
  },
};

export function statusMeta(situacao: string): StatusMeta {
  return STATUS_META[situacao] ?? { gloss: situacao, tone: "neutro" };
}

export const TONE_CLASSNAMES: Record<StatusTone, string> = {
  positivo: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  neutro: "bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
  atencao: "bg-stone-100 text-stone-700 ring-stone-300 dark:bg-stone-800/60 dark:text-stone-300 dark:ring-stone-700",
};
