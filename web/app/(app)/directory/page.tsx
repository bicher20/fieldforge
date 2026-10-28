import { listCustomers, listLocations, listSkills, listTeams } from "@/lib/api";
import { PageHead, SectionHeading } from "@/components/ui";
import { NewCustomerForm, NewLocationForm, NewSkillForm, NewTeamForm } from "./forms";

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
      <div className="mb-3 overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
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
      <NewCustomerForm />

      <SectionHeading count={locations.length}>Sites</SectionHeading>
      <div className="mb-3 overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-surface-alt text-left text-[0.72rem] uppercase tracking-wide text-text-soft">
              <th className="px-3.5 py-2.5 font-semibold">Libellé</th><th className="px-3.5 py-2.5 font-semibold">Adresse</th><th className="px-3.5 py-2.5 font-semibold">Ville</th><th className="px-3.5 py-2.5 font-semibold">Zone</th><th className="px-3.5 py-2.5 font-semibold">Coordonnées</th><th className="px-3.5 py-2.5 font-semibold">Client</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 && <tr><td colSpan={6} className="px-3.5 py-3 text-text-faint">Aucun site.</td></tr>}
            {locations.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-3.5 py-2">{l.label}</td><td className="whitespace-normal px-3.5 py-2">{l.address_line}</td><td className="px-3.5 py-2">{l.city ?? "—"}</td><td className="px-3.5 py-2">{l.zone ?? "—"}</td>
                <td className="px-3.5 py-2 font-mono text-[0.78rem]">
                  {l.latitude != null && l.longitude != null
                    ? `${l.latitude.toFixed(4)}, ${l.longitude.toFixed(4)}`
                    : <span className="text-stop">manquantes</span>}
                </td>
                <td className="px-3.5 py-2">{l.customer_id ? customerById.get(l.customer_id)?.name ?? "—" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <NewLocationForm customers={customers} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <SectionHeading count={skills.length}>Compétences</SectionHeading>
          <div className="mb-3 overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
            <table className="w-full border-collapse text-[0.85rem]">
              <tbody>
                {skills.length === 0 && <tr><td className="px-3.5 py-3 text-text-faint">Aucune compétence.</td></tr>}
                {skills.map((s) => <tr key={s.id} className="border-t border-border first:border-t-0"><td className="px-3.5 py-2">{s.name}</td></tr>)}
              </tbody>
            </table>
          </div>
          <NewSkillForm />
        </div>

        <div>
          <SectionHeading count={teams.length}>Équipes</SectionHeading>
          <div className="mb-3 overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
            <table className="w-full border-collapse text-[0.85rem]">
              <tbody>
                {teams.length === 0 && <tr><td className="px-3.5 py-3 text-text-faint">Aucune équipe.</td></tr>}
                {teams.map((t) => <tr key={t.id} className="border-t border-border first:border-t-0"><td className="px-3.5 py-2">{t.name}</td></tr>)}
              </tbody>
            </table>
          </div>
          <NewTeamForm />
        </div>
      </div>
    </>
  );
}
