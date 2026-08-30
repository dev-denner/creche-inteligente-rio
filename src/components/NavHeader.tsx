"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Portal da Família" },
  { href: "/cre", label: "Visão CRE" },
];

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold tracking-tight">Creche Inteligente Rio</p>
          <p className="text-xs text-black/60 dark:text-white/60">
            Transparência para a família. Inteligência para a CRE.
          </p>
        </div>
        <nav className="flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-black shadow-sm dark:bg-black/60 dark:text-white"
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
