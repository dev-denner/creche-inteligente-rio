"use client";

import { useState } from "react";

export function AnalyzeWithClaude({
  getContext,
  endpoint = "/api/claude/analyze-unit",
  label = "Analisar com Claude",
}: {
  getContext: () => unknown;
  endpoint?: string;
  label?: string;
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
        setText(data.error ?? "Não foi possível gerar a análise agora.");
        setStatus("error");
        return;
      }
      setText(data.analise ?? "");
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
        className="w-fit rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {status === "loading" ? "Analisando com Claude..." : label}
      </button>
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
