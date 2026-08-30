import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function CpfIdentity() {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Identidade
        </p>
        <ProvenanceBadge kind="demonstracao" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs text-black/50 dark:text-white/50">Responsável</p>
          <p className="font-mono text-sm">CPF: ***.***.***-**</p>
        </div>
        <div>
          <p className="text-xs text-black/50 dark:text-white/50">Criança</p>
          <p className="font-mono text-sm">CPF: ***.***.***-**</p>
        </div>
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        Valores totalmente fictícios, sem nenhum dígito real -- não extraídos do dataset (que não
        possui CPF). Conforme decisão validada com representantes da Prefeitura durante o hackathon,
        o CPF da própria criança é o identificador individual do produto; o CPF do responsável
        autentica o acesso.
      </p>
    </div>
  );
}
