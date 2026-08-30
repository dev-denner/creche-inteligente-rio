"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

type Tentativa = {
  id: number;
  canal: string;
  estado: "sucesso" | "pendente";
  descricao: string;
  quando: string;
};

const TENTATIVAS_INICIAIS: Tentativa[] = [
  { id: 1, canal: "Portal", estado: "sucesso", descricao: "Visualizada", quando: "Hoje, 10:32" },
  { id: 2, canal: "E-mail", estado: "sucesso", descricao: "Entregue", quando: "Hoje, 10:33" },
  { id: 3, canal: "WhatsApp", estado: "pendente", descricao: "Integração institucional", quando: "Pendente SME" },
  { id: 4, canal: "SMS", estado: "pendente", descricao: "Canal de contingência", quando: "Pendente SME" },
];

const ESCALONAMENTO = ["Principal sem resposta", "Nova tentativa", "Contato de confiança", "Atendimento humano"];

export function ContactAttempts() {
  const [tentativas, setTentativas] = useState(TENTATIVAS_INICIAIS);

  function simularNovaTentativa() {
    setTentativas((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        canal: "Contato de confiança",
        estado: "pendente",
        descricao: "Canal de escalonamento",
        quando: "Pendente SME",
      },
    ]);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="font-medium">Tentativas de contato</h3>
        <ProvenanceBadge kind="demonstracao" />
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        Estes eventos NÃO foram realmente enviados -- é uma simulação da mecânica de convocação
        multicanal.
      </p>

      <ul className="flex flex-col gap-2">
        {tentativas.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-2 rounded-md bg-black/[.03] px-3 py-2 text-sm dark:bg-white/[.05]"
          >
            <span className="flex items-center gap-2">
              <span className={t.estado === "sucesso" ? "text-emerald-600 dark:text-emerald-400" : "text-black/40 dark:text-white/40"}>
                {t.estado === "sucesso" ? "✓" : "○"}
              </span>
              <span className="font-medium">{t.canal}</span>
              <span className="text-black/60 dark:text-white/60">{t.descricao}</span>
            </span>
            <span className="text-xs text-black/50 dark:text-white/50">{t.quando}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={simularNovaTentativa}
        className="w-fit rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium dark:border-white/20"
      >
        Simular novo evento de contato
      </button>

      <div>
        <p className="mb-2 text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Escalonamento
        </p>
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {ESCALONAMENTO.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/[.08]">{step}</span>
              {i < ESCALONAMENTO.length - 1 && <span className="text-black/30 dark:text-white/30">→</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
