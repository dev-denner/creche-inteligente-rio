"use client";

import { useState } from "react";
import { ClaudeResponseCard } from "@/components/ClaudeResponseCard";

export function ClaudeAction({
  getContext,
  endpoint,
  label,
  loadingLabel,
  labels,
  titulo,
}: {
  getContext: () => unknown;
  endpoint: string;
  label: string;
  loadingLabel?: string;
  labels: string[];
  titulo?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [text, setText] = useState("");

  async function handleClick() {
    setStatus("loading");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getContext()),
      });
      const data = await response.json();
      if (!response.ok) {
        setText(data.error ?? "Não foi possível gerar a resposta agora.");
        setStatus("error");
        return;
      }
      setText(data.explicacao ?? data.analise ?? "");
      setStatus("done");
    } catch {
      setText("Não foi possível falar com o Claude agora. Tente novamente em instantes.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className="w-fit rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-blue-600"
      >
        {status === "loading" ? (loadingLabel ?? "Consultando Claude...") : label}
      </button>
      {status === "error" && <p className="text-sm text-rose-700 dark:text-rose-300">{text}</p>}
      {status === "loading" && <p className="text-sm text-black/60 dark:text-white/60">Pensando...</p>}
      {status === "done" && <ClaudeResponseCard text={text} labels={labels} titulo={titulo} />}
    </div>
  );
}
