import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function PreferenceTransparency() {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="font-medium">Como minhas preferências são usadas?</h3>
        <ProvenanceBadge kind="proposta" />
      </div>
      <ul className="flex flex-col gap-2 text-sm text-black/70 dark:text-white/70">
        <li>Atualmente, esta demonstração usa a régua histórica 2025 como referência de pontuação.</li>
        <li>A ordem de preferência (1ª a 5ª opção) é uma informação já registrada na inscrição.</li>
        <li>
          Valorizar essa ordem de preferência na pontuação é uma <strong>proposta em estudo</strong>{" "}
          no Laboratório de Política Pública (Visão CRE) -- ainda não é aplicada aqui.
        </li>
        <li>Se uma regra assim fosse adotada, deveria ser transparente antes da inscrição.</li>
      </ul>
      <p className="text-xs text-black/50 dark:text-white/50">
        Esta seção não altera a pontuação atual mostrada acima.
      </p>
    </section>
  );
}
