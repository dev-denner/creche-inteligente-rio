"use client";

import { useMemo, useState } from "react";

import type { OpportunityData, OpportunityRecord } from "@/lib/opportunity";
import { assessPressure, recordKey } from "@/lib/opportunity";
import type { PolicyLabData } from "@/lib/policy-lab";
import { AUDIT_SEED, type AuditEvent } from "@/lib/audit";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { Tabs } from "@/components/Tabs";
import { UnitDrawer } from "@/components/cre/UnitDrawer";
import { PolicyLab } from "@/components/cre/PolicyLab";
import { LiveClassification } from "@/components/cre/LiveClassification";
import { TerritorialPanel } from "@/components/cre/TerritorialPanel";
import { Inconsistencies } from "@/components/cre/Inconsistencies";
import { AuditTrail } from "@/components/cre/AuditTrail";

function StatTile({ label, value }: { label: string; value: string; kind?: "real" | "demo" }) {
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
  policyLab,
}: {
  opportunity: OpportunityData;
  highlight: OpportunityRecord | null;
  policyLab: PolicyLabData | null;
}) {
  const [selected, setSelected] = useState<OpportunityRecord | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>(AUDIT_SEED);
  const distinctUnidades = new Set(opportunity.registros.map((r) => r.unidade)).size;

  const unidadesAltaPressao = useMemo(
    () => opportunity.registros.filter((r) => assessPressure(r).nivel === "ALTA").length,
    [opportunity.registros],
  );

  const convocacoesAguardando = useMemo(
    () =>
      opportunity.registros.reduce(
        (sum, r) => sum + (r.fila_por_situacao["Selecionado"] ?? 0) + (r.fila_por_situacao["Selecionado da lista"] ?? 0),
        0,
      ),
    [opportunity.registros],
  );

  function appendEvent(descricao: string, tipo: string) {
    setEvents((prev) => [
      {
        id: prev.length + 1,
        quando: "agora",
        tipo,
        statusAnterior: "--",
        novoStatus: "--",
        descricao,
        origem: "Ação nesta sessão",
        responsavel: "Você",
      },
      ...prev,
    ]);
  }

  const tabs = [
    { id: "geral", label: "Visão geral" },
    { id: "unidades", label: "Unidades e pressão" },
    { id: "convocacoes", label: "Convocações" },
    { id: "inconsistencias", label: "Inconsistências" },
    { id: "auditoria", label: "Auditoria" },
    { id: "laboratorio", label: "Laboratório de Política Pública" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Painel CRE</h1>
        <p className="text-black/60 dark:text-white/60">Onde agir agora?</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Unidades sob alta pressão" value={unidadesAltaPressao.toLocaleString("pt-BR")} />
        <StatTile label="Convocações aguardando resposta" value={convocacoesAguardando.toLocaleString("pt-BR")} />
        <StatTile label="Prazos críticos (demonstrativo)" value="3" />
        <StatTile label="Inconsistências detectadas (demonstrativo)" value="4" />
      </section>

      <Tabs tabs={tabs} initial="geral">
        {(active) => (
          <>
            {active === "geral" && (
              <div className="flex flex-col gap-8">
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
                      <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide dark:text-rose-300">
                        Caso de alta pressão
                      </span>
                      <ProvenanceBadge kind="historico-2025" />
                    </div>
                    <h2 className="text-lg font-semibold">{highlight.nome_unidade}</h2>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      CRE {highlight.cre} · {highlight.bairro}
                    </p>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      {highlight.grupamento} · {highlight.horario}
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <StatTile label="1ª preferências" value={String(highlight.demanda_1a_preferencia)} />
                      <StatTile label="Capacidade contratada" value={String(highlight.meta_capacidade)} />
                      <StatTile label="Vagas" value={String(highlight.vagas_ofertadas)} />
                      <StatTile label="Lista de espera" value={String(highlight.fila_por_situacao["Lista de espera"] ?? 0)} />
                    </div>
                    <p className="text-sm">
                      <strong>
                        {highlight.relacao_demanda_1a_por_capacidade
                          ? `${highlight.relacao_demanda_1a_por_capacidade.toFixed(2)}×`
                          : "—"}
                      </strong>{" "}
                      pressão -- demanda de 1ª preferência sobre a capacidade conhecida.
                    </p>
                    <button
                      onClick={() => setSelected(highlight)}
                      className="w-fit rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white dark:bg-blue-600"
                    >
                      Ver detalhes
                    </button>
                  </section>
                )}
              </div>
            )}

            {active === "unidades" && (
              <div className="flex flex-col gap-6">
                <section className="grid gap-6 lg:grid-cols-3">
                  <div className="flex flex-col gap-3 lg:col-span-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
                        Ranking por maior demanda de 1ª preferência
                      </h2>
                      <ProvenanceBadge kind="historico-2025" />
                    </div>
                    <p className="text-xs text-black/50 dark:text-white/50">
                      Mostrando as {opportunity.ranking_maior_demanda_1a_preferencia_geral.length}{" "}
                      unidades×grupamento×turno com maior demanda entre {opportunity.registros.length}{" "}
                      registros de 2025.
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
                              <td className="px-3 py-2 text-right tabular-nums">
                                {r.fila_por_situacao["Lista de espera"] ?? 0}
                              </td>
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

                <TerritorialPanel coberturaTerritorioPct={opportunity.cobertura.cobertura_territorio_pct} />
              </div>
            )}

            {active === "convocacoes" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
                    Convocações aguardando resposta
                  </h2>
                  <ProvenanceBadge kind="historico-2025" />
                </div>
                <p className="text-sm text-black/70 dark:text-white/70">
                  {convocacoesAguardando.toLocaleString("pt-BR")} opções com situação &ldquo;Selecionado&rdquo;
                  ou &ldquo;Selecionado da lista&rdquo; em 2025 (contagem real, agregada -- não é uma
                  fila de atendimento ao vivo).
                </p>
                {policyLab && (
                  <LiveClassification
                    fila={policyLab.filas.find((f) => f.unidade === highlight?.unidade) ?? policyLab.filas[0]}
                    onExpire={(candidatoId, unidade) =>
                      appendEvent(
                        `Candidato ${candidatoId} da fila ${unidade}: convocação expirou, fila recalculada.`,
                        "Classificação viva",
                      )
                    }
                  />
                )}
              </div>
            )}

            {active === "inconsistencias" && (
              <Inconsistencies onResolved={(titulo) => appendEvent(`Inconsistência revisada: ${titulo}.`, "Inconsistência")} />
            )}

            {active === "auditoria" && <AuditTrail events={events} />}

            {active === "laboratorio" && policyLab && <PolicyLab data={policyLab} />}
          </>
        )}
      </Tabs>

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
