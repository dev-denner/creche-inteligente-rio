"use client";

import { useState } from "react";

import type { OpportunityData, OpportunityRecord } from "@/lib/opportunity";
import { assessPressure, recordKey } from "@/lib/opportunity";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { UnitDrawer } from "@/components/cre/UnitDrawer";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[.02] px-4 py-3 dark:border-white/10 dark:bg-white/[.03]">
      <p className="text-xs text-black/60 dark:text-white/60">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function PressureDot({ record }: { record: OpportunityRecord }) {
  const { nivel } = assessPressure(record);
  const color =
    nivel === "ALTA" ? "bg-rose-500" : nivel === "MÉDIA" ? "bg-amber-500" : "bg-emerald-500";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} aria-hidden="true" />
      <span className="text-xs">{nivel}</span>
    </span>
  );
}

export function CREView({
  opportunity,
  highlight,
}: {
  opportunity: OpportunityData;
  highlight: OpportunityRecord | null;
}) {
  const [selected, setSelected] = useState<OpportunityRecord | null>(null);
  const distinctUnidades = new Set(opportunity.registros.map((r) => r.unidade)).size;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10 sm:py-14">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Visão CRE</h1>
        <p className="text-black/60 dark:text-white/60">
          Onde a operação de oferta e demanda de creche merece atenção -- ano 2025.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Unidades analisadas" value={distinctUnidades.toLocaleString("pt-BR")} />
        <StatTile label="Cobertura oferta" value={`${opportunity.cobertura.cobertura_oferta_pct}%`} />
        <StatTile label="Cobertura territorial" value={`${opportunity.cobertura.cobertura_territorio_pct}%`} />
        <StatTile
          label="Registros unidade×grupamento×turno"
          value={opportunity.registros.length.toLocaleString("pt-BR")}
        />
      </section>

      {highlight && (
        <section className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-6 dark:border-rose-900 dark:bg-rose-950/20">
          <div className="flex items-center gap-2">
            <ProvenanceBadge kind="historico-2025" />
            <span className="text-xs text-black/50 dark:text-white/50">Destaque real do dataset</span>
          </div>
          <h2 className="text-lg font-semibold">{highlight.nome_unidade}</h2>
          <p className="text-sm text-black/70 dark:text-white/70">
            CRE {highlight.cre} · {highlight.bairro} · {highlight.grupamento} · {highlight.horario} ·
            unidade parceira
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <StatTile label="Capacidade" value={String(highlight.meta_capacidade)} />
            <StatTile label="Matriculados" value={String(highlight.matriculas)} />
            <StatTile label="1ª preferência" value={String(highlight.demanda_1a_preferencia)} />
            <StatTile label="Lista de espera" value={String(highlight.fila_por_situacao["Lista de espera"] ?? 0)} />
          </div>
          <p className="text-sm">
            Pressão histórica:{" "}
            <strong>
              {highlight.relacao_demanda_1a_por_capacidade
                ? `${highlight.relacao_demanda_1a_por_capacidade.toFixed(2)}×`
                : "—"}
            </strong>{" "}
            a demanda de 1ª preferência sobre a capacidade conhecida.
          </p>
          <button
            onClick={() => setSelected(highlight)}
            className="w-fit rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Ver detalhes
          </button>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
              Ranking por maior demanda de 1ª preferência
            </h2>
            <ProvenanceBadge kind="historico-2025" />
          </div>
          <p className="text-xs text-black/50 dark:text-white/50">
            Mostrando as {opportunity.ranking_maior_demanda_1a_preferencia_geral.length} unidades×grupamento×turno
            com maior demanda entre {opportunity.registros.length} registros de 2025.
          </p>
          <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-black/[.03] text-left text-xs text-black/50 dark:bg-white/[.05] dark:text-white/50">
                <tr>
                  <th className="px-3 py-2 font-medium">Pressão</th>
                  <th className="px-3 py-2 font-medium">Unidade</th>
                  <th className="px-3 py-2 font-medium">CRE</th>
                  <th className="px-3 py-2 font-medium">Grupamento</th>
                  <th className="px-3 py-2 font-medium">Turno</th>
                  <th className="px-3 py-2 font-medium text-right">1ª pref.</th>
                  <th className="px-3 py-2 font-medium text-right">Fila</th>
                  <th className="px-3 py-2 font-medium text-right">Capacidade</th>
                </tr>
              </thead>
              <tbody>
                {opportunity.ranking_maior_demanda_1a_preferencia_geral.map((r) => (
                  <tr
                    key={recordKey(r)}
                    onClick={() => setSelected(r)}
                    className="cursor-pointer border-t border-black/5 hover:bg-black/[.03] dark:border-white/5 dark:hover:bg-white/[.05]"
                  >
                    <td className="px-3 py-2">
                      <PressureDot record={r} />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{r.nome_unidade ?? `Unidade ${r.unidade}`}</span>
                      <span className="block text-xs text-black/50 dark:text-white/50">
                        {r.bairro ?? "bairro não disponível"}
                      </span>
                    </td>
                    <td className="px-3 py-2">{r.cre ?? "—"}</td>
                    <td className="px-3 py-2">{r.grupamento}</td>
                    <td className="px-3 py-2">{r.horario}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.demanda_1a_preferencia}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.fila_por_situacao["Lista de espera"] ?? 0}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {r.capacidade_disponivel ? r.meta_capacidade : "não disponível"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <RankingPanel
            title="Maior pressão real (capacidade conhecida)"
            records={opportunity.ranking_maior_pressao_com_capacidade_conhecida.slice(0, 8)}
            onSelect={setSelected}
            metric={(r) => `${r.saldo_potencial} vagas`}
          />
          <RankingPanel
            title="Possível superávit (capacidade conhecida)"
            records={opportunity.ranking_possivel_superavit_com_capacidade_conhecida.slice(0, 8)}
            onSelect={setSelected}
            metric={(r) => `+${r.saldo_potencial} vagas`}
          />
        </div>
      </section>

      {selected && <UnitDrawer record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function RankingPanel({
  title,
  records,
  onSelect,
  metric,
}: {
  title: string;
  records: OpportunityRecord[];
  onSelect: (r: OpportunityRecord) => void;
  metric: (r: OpportunityRecord) => string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="flex flex-col gap-1">
        {records.map((r) => (
          <li key={recordKey(r)}>
            <button
              onClick={() => onSelect(r)}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-black/[.03] dark:hover:bg-white/[.05]"
            >
              <span className="truncate">{r.nome_unidade ?? `Unidade ${r.unidade}`}</span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-black/50 dark:text-white/50">
                {metric(r)}
              </span>
            </button>
          </li>
        ))}
        {records.length === 0 && (
          <li className="text-xs text-black/50 dark:text-white/50">Nenhum registro nesta categoria.</li>
        )}
      </ul>
    </div>
  );
}
