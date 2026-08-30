"use client";

import { useRouter } from "next/navigation";
import { useDemoMode } from "@/components/demo/DemoModeContext";

type Step = { titulo: string; instrucao: string; rota?: string };

const STEPS: Step[] = [
  { titulo: "1. Login fake", instrucao: "Faça login com CPF + senha (gov.br simulado) e mostre o texto de autenticação simulada.", rota: "/login" },
  { titulo: "2. Múltiplas crianças", instrucao: "Na home \"Minhas inscrições\", mostre o bloco de Maria e o botão + Nova inscrição.", rota: "/" },
  { titulo: "3. Abrir Maria", instrucao: "Abra a inscrição de Maria e mostre a aba \"Minhas opções\" (Lista de espera na 2ª opção).", rota: "/crianca/maria" },
  { titulo: "4. Simular avanço", instrucao: "No Painel CRE, aba Convocações → Classificação viva → \"Simular expiração\" (fila real recalculada).", rota: "/cre" },
  { titulo: "5. Convocação", instrucao: "Volte ao Portal da Família: destaque o bloco \"Vaga disponível\" no topo e a aba Convocação (multicanal, contatos, cronômetro).", rota: "/crianca/maria" },
  { titulo: "6. Confirmar", instrucao: "Clique em \"Confirmar vaga\".", rota: "/crianca/maria" },
  { titulo: "7. Comprovante", instrucao: "Mostre o comprovante de confirmação (local, documentos, situação das demais opções).", rota: "/crianca/maria" },
  { titulo: "8. Alternar para CRE", instrucao: "Troque para o Painel CRE / SME e mostre a Trilha de Auditoria com o evento registrado.", rota: "/cre" },
  { titulo: "9. Laboratório de Política", instrucao: "Abra o Laboratório de Política Pública, ajuste os pesos e clique em \"Simular impacto\".", rota: "/cre" },
  { titulo: "10. (opcional) Nova inscrição", instrucao: "Volte à home e rode o wizard de 6 etapas até enviar uma nova inscrição fictícia.", rota: "/" },
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
