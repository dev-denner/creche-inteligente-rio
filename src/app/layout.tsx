import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { NavHeader } from "@/components/NavHeader";
import { DemoModeProvider } from "@/components/demo/DemoModeContext";
import { DemoModePanel } from "@/components/demo/DemoModePanel";
import { DemoAwareMain } from "@/components/demo/DemoAwareMain";
import { FamilyStoreProvider } from "@/lib/family-store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Creche Inteligente Rio",
  description: "Transparência para a família. Inteligência para a CRE.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FamilyStoreProvider>
          <DemoModeProvider>
            <NavHeader />
            <DemoAwareMain>{children}</DemoAwareMain>
            <footer className="mx-auto w-full max-w-[1100px] border-t border-black/10 px-4 py-4 text-xs text-black/50">
              Protótipo desenvolvido com dados anonimizados do desafio. Indicadores históricos
              demonstram a dinâmica do processo e não representam a situação atual da rede.
              Acessibilidade: contraste AA, navegação por teclado. Hipóteses normativas (prazos,
              pontos por preferência) aparecem sempre rotuladas e não são regra vigente.
            </footer>
            <DemoModePanel />
          </DemoModeProvider>
        </FamilyStoreProvider>
      </body>
    </html>
  );
}
