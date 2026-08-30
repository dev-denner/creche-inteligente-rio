import { ProvenanceBadge } from "@/components/ProvenanceBadge";

const FONTES = [
  { nome: "Cadastro da inscrição", disponivel: true },
  { nome: "CadÚnico", disponivel: false },
  { nome: "Bolsa Família", disponivel: false },
];

export function ValidationSources() {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="font-medium">Fontes de validação</h3>
      <ul className="flex flex-col gap-2">
        {FONTES.map((f) => (
          <li key={f.nome} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <span className={f.disponivel ? "text-emerald-600 dark:text-emerald-400" : "text-black/40 dark:text-white/40"}>
                {f.disponivel ? "✓" : "○"}
              </span>
              {f.nome}
            </span>
            {f.disponivel ? (
              <span className="text-xs text-black/50 dark:text-white/50">Disponível</span>
            ) : (
              <span className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                Integração institucional necessária <ProvenanceBadge kind="pendente-sme" />
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-black/50 dark:text-white/50">
        Nenhuma consulta a CadÚnico ou Bolsa Família foi realizada nesta demonstração.
      </p>
    </section>
  );
}
