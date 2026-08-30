import type { OpportunityRecord } from "@/lib/opportunity";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";
import { GovBadge } from "@/components/GovBadge";

const DOCS_A_LEVAR = [
  "Certidão de nascimento e CPF da criança",
  "Documento com foto e CPF do responsável",
  "Comprovante de residência recente",
  "Caderneta de vacinação",
  "Comprovantes dos critérios declarados (se solicitado)",
];

export function Comprovante({
  hero,
  outrasOpcoes,
}: {
  hero: OpportunityRecord | null;
  outrasOpcoes: { ordem: number; nome: string; status: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-white p-5 text-center shadow-sm">
        <p className="text-3xl">✅</p>
        <h2 className="text-xl font-semibold" style={{ color: "var(--azul9)" }}>
          Vaga confirmada!
        </h2>
        <p className="text-sm text-black/60">
          {hero?.nome_unidade ?? "Unidade"} · {hero?.grupamento} · {hero?.horario} · Protocolo
          2027-004412
        </p>
        <div className="mt-2 flex justify-center">
          <GovBadge status="Confirmado" />
        </div>
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="font-semibold" style={{ color: "var(--azul9)" }}>
          📄 Comprovante de confirmação — próximos passos
        </h3>
        <p className="my-2 text-sm">
          Para <strong>efetivar a matrícula</strong>, compareça à unidade dentro do prazo abaixo
          levando os documentos listados.
        </p>
        <p className="text-center font-bold" style={{ color: "var(--verde7)" }}>
          Comparecer em até 5 dias úteis
        </p>
        <p className="mb-3 text-center text-xs text-black/50">
          Prazo presencial demonstrativo <ProvenanceBadge kind="pendente-sme" /> — regra oficial
          pendente SME.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold" style={{ color: "var(--azul9)" }}>
              📍 Local (demonstrativo)
            </h4>
            <p className="text-sm">
              {hero?.nome_unidade}
              <br />
              Rua das Acácias, 123 — {hero?.bairro ?? "bairro não disponível"}, Rio de Janeiro/RJ
              <br />
              Seg a sex, 8h às 16h · Tel (21) 0000-0000
              <br />
              <ProvenanceBadge kind="demonstracao" />
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold" style={{ color: "var(--azul9)" }}>
              🗂️ Documentos para levar (originais)
            </h4>
            <ul className="list-disc pl-5 text-sm">
              {DOCS_A_LEVAR.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => window.print()}
            className="rounded-md px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "var(--azul7)" }}
          >
            🖨️ Imprimir / salvar comprovante
          </button>
        </div>
      </div>

      <div className="rounded-lg p-4 text-sm" style={{ background: "var(--verde1)", color: "var(--verde7)" }}>
        <strong>O que aconteceu:</strong> a vaga confirmada está ocupada e não volta à fila. As
        demais opções foram encerradas e as posições liberadas -- os próximos candidatos dessas
        filas avançam.
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-2 font-semibold" style={{ color: "var(--azul9)" }}>
          Situação das demais opções
        </h3>
        <table className="table">
          <thead>
            <tr>
              <th>Opção</th>
              <th>Unidade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {outrasOpcoes.map((o) => (
              <tr key={o.ordem}>
                <td>{o.ordem}ª</td>
                <td>{o.nome}</td>
                <td>
                  <GovBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-black/50">
          Status &ldquo;Cancelado na confirmação&rdquo; simulado -- nomenclatura oficial a validar
          SME/ICH.
        </p>
      </div>
    </div>
  );
}
