"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "./actions";

const NAV = [
  { section: "Opérations", items: [
    { href: "/", label: "Tableau de bord" },
    { href: "/jobs", label: "Interventions" },
    { href: "/dispatch", label: "Dispatch" },
  ]},
  { section: "Référentiel", items: [
    { href: "/resources", label: "Ressources" },
    { href: "/directory", label: "Annuaire" },
  ]},
];

function SidebarContents({ username }: { username: string }) {
  const pathname = usePathname();
  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-5 py-5 text-[1.02rem] font-extrabold tracking-tight">
        <span className="h-[22px] w-[22px] flex-shrink-0 rounded-[5px] bg-accent" />
        Field<span className="text-accent">Forge</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="px-2.5 pb-1 pt-3 text-[0.68rem] font-bold uppercase tracking-wide text-text-faint first:pt-1">
              {group.section}
            </div>
            {group.items.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.87rem] font-medium hover:bg-surface-alt hover:text-text ${
                    active ? "bg-accent-soft text-accent" : "text-text-soft"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-accent" : "bg-border-strong"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <form action={logoutAction} className="flex items-center gap-2.5 border-t border-border px-4 py-3">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft text-[0.78rem] font-bold text-accent">
          {username[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[0.83rem] font-semibold text-text">{username}</div>
          <button type="submit" className="text-[0.76rem] text-text-faint hover:text-stop">
            Se déconnecter
          </button>
        </div>
      </form>
    </>
  );
}

export function Sidebar({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes (navigation = done, dismiss).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-border text-text-soft hover:bg-surface-alt"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M2 5h14M2 9h14M2 13h14" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-[0.95rem] font-extrabold tracking-tight">
          <span className="h-[18px] w-[18px] flex-shrink-0 rounded-[4px] bg-accent" />
          Field<span className="text-accent">Forge</span>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[232px] flex-shrink-0 flex-col border-r border-border bg-surface md:flex">
        <SidebarContents username={username} />
      </aside>

      {/* Mobile drawer + overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative flex h-full w-[260px] max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl">
            <SidebarContents username={username} />
          </aside>
        </div>
      )}
    </>
  );
}
