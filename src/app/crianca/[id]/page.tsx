import { findOpportunityRecord } from "@/lib/opportunity";
import { readOpportunityData } from "@/lib/opportunity-data";
import { readRegua } from "@/lib/regua";
import {
  DEMO_OPTIONS,
  DEMO_PRAZO_MS,
  DEMO_RESPOSTAS,
  DEMO_SUGGESTION,
} from "@/lib/demo-scenario";
import { FamilyPortal } from "@/components/family/FamilyPortal";
import { GenericChildJourney } from "@/components/family/GenericChildJourney";

export default async function ChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id !== "maria") {
    return <GenericChildJourney id={id} />;
  }

  const opportunity = readOpportunityData();
  const regua = readRegua();
  const records = opportunity?.registros ?? [];

  const options = DEMO_OPTIONS.map((opt) => ({
    ordem: opt.ordem,
    statusReal: opt.statusReal,
    record: findOpportunityRecord(records, opt.unidade, opt.grupamento, opt.horario),
  }));

  const suggestion = findOpportunityRecord(
    records,
    DEMO_SUGGESTION.unidade,
    DEMO_SUGGESTION.grupamento,
    DEMO_SUGGESTION.horario,
  );

  return (
    <FamilyPortal
      options={options}
      suggestion={suggestion}
      regua={regua}
      demoRespostas={DEMO_RESPOSTAS}
      prazoMs={DEMO_PRAZO_MS}
    />
  );
}
