import { readDatasetSummary } from "@/lib/summary";

const FRENTES = [
  {
    titulo: "Planejamento de oferta",
    pergunta: "Quantas vagas abrir e onde?",
    descricao:
      "Cruzar demanda histórica, nascidos vivos e vagas ofertadas por território para apontar onde a rede está sob ou sobre pressão.",
  },
  {
    titulo: "Priorização da fila",
    pergunta: "Em que ordem chamar a fila?",
    descricao:
      "Explicar a régua de pontuação e critérios de desempate usados na classificação, de forma auditável por um servidor.",
  },
  {
    titulo: "Convocação",
    pergunta: "Como garantir que a família chegue à vaga dentro do prazo?",
    descricao:
      "Apoiar o acompanhamento da convocação até a matrícula, sinalizando risco de perda de vaga por prazo.",
  },
];

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900">
      <svg viewBox="0 0 6 6" aria-hidden="true" className="h-1.5 w-1.5 fill-amber-500">
        <circle cx="3" cy="3" r="3" />
      </svg>
      Em construção
    </span>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 bg-black/[.02] px-4 py-3 dark:border-white/10 dark:bg-white/[.03]">
      <dt className="text-xs text-black/60 dark:text-white/60">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export default function Home() {
  const summary = readDatasetSummary();
  const anos = summary?.anos ?? [];
  const anoMin = anos.length ? Math.min(...anos.map((a) => a.ano)) : null;
  const anoMax = anos.length ? Math.max(...anos.map((a) => a.ano)) : null;
  const unidadesMax = anos.length ? Math.max(...anos.map((a) => a.unidades_distintas)) : null;
  const situacaoTopo = summary?.situacao?.[0];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 sm:py-24">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-wide text-black/50 uppercase dark:text-white/50">
          Claude Impact Lab Rio 2026
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Copiloto da fila da creche — SME-Rio
          <span className="block text-base font-normal text-black/60 dark:text-white/60">
            (título provisório)
          </span>
        </h1>
        <p className="max-w-xl text-black/70 dark:text-white/70">
          Estamos construindo inteligência acionável para a fila de creche do Rio de
          Janeiro: transformar dados de oferta, demanda, fila e território em
          recomendações explicáveis para servidores da SME.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Três frentes
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FRENTES.map((frente) => (
            <div
              key={frente.titulo}
              className="flex flex-col gap-2 rounded-xl border border-black/10 p-5 dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{frente.titulo}</h3>
                <StatusBadge />
              </div>
              <p className="text-sm italic text-black/50 dark:text-white/50">
                &ldquo;{frente.pergunta}&rdquo;
              </p>
              <p className="text-sm text-black/70 dark:text-white/70">{frente.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Dataset (pipeline reprodutível)
        </h2>
        {summary ? (
          <dl className="grid gap-3 sm:grid-cols-4">
            <StatTile label="Opções de creche analisadas" value={summary.total_opcoes.toLocaleString("pt-BR")} />
            <StatTile label="Processos seletivos" value={anoMin && anoMax ? `${anoMin}–${anoMax}` : "—"} />
            <StatTile label="Unidades distintas (máx./ano)" value={unidadesMax?.toLocaleString("pt-BR") ?? "—"} />
            <StatTile
              label="Situação mais comum"
              value={situacaoTopo ? situacaoTopo.situacao : "—"}
            />
          </dl>
        ) : (
          <p className="text-sm text-black/60 dark:text-white/60">
            Nenhum agregado encontrado. Rode{" "}
            <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
              python scripts/build_summary.py
            </code>{" "}
            para gerar <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">data/processed/summary.json</code>.
          </p>
        )}
        <p className="text-xs text-black/40 dark:text-white/40">
          Dados anonimizados da SME-Rio (2021–2025, 5 processos seletivos). Indicadores
          não representam a realidade — ver aviso em{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
            ../dadoscreche/README.md
          </code>
          .
        </p>
      </section>

      <footer className="mt-auto pt-8 text-xs text-black/40 dark:text-white/40">
        Jornada de produto ainda em definição. Esta é uma página de diagnóstico, não a
        experiência final.
      </footer>
    </div>
  );
}
