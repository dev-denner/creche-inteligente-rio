export type ProvenanceKind = "dado-desafio" | "historico-2025" | "demonstracao" | "proposta" | "pendente-sme";

const PROVENANCE: Record<ProvenanceKind, { label: string; className: string }> = {
  "dado-desafio": {
    label: "Dado do desafio",
    className:
      "bg-slate-100 text-slate-700 ring-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
  },
  "historico-2025": {
    label: "Histórico 2025",
    className:
      "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900",
  },
  "demonstracao": {
    label: "Demonstração",
    className:
      "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  },
  "proposta": {
    label: "Proposta",
    className:
      "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900",
  },
  "pendente-sme": {
    label: "Pendente SME",
    className:
      "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900",
  },
};

export function ProvenanceBadge({ kind, className = "" }: { kind: ProvenanceKind; className?: string }) {
  const meta = PROVENANCE[kind];
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.className} ${className}`}
    >
      {meta.label}
    </span>
  );
}
