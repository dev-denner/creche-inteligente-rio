export type AuditEvent = {
  id: number;
  quando: string;
  tipo: string;
  statusAnterior: string;
  novoStatus: string;
  descricao: string;
  origem: string;
  responsavel?: string;
};

export const AUDIT_SEED: AuditEvent[] = [
  {
    id: 1,
    quando: "hoje · 08:12",
    tipo: "Convocação",
    statusAnterior: "Lista de espera",
    novoStatus: "Selecionado",
    descricao: "Candidato movido para selecionado após liberação de vaga.",
    origem: "Regra determinística",
  },
  {
    id: 2,
    quando: "hoje · 09:47",
    tipo: "Inconsistência",
    statusAnterior: "Selecionado",
    novoStatus: "Selecionado",
    descricao: "Opção com status ativo em duas unidades ao mesmo tempo -- sinalizado para revisão.",
    origem: "IA (triagem)",
    responsavel: "Aguardando servidor",
  },
];
