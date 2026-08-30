import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function TerritorialPanel({ coberturaTerritorioPct }: { coberturaTerritorioPct: number }) {
  return (
    <section className="grid gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="font-medium">Dados disponíveis hoje</p>
          <ProvenanceBadge kind="historico-2025" />
        </div>
        <ul className="flex flex-col gap-1 text-sm text-black/70 dark:text-white/70">
          <li>Demanda manifesta (opções registradas)</li>
          <li>1ª preferência por unidade/grupamento/turno</li>
          <li>Fila observada por situação</li>
          <li>Capacidade, quando conhecida (unidades parceiras)</li>
          <li>Território: CRE, bairro, microárea, lat/long ({coberturaTerritorioPct}% de cobertura)</li>
        </ul>
      </div>
      <div className="flex flex-col gap-2 border-t border-black/10 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-4 dark:border-white/10">
        <div className="flex items-center gap-2">
          <p className="font-medium">Sinais possíveis com o novo portal</p>
          <ProvenanceBadge kind="proposta" />
        </div>
        <ul className="flex flex-col gap-1 text-sm text-black/70 dark:text-white/70">
          <li>Buscas por CEP na hora da inscrição</li>
          <li>Unidades visualizadas antes de escolher</li>
          <li>Unidades favoritadas</li>
          <li>Abandono de cadastro (onde a família para de preencher)</li>
        </ul>
        <p className="text-xs text-black/50 dark:text-white/50">
          Estes sinais não existem no dataset do desafio -- são propostas de instrumentação futura,
          nunca dados históricos.
        </p>
      </div>
    </section>
  );
}
