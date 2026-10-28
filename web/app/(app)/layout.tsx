import Link from "next/link";
import { getUsername } from "@/lib/session";
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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const username = (await getUsername()) ?? "—";

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-[232px] flex-shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-5 py-5 text-[1.02rem] font-extrabold tracking-tight">
          <span className="h-[22px] w-[22px] flex-shrink-0 rounded-[5px] bg-accent" />
          Field<span className="text-accent">Forge</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2.5">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="px-2.5 pb-1 pt-3 text-[0.68rem] font-bold uppercase tracking-wide text-text-faint first:pt-1">
                {group.section}
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[0.87rem] font-medium text-text-soft hover:bg-surface-alt hover:text-text"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
                  {item.label}
                </Link>
              ))}
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
      </aside>
      <main className="min-w-0 flex-1 px-9 py-7 pb-16" style={{ maxWidth: 1280 }}>
        {children}
      </main>
    </div>
  );
}
