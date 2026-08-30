"use client";

import Link from "next/link";
import { useState } from "react";
import { useFamilyStore } from "@/lib/family-store";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function GenericChildJourney({ id }: { id: string }) {
  const { children } = useFamilyStore();
  const [tab, setTab] = useState<"dados" | "docs" | "fila">("fila");
  const child = children.find((c) => c.id === id);

  if (!child) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-10">
        <Link href="/" className="text-sm text-[var(--azul7)] underline">
          ← Minhas inscrições
        </Link>
        <p className="mt-4 text-sm text-black/60">Inscrição não encontrada nesta sessão.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <Link href="/" className="text-sm text-[var(--azul7)] underline">
        ← Minhas inscrições
      </Link>
      <div className="mt-2 rounded-lg border-l-[6px] border-black/10 bg-white p-4 shadow-sm" style={{ borderLeftColor: "var(--azul7)" }}>
        <h1 className="text-xl font-semibold" style={{ color: "var(--azul9)" }}>
          {child.name}
        </h1>
        <p className="text-sm text-black/60">
          {child.group} · Protocolo {child.protocol} · Inscrição Creche 2027
        </p>
      </div>

      <div className="my-4 flex gap-1 border-b-2 border-black/10">
        {[
          { id: "fila", label: "3 · Acompanhamento de fila" },
          { id: "docs", label: "2 · Documentação" },
          { id: "dados", label: "1 · Dados da inscrição" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className="px-3 py-2 text-sm font-semibold"
            style={
              tab === t.id
                ? { color: "var(--azul7)", borderBottom: "3px solid var(--azul7)" }
                : { color: "var(--c5)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dados" && (
        <div className="grid gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2">
          <div className="text-xs text-black/50">
            <strong className="block text-sm text-black">{child.name}</strong>Nome da criança
          </div>
          <div className="text-xs text-black/50">
            <strong className="block text-sm text-black">{child.cpfChild}</strong>CPF da criança —
            identificador oficial único
          </div>
          <div className="text-xs text-black/50">
            <strong className="block text-sm text-black">{child.group}</strong>Grupamento
          </div>
          <div className="text-xs text-black/50">
            <strong className="block text-sm text-black">{child.protocol}</strong>Protocolo
          </div>
        </div>
      )}

      {tab === "docs" && (
        <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ProvenanceBadge kind="demonstracao" />
            <p className="text-sm text-black/70">
              Documentação recebida e assinada via gov.br (simulado). Triagem com apoio de IA;
              decisão final é sempre humana.
            </p>
          </div>
          {child.vulnCriteria.length === 0 ? (
            <p className="text-sm text-black/60">Nenhum critério de vulnerabilidade declarado.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {child.vulnCriteria.map((c) => (
                <li key={c} className="flex items-center justify-between rounded-md bg-[var(--c0)] px-3 py-2 text-sm">
                  <span>{c}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: "var(--lar1)", color: "var(--lar7)" }}
                  >
                    Em análise
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "fila" && (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border p-3 text-sm" style={{ background: "var(--azul0)", borderColor: "var(--azul1)", color: "var(--azul9)" }}>
            Inscrição em análise -- a fila começa a valer após a validação da documentação.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {child.options.map((o, i) => (
              <div key={i} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm">
                <p className="text-xs text-black/50">
                  <strong>{i + 1}ª opção</strong>
                </p>
                <h3 className="mt-1 font-semibold" style={{ color: "var(--azul9)" }}>
                  {o.nome_unidade}
                </h3>
                <p className="text-sm text-black/60">
                  {o.bairro ?? "bairro não disponível"} · Turno {o.horario} · {o.grupamento}
                </p>
                <p className="mt-2 text-sm font-bold" style={{ color: "var(--azul9)" }}>
                  Documentação em análise
                </p>
                <p
                  className="mt-1 text-sm font-bold"
                  style={{
                    color: o.comp === "Alta" ? "var(--verm7)" : o.comp === "Média" ? "var(--lar7)" : "var(--verde7)",
                  }}
                >
                  Concorrência: {o.comp}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
