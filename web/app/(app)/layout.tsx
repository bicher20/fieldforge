import { getUsername } from "@/lib/session";
import { Sidebar } from "./sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const username = (await getUsername()) ?? "—";

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar username={username} />
      <main className="min-w-0 flex-1 px-4 py-5 pb-16 sm:px-6 md:px-9 md:py-7" style={{ maxWidth: 1280 }}>
        {children}
      </main>
    </div>
  );
}
