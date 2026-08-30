"use client";

import { useState, type ReactNode } from "react";

export type TabDef = { id: string; label: string };

export function Tabs({
  tabs,
  initial,
  children,
}: {
  tabs: TabDef[];
  initial?: string;
  children: (activeId: string) => ReactNode;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 border-b border-black/10 dark:border-white/10" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              active === tab.id
                ? "border-b-2 border-blue-700 text-blue-800 dark:border-blue-400 dark:text-blue-300"
                : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}
