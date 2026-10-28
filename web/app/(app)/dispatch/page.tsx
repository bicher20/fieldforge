import { listJobs, listResources, optimizeStatus } from "@/lib/api";
import { PageHead } from "@/components/ui";
import { OptimizePanel } from "./optimize-panel";
import type { JobStatus } from "@/lib/types";

const COLUMNS: { status: JobStatus; accent: string }[] = [
  { status: "draft", accent: "var(--stone)" },
  { status: "scheduled", accent: "var(--accent)" },
  { status: "in_progress", accent: "var(--route)" },
  { status: "done", accent: "var(--clear)" },
  { status: "cancelled", accent: "var(--stop)" },
];

export default async function DispatchPage() {
  const [jobs, resources, status] = await Promise.all([listJobs(), listResources(), optimizeStatus()]);
  const resourceById = new Map(resources.map((r) => [r.id, r]));
  const jobsById = new Map(jobs.map((j) => [j.id, j]));

  return (
    <>
      <PageHead title="Dispatch board" subtitle="Répartition des interventions par statut" />

      <OptimizePanel jobsById={jobsById} resourcesById={resourceById} configured={status.configured} />

      <div className="flex gap-3.5 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.status);
          return (
            <div key={col.status} className="min-w-[250px] flex-1 rounded-md border border-border bg-surface-alt p-2.5">
              <h3 className="mb-2.5 flex items-center justify-between text-[0.76rem] font-bold uppercase tracking-wide text-text-soft">
                {col.status}
                <span className="font-mono font-normal text-text-faint">{colJobs.length}</span>
              </h3>
              {colJobs.length === 0 && <div className="px-0.5 py-1 text-sm text-text-faint">Aucune intervention</div>}
              {colJobs.map((job) => {
                const resource = job.assigned_resource_id ? resourceById.get(job.assigned_resource_id) : undefined;
                return (
                  <a
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="mb-2 block rounded-md border border-border bg-surface p-2.5 shadow-sm"
                    style={{ borderLeft: `3px solid ${col.accent}` }}
                  >
                    <div className="text-[0.85rem] font-semibold hover:text-accent">{job.title}</div>
                    <div className="mt-1 flex flex-col gap-0.5 text-[0.76rem] text-text-faint">
                      <span className="font-mono">
                        {job.window_start &&
                          new Date(job.window_start).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        {job.duration_minutes && ` · ${job.duration_minutes} min`}
                      </span>
                      {resource && <span>→ {resource.name}</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
