import Link from "next/link";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function PreferenceTransparency() {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <h3 className="font-medium">Por que pedimos sua ordem de preferência?</h3>

      <div>
        <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
          Hoje
        </p>
        <p className="text-sm text-black/70 dark:text-white/70">
          A ordem registra o desejo da família. A pontuação usada nesta demonstração vem só da régua
          histórica 2025 (socioeconômica) -- a ordem de preferência não altera essa pontuação.
        </p>
      </div>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <p className="text-xs font-medium text-black/50 uppercase tracking-wide dark:text-white/50">
            Proposta em estudo
          </p>
          <ProvenanceBadge kind="proposta" />
        </div>
        <p className="text-sm text-black/70 dark:text-white/70">
          A SME poderia testar uma política em que a ordem de preferência recebe peso na
          classificação, somado à pontuação socioeconômica.
        </p>
        <p className="mt-2 text-xs text-black/50 dark:text-white/50">
          Se uma política assim fosse adotada, os pesos deveriam ser transparentes antes da
          inscrição.
        </p>
      </div>

      <Link
        href="/cre"
        className="w-fit rounded-md border border-violet-300 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/30"
      >
        Entenda como a SME pode simular essa política
      </Link>

      <p className="text-xs text-black/50 dark:text-white/50">
        Esta seção não altera a pontuação atual mostrada em &ldquo;Minha classificação&rdquo;.
      </p>
    </section>
  );
}
