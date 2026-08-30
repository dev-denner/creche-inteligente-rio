"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFamilyStore } from "@/lib/family-store";
import { HelpButton } from "@/components/family/HelpModal";

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [cpf] = useState("123.456.789-10");
  const router = useRouter();
  const { login } = useFamilyStore();

  function doLogin() {
    login();
    router.push("/");
  }

  return (
    <div className="mx-auto max-w-[420px] px-4 py-10">
      <div className="rounded-xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,.14)]">
        <p className="text-2xl font-extrabold" style={{ color: "var(--azul7)" }}>
          gov<em style={{ color: "var(--amarelo)", fontStyle: "normal" }}>.br</em>
        </p>
        <p className="my-3 text-sm text-black/60">
          Acesso à Inscrição Creche 2027 — Prefeitura do Rio ·{" "}
          <strong>autenticação simulada para demonstração</strong>
        </p>

        {step === 1 ? (
          <>
            <p className="mb-3 text-sm">
              Identifique-se no <strong>gov.br</strong> com:
            </p>
            <label className="mb-1 block text-sm font-semibold">Número do CPF</label>
            <p className="mb-1 text-xs text-black/50">
              Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
            </p>
            <input
              type="text"
              inputMode="numeric"
              defaultValue={cpf}
              className="w-full rounded-md border border-black/20 px-3 py-2 text-sm"
            />
            <button
              onClick={() => setStep(2)}
              style={{ background: "var(--azul7)" }}
              className="mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            >
              Continuar
            </button>
            <div className="mt-5 flex flex-col gap-2">
              <p className="text-xs text-black/50">Outras opções de identificação:</p>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-md border border-black/20 px-3 py-2 text-left text-sm hover:bg-[var(--azul0)]"
              >
                🏦 Login com seu banco
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-md border border-black/20 px-3 py-2 text-left text-sm hover:bg-[var(--azul0)]"
              >
                📱 Login com QR code
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-md border border-black/20 px-3 py-2 text-left text-sm hover:bg-[var(--azul0)]"
              >
                🔐 Seu certificado digital
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm">
              CPF <strong>{cpf}</strong>
            </p>
            <label className="mb-1 block text-sm font-semibold">Senha</label>
            <input
              type="password"
              defaultValue="********"
              autoComplete="current-password"
              className="w-full rounded-md border border-black/20 px-3 py-2 text-sm"
            />
            <button
              onClick={doLogin}
              style={{ background: "var(--azul7)" }}
              className="mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white"
            >
              Entrar
            </button>
            <button onClick={() => setStep(1)} className="mt-2 w-full text-sm text-[var(--azul7)] underline">
              Voltar
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-4 text-sm shadow-sm">
        <p>
          <strong>Acessibilidade e apoio:</strong> este portal tem contraste adequado, navegação por
          teclado e leitura por leitor de tela. Se preferir atendimento humano, você pode se
          inscrever presencialmente.
        </p>
        <HelpButton label="Saiba mais: unidade de atendimento presencial mais próxima" />
      </div>
    </div>
  );
}
