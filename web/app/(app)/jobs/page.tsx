import Link from "next/link";
import { listJobs, listLocations, listResources } from "@/lib/api";
import { PageHead, PriorityTag, StatusBadge } from "@/components/ui";
import type { JobStatus } from "@/lib/types";

const STATUSES: JobStatus[] = ["draft", "scheduled", "in_progress", "done", "cancelled"];

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status_filter?: string }>;
}) {
  const { status_filter } = await searchParams;
  const [jobs, resources, locations] = await Promise.all([
    listJobs(status_filter),
    listResources(),
    listLocations(),
  ]);
  const resourceById = new Map(resources.map((r) => [r.id, r]));
  const locationById = new Map(locations.map((l) => [l.id, l]));

  return (
    <>
      <PageHead
        title="Interventions"
        subtitle={`${jobs.length} résultat${jobs.length !== 1 ? "s" : ""}${status_filter ? ` — statut : ${status_filter}` : ""}`}
        action={
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            + Nouvelle intervention
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/jobs"
          className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${!status_filter ? "border-accent bg-accent-soft text-accent" : "border-border-strong bg-surface text-text hover:bg-surface-alt"}`}
        >
          Toutes
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/jobs?status_filter=${s}`}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${status_filter === s ? "border-accent bg-accent-soft text-accent" : "border-border-strong bg-surface text-text hover:bg-surface-alt"}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-surface-alt text-left text-[0.72rem] uppercase tracking-wide text-text-soft">
              <th className="px-3.5 py-2.5 font-semibold">Intervention</th>
              <th className="px-3.5 py-2.5 font-semibold">Statut</th>
              <th className="px-3.5 py-2.5 font-semibold">Priorité</th>
              <th className="px-3.5 py-2.5 font-semibold">Site</th>
              <th className="px-3.5 py-2.5 font-semibold">Créneau</th>
              <th className="px-3.5 py-2.5 font-semibold">Ressource</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3.5 py-4 text-text-faint">
                  Aucune intervention{status_filter ? " avec ce statut" : ""}.{" "}
                  <Link href="/jobs/new" className="font-semibold text-accent hover:underline">
                    Créer une intervention
                  </Link>
                </td>
              </tr>
            )}
            {jobs.map((job) => {
              const loc = job.location_id ? locationById.get(job.location_id) : undefined;
              return (
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
                  <td className="whitespace-normal px-3.5 py-2.5">
                    {loc?.label ?? "—"}
                    {loc?.city && <div className="text-[0.78rem] text-text-faint">{loc.city}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[0.82rem] text-text-soft">
                    {fmt(job.window_start)}
                    {job.duration_minutes && <div className="text-[0.78rem] text-text-faint">{job.duration_minutes} min</div>}
                  </td>
                  <td className="px-3.5 py-2.5">
                    {job.assigned_resource_id ? resourceById.get(job.assigned_resource_id)?.name ?? "—" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
