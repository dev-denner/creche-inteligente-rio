import type { AuditEvent } from "@/lib/audit";
import { ProvenanceBadge } from "@/components/ProvenanceBadge";

export function AuditTrail({ events }: { events: AuditEvent[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-black/10 p-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <h3 className="font-medium">Trilha de auditoria</h3>
        <ProvenanceBadge kind="demonstracao" />
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        Eventos demonstrativos, incluindo os que você mesmo gerar simulando expiração de convocação
        ou revisando inconsistências nesta sessão.
      </p>
      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/[.03] text-left text-xs text-black/50 dark:bg-white/[.05] dark:text-white/50">
            <tr>
              <th className="px-3 py-2 font-medium">Data/hora</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Status anterior</th>
              <th className="px-3 py-2 font-medium">Novo status</th>
              <th className="px-3 py-2 font-medium">Descrição</th>
              <th className="px-3 py-2 font-medium">Origem</th>
              <th className="px-3 py-2 font-medium">Responsável</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-black/5 dark:border-white/5">
                <td className="px-3 py-2 whitespace-nowrap">{e.quando}</td>
                <td className="px-3 py-2">{e.tipo}</td>
                <td className="px-3 py-2">{e.statusAnterior}</td>
                <td className="px-3 py-2">{e.novoStatus}</td>
                <td className="px-3 py-2">{e.descricao}</td>
                <td className="px-3 py-2">{e.origem}</td>
                <td className="px-3 py-2">{e.responsavel ?? "--"}</td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-xs text-black/50 dark:text-white/50">
                  Nenhum evento ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
