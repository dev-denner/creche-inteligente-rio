import { findOpportunityRecord } from "@/lib/opportunity";
import { readOpportunityData } from "@/lib/opportunity-data";
import { readPolicyLabData } from "@/lib/policy-lab-data";
import { CREView } from "@/components/cre/CREView";

export default function CREPage() {
  const opportunity = readOpportunityData();
  const policyLab = readPolicyLabData();

  if (!opportunity) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-14">
        <h1 className="text-2xl font-semibold">Visão CRE</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Agregado não encontrado. Rode{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
            python scripts/build_opportunity.py
          </code>{" "}
          para gerar <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">data/processed/opportunity-2025.json</code>.
        </p>
      </div>
    );
  }

  const highlight = findOpportunityRecord(opportunity.registros, 7013, "Berçário", "Integral");

  return <CREView opportunity={opportunity} highlight={highlight} policyLab={policyLab} />;
}
