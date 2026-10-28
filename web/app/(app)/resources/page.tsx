import { listResources, listSkills, listTeams } from "@/lib/api";
import { PageHead, SectionHeading, StatusBadge } from "@/components/ui";
import { NewResourceForm } from "./form";

export default async function ResourcesPage() {
  const [resources, teams, skills] = await Promise.all([listResources(), listTeams(), listSkills()]);
  const teamById = new Map(teams.map((t) => [t.id, t]));

  return (
    <>
      <PageHead
        title="Ressources"
        subtitle={`${resources.length} technicien(s), chauffeur(s) et équipier(s)`}
      />

      <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-surface-alt text-left text-[0.72rem] uppercase tracking-wide text-text-soft">
              <th className="px-3.5 py-2.5 font-semibold">Nom</th>
              <th className="px-3.5 py-2.5 font-semibold">Rôle</th>
              <th className="px-3.5 py-2.5 font-semibold">Équipe</th>
              <th className="px-3.5 py-2.5 font-semibold">Contact</th>
              <th className="px-3.5 py-2.5 font-semibold">Véhicule</th>
              <th className="px-3.5 py-2.5 font-semibold">Compétences</th>
              <th className="px-3.5 py-2.5 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 && (
              <tr><td colSpan={7} className="px-3.5 py-4 text-text-faint">Aucune ressource enregistrée.</td></tr>
            )}
            {resources.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-surface-alt">
                <td className="px-3.5 py-2.5 font-medium">{r.name}</td>
                <td className="px-3.5 py-2.5">{r.role}</td>
                <td className="px-3.5 py-2.5">{r.team_id ? teamById.get(r.team_id)?.name ?? "—" : "—"}</td>
                <td className="whitespace-normal px-3.5 py-2.5">
                  {r.phone ?? "—"}
                  {r.email && <div className="text-[0.78rem] text-text-faint">{r.email}</div>}
                </td>
                <td className="px-3.5 py-2.5">{r.vehicle_label ?? "—"}</td>
                <td className="whitespace-normal px-3.5 py-2.5">{r.skills.length ? r.skills.map((s) => s.name).join(", ") : "—"}</td>
                <td className="px-3.5 py-2.5"><StatusBadge status={r.active ? "done" : "cancelled"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeading>Ajouter une ressource</SectionHeading>
      <NewResourceForm teams={teams} skills={skills} />
    </>
  );
}
