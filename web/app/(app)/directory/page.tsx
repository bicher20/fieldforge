import { listCustomers, listLocations, listSkills, listTeams } from "@/lib/api";
import { PageHead, SectionHeading, inputClass } from "@/components/ui";
import { createCustomerAction, createLocationAction, createSkillAction, createTeamAction } from "./actions";

export default async function DirectoryPage() {
  const [customers, locations, skills, teams] = await Promise.all([
    listCustomers(),
    listLocations(),
    listSkills(),
    listTeams(),
  ]);
  const customerById = new Map(customers.map((c) => [c.id, c]));

  return (
    <>
      <PageHead title="Annuaire" subtitle="Clients, sites, compétences et équipes" />

      <SectionHeading count={customers.length}>Clients</SectionHeading>
      <div className="mb-3 overflow-hidden rounded-md border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-surface-alt text-left text-[0.72rem] uppercase tracking-wide text-text-soft">
              <th className="px-3.5 py-2.5 font-semibold">Nom</th><th className="px-3.5 py-2.5 font-semibold">Téléphone</th><th className="px-3.5 py-2.5 font-semibold">Email</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && <tr><td colSpan={3} className="px-3.5 py-3 text-text-faint">Aucun client.</td></tr>}
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-border"><td className="px-3.5 py-2">{c.name}</td><td className="px-3.5 py-2">{c.phone ?? "—"}</td><td className="px-3.5 py-2">{c.email ?? "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={createCustomerAction} className="mb-6 rounded-md border border-border bg-surface p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs text-text-soft">Nom</span><input name="name" required className={inputClass} /></label>
          <label className="block"><span className="mb-1 block text-xs text-text-soft">Téléphone</span><input name="phone" className={inputClass} /></label>
        </div>
        <label className="mt-3 block"><span className="mb-1 block text-xs text-text-soft">Email</span><input name="email" type="email" className={inputClass} /></label>
        <button className="mt-3 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110">Ajouter un client</button>
      </form>

      <SectionHeading count={locations.length}>Sites</SectionHeading>
      <div className="mb-3 overflow-hidden rounded-md border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-surface-alt text-left text-[0.72rem] uppercase tracking-wide text-text-soft">
              <th className="px-3.5 py-2.5 font-semibold">Libellé</th><th className="px-3.5 py-2.5 font-semibold">Adresse</th><th className="px-3.5 py-2.5 font-semibold">Ville</th><th className="px-3.5 py-2.5 font-semibold">Zone</th><th className="px-3.5 py-2.5 font-semibold">Client</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 && <tr><td colSpan={5} className="px-3.5 py-3 text-text-faint">Aucun site.</td></tr>}
            {locations.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-3.5 py-2">{l.label}</td><td className="whitespace-normal px-3.5 py-2">{l.address_line}</td><td className="px-3.5 py-2">{l.city ?? "—"}</td><td className="px-3.5 py-2">{l.zone ?? "—"}</td>
                <td className="px-3.5 py-2">{l.customer_id ? customerById.get(l.customer_id)?.name ?? "—" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form action={createLocationAction} className="mb-6 rounded-md border border-border bg-surface p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="mb-1 block text-xs text-text-soft">Libellé</span><input name="label" required className={inputClass} /></label>
          <label className="block"><span className="mb-1 block text-xs text-text-soft">Adresse</span><input name="address_line" required className={inputClass} /></label>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <label className="block"><span className="mb-1 block text-xs text-text-soft">Ville</span><input name="city" className={inputClass} /></label>
          <label className="block"><span className="mb-1 block text-xs text-text-soft">Code postal</span><input name="postal_code" className={inputClass} /></label>
          <label className="block"><span className="mb-1 block text-xs text-text-soft">Zone</span><input name="zone" className={inputClass} /></label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-text-soft">Client</span>
          <select name="customer_id" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <button className="mt-3 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110">Ajouter un site</button>
      </form>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <SectionHeading count={skills.length}>Compétences</SectionHeading>
          <div className="mb-3 overflow-hidden rounded-md border border-border bg-surface shadow-sm">
            <table className="w-full border-collapse text-[0.85rem]">
              <tbody>
                {skills.length === 0 && <tr><td className="px-3.5 py-3 text-text-faint">Aucune compétence.</td></tr>}
                {skills.map((s) => <tr key={s.id} className="border-t border-border first:border-t-0"><td className="px-3.5 py-2">{s.name}</td></tr>)}
              </tbody>
            </table>
          </div>
          <form action={createSkillAction} className="flex gap-2 rounded-md border border-border bg-surface p-4 shadow-sm">
            <input name="name" required placeholder="Nom de la compétence" className={inputClass} />
            <button className="flex-shrink-0 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110">Ajouter</button>
          </form>
        </div>

        <div>
          <SectionHeading count={teams.length}>Équipes</SectionHeading>
          <div className="mb-3 overflow-hidden rounded-md border border-border bg-surface shadow-sm">
            <table className="w-full border-collapse text-[0.85rem]">
              <tbody>
                {teams.length === 0 && <tr><td className="px-3.5 py-3 text-text-faint">Aucune équipe.</td></tr>}
                {teams.map((t) => <tr key={t.id} className="border-t border-border first:border-t-0"><td className="px-3.5 py-2">{t.name}</td></tr>)}
              </tbody>
            </table>
          </div>
          <form action={createTeamAction} className="flex gap-2 rounded-md border border-border bg-surface p-4 shadow-sm">
            <input name="name" required placeholder="Nom de l'équipe" className={inputClass} />
            <button className="flex-shrink-0 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110">Ajouter</button>
          </form>
        </div>
      </div>
    </>
  );
}
