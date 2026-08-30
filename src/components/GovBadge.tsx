const STYLES: Record<string, { bg: string; color: string; border: string }> = {
  espera: { bg: "var(--azul0)", color: "var(--azul9)", border: "var(--azul1)" },
  selecionado: { bg: "var(--lar1)", color: "var(--lar7)", border: "#f5d78e" },
  confirmado: { bg: "var(--verde1)", color: "var(--verde7)", border: "#bfe5bb" },
  cancelado: { bg: "var(--c1)", color: "var(--c7)", border: "var(--c3)" },
  proposta: { bg: "var(--roxo1)", color: "var(--roxo7)", border: "#d9c9f7" },
  erro: { bg: "var(--verm1)", color: "var(--verm7)", border: "#f3c2be" },
};

function kindFor(status: string): keyof typeof STYLES {
  if (status === "Confirmado") return "confirmado";
  if (status === "Selecionado" || status === "Selecionado da lista" || status === "Em análise" || status === "Documentação em análise")
    return "selecionado";
  if (status.startsWith("Cancelado")) return "cancelado";
  return "espera";
}

export function GovBadge({ status }: { status: string }) {
  const s = STYLES[kindFor(status)];
  return (
    <span
      className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-bold"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {status}
    </span>
  );
}
