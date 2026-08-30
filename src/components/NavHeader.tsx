"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DemoModeToggle } from "@/components/demo/DemoModeToggle";

const TABS = [
  { href: "/", label: "Portal da Família" },
  { href: "/cre", label: "Painel CRE / SME" },
];

export function NavHeader() {
  const pathname = usePathname();
  const isCre = pathname?.startsWith("/cre");

  return (
    <header className="border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-blue-950/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-md bg-blue-900 px-2 py-1 text-sm font-bold tracking-wide text-white dark:bg-blue-700">
              RIO
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">Inscrição Creche</p>
              <p className="text-xs text-black/50 dark:text-white/50">
                Secretaria Municipal de Educação · Protótipo · Time 6
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DemoModeToggle />
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white dark:bg-blue-500">
                {isCre ? "CRE" : "AS"}
              </span>
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-tight">{isCre ? "Visão operacional" : "Ana Souza"}</p>
                <p className="text-xs leading-tight text-black/50 dark:text-white/50">
                  {isCre ? "CRE" : "Responsável"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
          {TABS.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-blue-900 shadow-sm dark:bg-black/60 dark:text-blue-300"
                    : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
