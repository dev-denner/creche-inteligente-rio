"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/family-store";
import { GovBadge } from "@/components/GovBadge";

type MariaSummary = {
  id: string;
  name: string;
  cpfChild: string;
  group: string;
  protocol: string;
  numOpcoes: number;
  status: string;
  momento: string;
};

export function HomeClient({ maria }: { maria: MariaSummary }) {
  const { loggedIn, children } = useFamilyStore();
  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) router.replace("/login");
  }, [loggedIn, router]);

  if (!loggedIn) return null;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--azul9)" }}>
        Olá, Ana
      </h1>
      <p className="mb-4 text-sm text-black/60">
        Suas inscrições na Inscrição Creche 2027. Cada criança tem seu próprio bloco -- toque para
        abrir o andamento.
      </p>

      <ChildCardRow
        name={maria.name}
        cpf={maria.cpfChild}
        line={`${maria.group} · Inscrição Creche 2027 · Protocolo ${maria.protocol} · ${maria.numOpcoes} opções`}
        momento={maria.momento}
        status={maria.status}
        href={`/crianca/${maria.id}`}
      />

      {children.map((c) => (
        <ChildCardRow
          key={c.id}
          name={c.name}
          cpf="***.***.***-**"
          line={`${c.group} · Inscrição Creche 2027 · Protocolo ${c.protocol} · ${c.options.length} opções`}
          momento="Envio de documentação / análise"
          status="Documentação em análise"
          href={`/crianca/${c.id}`}
        />
      ))}

      <div className="rounded-lg border-2 border-dashed border-black/20 bg-white p-4 text-center shadow-sm">
        <p className="mb-2 text-sm">Deseja inscrever outra criança?</p>
        <Link
          href="/inscricao"
          className="inline-block rounded-md border-2 px-4 py-2 text-sm font-semibold"
          style={{ borderColor: "var(--azul7)", color: "var(--azul7)" }}
        >
          ➕ Nova inscrição
        </Link>
      </div>

      <div
        className="mt-4 flex gap-2 rounded-lg border p-3 text-sm"
        style={{ background: "var(--azul0)", borderColor: "var(--azul1)", color: "var(--azul9)" }}
      >
        <span aria-hidden="true">ℹ️</span>
        <span>
          A jornada tem 3 momentos: <strong>1) Inscrição</strong> → <strong>2) Envio de
          documentação</strong> → <strong>3) Acompanhamento de fila</strong>. Você pode acompanhar
          tudo por aqui.
        </span>
      </div>
    </div>
  );
}

function ChildCardRow({
  name,
  cpf,
  line,
  momento,
  status,
  href,
}: {
  name: string;
  cpf: string;
  line: string;
  momento: string;
  status: string;
  href: string;
}) {
  return (
    <div
      className="mb-4 rounded-lg border-l-[6px] bg-white p-4 shadow-sm"
      style={{ borderLeftColor: "var(--azul7)" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold" style={{ color: "var(--azul9)" }}>
            {name}
          </h3>
          <p className="text-xs text-black/50">
            CPF da criança (identificador oficial): <strong>{cpf}</strong>
          </p>
          <p className="text-xs text-black/50">{line}</p>
          <p className="mt-1 text-xs text-black/50">
            Momento atual: <strong>{momento}</strong>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <GovBadge status={status} />
          <Link
            href={href}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-white"
            style={{ background: "var(--azul7)" }}
          >
            Abrir inscrição
          </Link>
        </div>
      </div>
    </div>
  );
}
