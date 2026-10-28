import Link from "next/link";
import { listCustomers, listJobs, listResources } from "@/lib/api";
import { Kpi, PageHead, PriorityTag, SectionHeading, StatusBadge } from "@/components/ui";
import type { JobStatus } from "@/lib/types";

const STATUS_ORDER: JobStatus[] = ["draft", "scheduled", "in_progress", "done", "cancelled"];
const STATUS_DOT: Record<JobStatus, string> = {
  draft: "var(--stone)",
  scheduled: "var(--accent)",
  in_progress: "var(--route)",
  done: "var(--clear)",
  cancelled: "var(--stop)",
};

function fmt(dt: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function DashboardPage() {
  const [jobs, resources, customers] = await Promise.all([listJobs(), listResources(), listCustomers()]);

  const counts: Record<JobStatus, number> = { draft: 0, scheduled: 0, in_progress: 0, done: 0, cancelled: 0 };
  for (const j of jobs) counts[j.status]++;
  const unassigned = jobs.filter((j) => j.status === "draft" && !j.assigned_resource_id).length;
  const activeJobs = counts.scheduled + counts.in_progress;
  const recent = jobs.slice(0, 8);
  const resourceById = new Map(resources.map((r) => [r.id, r]));
  const customerById = new Map(customers.map((c) => [c.id, c]));

  return (
    <>
      <PageHead
        title="Tableau de bord"
        subtitle="Vue d'ensemble de l'activité en cours"
        action={
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            + Nouvelle intervention
          </Link>
        }
      />

      {unassigned > 0 && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-[#D7DEFB] bg-accent-soft px-4 py-3 text-sm">
          <span>
            <strong>{unassigned}</strong> intervention{unassigned !== 1 ? "s" : ""} en brouillon sans ressource
            affectée.
          </span>
          <Link href="/jobs?status_filter=draft" className="font-semibold text-accent hover:underline">
            Affecter maintenant
          </Link>
        </div>
      )}

      <SectionHeading>Par statut</SectionHeading>
      <div className="mb-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUS_ORDER.map((s) => (
          <Kpi key={s} label={s} value={counts[s]} dotColor={STATUS_DOT[s]} />
        ))}
      </div>

      <SectionHeading>Aperçu opérationnel</SectionHeading>
      <div className="mb-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi label="Interventions actives" value={activeJobs} />
        <Kpi label="Ressources disponibles" value={resources.length} />
        <Kpi label="Clients" value={customers.length} />
      </div>

      <SectionHeading count={recent.length}>Interventions récentes</SectionHeading>
      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-surface-alt text-left text-[0.72rem] uppercase tracking-wide text-text-soft">
              <th className="px-3.5 py-2.5 font-semibold">Intervention</th>
              <th className="px-3.5 py-2.5 font-semibold">Statut</th>
              <th className="px-3.5 py-2.5 font-semibold">Priorité</th>
              <th className="px-3.5 py-2.5 font-semibold">Client</th>
              <th className="px-3.5 py-2.5 font-semibold">Ressource</th>
              <th className="px-3.5 py-2.5 font-semibold">Créneau</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3.5 py-4 text-text-faint">
                  Aucune intervention pour l&apos;instant.{" "}
                  <Link href="/jobs/new" className="font-semibold text-accent hover:underline">
                    Crée la première
                  </Link>
                  .
                </td>
              </tr>
            )}
            {recent.map((job) => (
              <tr key={job.id} className="border-t border-border hover:bg-surface-alt">
                <td className="px-3.5 py-2.5">
                  <Link href={`/jobs/${job.id}`} className="font-semibold text-accent hover:underline">
                    {job.title}
                  </Link>
                  <div className="text-[0.78rem] text-text-faint">
                    {job.job_type ?? "intervention"} · #{String(job.id).padStart(4, "0")}
                  </div>
                </td>
                <td className="px-3.5 py-2.5">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-3.5 py-2.5">
                  <PriorityTag priority={job.priority} />
                </td>
                <td className="px-3.5 py-2.5">{job.customer_id ? customerById.get(job.customer_id)?.name ?? "—" : "—"}</td>
                <td className="px-3.5 py-2.5">
                  {job.assigned_resource_id ? resourceById.get(job.assigned_resource_id)?.name ?? "—" : "—"}
                </td>
                <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[0.82rem] text-text-soft">
                  {fmt(job.window_start)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
