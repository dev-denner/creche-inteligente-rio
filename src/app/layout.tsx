import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { NavHeader } from "@/components/NavHeader";
import { DemoModeProvider } from "@/components/demo/DemoModeContext";
import { DemoModePanel } from "@/components/demo/DemoModePanel";
import { DemoAwareMain } from "@/components/demo/DemoAwareMain";

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
      <body className="min-h-full flex flex-col bg-white text-black dark:bg-black dark:text-white">
        <DemoModeProvider>
          <NavHeader />
          <DemoAwareMain>{children}</DemoAwareMain>
          <footer className="border-t border-black/10 px-6 py-4 text-center text-xs text-black/40 dark:border-white/10 dark:text-white/40">
            Protótipo desenvolvido com dados anonimizados do desafio. Indicadores demonstram a
            dinâmica do processo e não representam a situação atual da rede.
          </footer>
          <DemoModePanel />
        </DemoModeProvider>
      </body>
    </html>
  );
}
