import { assessPressure } from "@/lib/opportunity";
import { readOpportunityData } from "@/lib/opportunity-data";
import { Wizard } from "@/components/family/Wizard";

export default function InscricaoPage() {
  const opportunity = readOpportunityData();
  const catalog = (opportunity?.registros ?? [])
    .filter((r) => r.nome_unidade)
    .map((r) => ({
      unidade: r.unidade,
      nome_unidade: r.nome_unidade as string,
      bairro: r.bairro,
      grupamento: r.grupamento,
      horario: r.horario,
      comp: assessPressure(r).nivel,
    }));

  return <Wizard catalog={catalog} />;
}
