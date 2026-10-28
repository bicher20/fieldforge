import Link from "next/link";
import { listCustomers, listJobs, listLocations, listResources } from "@/lib/api";
import { PageHead, PriorityTag, StatusBadge, inputClass } from "@/components/ui";
import type { JobStatus } from "@/lib/types";

const STATUSES: JobStatus[] = ["draft", "scheduled", "in_progress", "done", "cancelled"];

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status_filter?: string; q?: string }>;
}) {
  const { status_filter, q } = await searchParams;
  const [allJobs, resources, locations, customers] = await Promise.all([
    listJobs(status_filter),
    listResources(),
    listLocations(),
    listCustomers(),
  ]);
  const resourceById = new Map(resources.map((r) => [r.id, r]));
  const locationById = new Map(locations.map((l) => [l.id, l]));
  const customerById = new Map(customers.map((c) => [c.id, c]));

  const needle = q?.trim().toLowerCase() ?? "";
  const jobs = needle
    ? allJobs.filter((job) => {
        const customerName = job.customer_id ? customerById.get(job.customer_id)?.name ?? "" : "";
        return job.title.toLowerCase().includes(needle) || customerName.toLowerCase().includes(needle);
      })
    : allJobs;

  return (
    <>
      <PageHead
        title="Interventions"
        subtitle={`${jobs.length} résultat${jobs.length !== 1 ? "s" : ""}${status_filter ? ` — statut : ${status_filter}` : ""}${needle ? ` — recherche : "${q}"` : ""}`}
        action={
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110"
          >
            + Nouvelle intervention
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs"}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${!status_filter ? "border-accent bg-accent-soft text-accent" : "border-border-strong bg-surface text-text hover:bg-surface-alt"}`}
          >
            Toutes
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={`/jobs?status_filter=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${status_filter === s ? "border-accent bg-accent-soft text-accent" : "border-border-strong bg-surface text-text hover:bg-surface-alt"}`}
            >
              {s}
            </Link>
          ))}
        </div>
        <form className="flex items-center gap-2">
          {status_filter && <input type="hidden" name="status_filter" value={status_filter} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Rechercher par titre ou client…"
            className={inputClass + " w-64"}
          />
          <button className="rounded-md border border-border-strong bg-surface px-3 py-2 text-sm font-semibold text-text hover:bg-surface-alt">
            Rechercher
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-surface shadow-sm">
        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="bg-surface-alt text-left text-[0.72rem] uppercase tracking-wide text-text-soft">
              <th className="px-3.5 py-2.5 font-semibold">Intervention</th>
              <th className="px-3.5 py-2.5 font-semibold">Client</th>
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
                <td colSpan={7} className="px-3.5 py-4 text-text-faint">
                  Aucune intervention{status_filter ? " avec ce statut" : ""}{needle ? ` pour "${q}"` : ""}.{" "}
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
                    {job.customer_id ? customerById.get(job.customer_id)?.name ?? "—" : "—"}
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
