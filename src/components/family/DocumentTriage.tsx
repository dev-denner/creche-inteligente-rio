"use client";

import { useState } from "react";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { ClaudeResponseCard } from "@/components/ClaudeResponseCard";

const TRIAGE_LABELS = ["Documento legível", "Tipo aparente", "Ponto de atenção", "Recomendação"];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentTriage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [text, setText] = useState("");
  const [encaminhado, setEncaminhado] = useState(false);

  async function handleTriagem() {
    if (!file) return;
    setStatus("loading");
    setEncaminhado(false);
    try {
      const response = await fetch("/api/claude/triage-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeArquivo: file.name,
          tamanhoBytes: file.size,
          tipoMime: file.type || "desconhecido",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setText(data.error ?? "Não foi possível gerar a triagem agora.");
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
    <section className="flex flex-col gap-4 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="font-medium">Comprovação documental</h3>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setStatus("idle");
            setText("");
            setEncaminhado(false);
          }}
          className="text-sm"
        />
        {file && (
          <p className="text-xs text-black/60 dark:text-white/60">
            {file.name} · {formatBytes(file.size)} · não é enviado a nenhum servidor de
            armazenamento -- fica só neste navegador.
          </p>
        )}
      </div>

      {file && (
        <button
          onClick={handleTriagem}
          disabled={status === "loading"}
          className="w-fit rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {status === "loading" ? "Analisando..." : "Triagem assistida por Claude"}
        </button>
      )}

      {(status === "loading" || status === "error") && (
        <div className="flex flex-col gap-2 rounded-lg bg-black/[.03] p-3 dark:bg-white/[.05]">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Triagem assistida</p>
            <ProvenanceBadge kind="demonstracao" />
          </div>
          <p className={`text-sm ${status === "error" ? "text-rose-700 dark:text-rose-300" : "text-black/60 dark:text-white/60"}`}>
            {status === "loading" ? "Pensando..." : text}
          </p>
        </div>
      )}

      {status === "done" && (
        <ClaudeResponseCard text={text} labels={TRIAGE_LABELS} titulo="Triagem assistida" />
      )}

      {status === "done" && (
        <p className="text-xs text-black/50 dark:text-white/50">
          Nesta demo, a triagem utiliza metadados do arquivo (nome/tipo/tamanho); o conteúdo não é
          armazenado nem enviado como documento completo.
        </p>
      )}

      {status === "done" && !encaminhado && (
        <button
          onClick={() => setEncaminhado(true)}
          className="w-fit rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium dark:border-white/20"
        >
          Encaminhar para validação humana
        </button>
      )}

      {encaminhado && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
            Human-in-the-loop
          </p>
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              IA realizou triagem inicial
            </li>
            <span className="text-black/30 dark:text-white/30">→</span>
            <li className="rounded-full bg-amber-50 px-3 py-1 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Servidor responsável revisa
            </li>
            <span className="text-black/30 dark:text-white/30">→</span>
            <li className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/[.08]">
              Decisão registrada
            </li>
          </ol>
          <p className="text-xs text-black/50 dark:text-white/50">
            Encaminhamento simulado nesta demonstração -- nenhum servidor real foi notificado.
          </p>
        </div>
      )}
    </section>
  );
}
