"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

type Contact = { id: number; papel: string; nome: string; telefone: string };

const CONTATOS_INICIAIS: Contact[] = [
  { id: 1, papel: "Responsável principal", nome: "Responsável demonstrativo 1", telefone: "(21) 0000-0001" },
  { id: 2, papel: "Segundo responsável", nome: "Responsável demonstrativo 2", telefone: "(21) 0000-0002" },
];

let nextId = 3;

export function TrustedContacts() {
  const [contatos, setContatos] = useState<Contact[]>(CONTATOS_INICIAIS);
  const [novoNome, setNovoNome] = useState("");

  function adicionar() {
    if (!novoNome.trim()) return;
    setContatos((prev) => [
      ...prev,
      { id: nextId++, papel: "Contato de confiança", nome: novoNome.trim(), telefone: "(21) 0000-0000" },
    ]);
    setNovoNome("");
  }

  function remover(id: number) {
    setContatos((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="font-medium">Contatos autorizados</h3>
        <ProvenanceBadge kind="demonstracao" />
      </div>
      <ul className="flex flex-col gap-2">
        {contatos.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-md bg-black/[.03] px-3 py-2 text-sm dark:bg-white/[.05]"
          >
            <span>
              <span className="font-medium">{c.papel}</span> -- {c.nome} · {c.telefone}
            </span>
            <button
              onClick={() => remover(c.id)}
              className="text-xs text-black/50 hover:text-rose-700 dark:text-white/50 dark:hover:text-rose-300"
            >
              remover
            </button>
          </li>
        ))}
        {contatos.length === 0 && (
          <li className="text-xs text-black/50 dark:text-white/50">Nenhum contato adicionado.</li>
        )}
      </ul>
      <div className="flex gap-2">
        <input
          value={novoNome}
          onChange={(e) => setNovoNome(e.target.value)}
          placeholder="Nome do contato de confiança (fictício)"
          className="flex-1 rounded-md border border-black/20 px-3 py-1.5 text-sm dark:border-white/20 dark:bg-black"
        />
        <button
          onClick={adicionar}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Adicionar
        </button>
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        Dados totalmente fictícios, alterados apenas neste estado local do navegador (refresh
        restaura o cenário inicial). Em produção, canais e contatos adicionais dependem de política
        institucional, base legal e consentimento quando aplicável.
      </p>
    </section>
  );
}
