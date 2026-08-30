"use client";

import { useRouter } from "next/navigation";
import { useDemoMode } from "@/components/demo/DemoModeContext";

type Step = { titulo: string; instrucao: string; rota?: string };

const STEPS: Step[] = [
  { titulo: "1. Família em lista", instrucao: "Portal da Família → aba \"Minhas opções\": veja Maria em Lista de espera na 2ª opção.", rota: "/" },
  { titulo: "2. Movimento da fila", instrucao: "Abra o detalhe da 1ª opção e mostre o indicador de posição/movimentação (↑/↓), calculado a partir dos dados reais.", rota: "/" },
  { titulo: "3. Nova movimentação", instrucao: "Troque para outra opção da lista e compare a movimentação dela com a anterior.", rota: "/" },
  { titulo: "4. Convocação", instrucao: "Destaque o bloco \"O que precisa da sua atenção\" no estado Convocado, no topo do Portal da Família.", rota: "/" },
  { titulo: "5. Abrir convocação", instrucao: "Aba \"Convocação\": mostre tentativas de contato multicanal, contatos de confiança e o cronômetro.", rota: "/" },
  { titulo: "6. Confirmar", instrucao: "Clique em \"Confirmar vaga\" e mostre o encerramento pendente nas demais opções.", rota: "/" },
  { titulo: "7. Alternar para CRE", instrucao: "Troque para o Painel CRE / SME pela navegação superior.", rota: "/cre" },
  { titulo: "8. Efeito e auditoria", instrucao: "Em \"Classificação viva\", simule a expiração de uma convocação e mostre a Trilha de Auditoria registrando o evento.", rota: "/cre" },
  { titulo: "9. Laboratório de Política", instrucao: "Abra o Laboratório de Política Pública, ajuste os pesos e clique em \"Simular impacto\".", rota: "/cre" },
];

export function DemoModePanel() {
  const { enabled, step, setStep } = useDemoMode();
  const router = useRouter();

  if (!enabled) return null;

  const current = STEPS[step];

  function goTo(index: number) {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
    setStep(clamped);
    const rota = STEPS[clamped].rota;
    if (rota) router.push(rota);
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-amber-300 bg-white p-4 shadow-lg dark:border-amber-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide dark:text-amber-300">
          Demo guiada · passo {step + 1}/{STEPS.length}
        </p>
        <button
          onClick={() => {
            setStep(0);
            window.location.reload();
          }}
          className="text-xs text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
          title="Recarrega a página para restaurar todo o estado local da demonstração"
        >
          Reiniciar demonstração
        </button>
      </div>
      <p className="mt-2 text-sm font-medium">{current.titulo}</p>
      <p className="text-sm text-black/70 dark:text-white/70">{current.instrucao}</p>
      <div className="mt-3 flex justify-between gap-2">
        <button
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium disabled:opacity-40 dark:border-white/20"
        >
          Anterior
        </button>
        <button
          onClick={() => goTo(step + 1)}
          disabled={step === STEPS.length - 1}
          className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
