"use client";

import { useState } from "react";

export function ExplainWithClaude({ getContext }: { getContext: () => unknown }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [text, setText] = useState("");

  async function handleClick() {
    setStatus("loading");
    try {
      const response = await fetch("/api/claude/explain-family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getContext()),
      });
      const data = await response.json();
      if (!response.ok) {
        setText(data.error ?? "Não foi possível gerar a explicação agora.");
        setStatus("error");
        return;
      }
      setText(data.explicacao ?? "");
      setStatus("done");
    } catch {
      setText("Não foi possível falar com o Claude agora. Tente novamente em instantes.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 p-5 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-medium">Explique minha situação</h3>
        <button
          onClick={handleClick}
          disabled={status === "loading"}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {status === "loading" ? "Consultando Claude..." : "Explique minha situação"}
        </button>
      </div>
      {status === "idle" && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Peça uma explicação em linguagem simples sobre a sua situação atual, com base nos dados
          desta tela.
        </p>
      )}
      {status !== "idle" && (
        <p
          className={`text-sm whitespace-pre-wrap ${
            status === "error" ? "text-rose-700 dark:text-rose-300" : "text-black/80 dark:text-white/80"
          }`}
        >
          {status === "loading" ? "Pensando..." : text}
        </p>
      )}
    </div>
  );
}
