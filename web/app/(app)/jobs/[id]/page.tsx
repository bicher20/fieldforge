import Link from "next/link";
import { getJob, listResources } from "@/lib/api";
import { PageHead, PriorityTag, StatusBadge, inputClass } from "@/components/ui";
import { assignAction, cancelAction, closeAction, photoAction, signatureAction, startAction } from "./actions";
import { notFound } from "next/navigation";

function fmt(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobId = Number(id);
  const [job, resources] = await Promise.all([getJob(jobId), listResources()]).catch(() => [null, []] as const);
  if (!job) notFound();

  const photos: string[] = job.photo_files ? JSON.parse(job.photo_files) : [];
  const boundAssign = assignAction.bind(null, job.id);
  const boundStart = startAction.bind(null, job.id);
  const boundClose = closeAction.bind(null, job.id);
  const boundCancel = cancelAction.bind(null, job.id);
  const boundSignature = signatureAction.bind(null, job.id);
  const boundPhoto = photoAction.bind(null, job.id);

  return (
    <>
      <PageHead
        title={job.title}
        subtitle={`#${String(job.id).padStart(4, "0")} · ${job.job_type ?? "intervention"} · créée le ${new Date(job.created_at).toLocaleDateString("fr-FR")}`}
        action={
          <div className="flex items-center gap-2.5">
            <Link
              href={`/jobs/${job.id}/edit`}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text hover:bg-surface-alt"
            >
              Modifier
            </Link>
            <StatusBadge status={job.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 border-b border-border pb-2 text-[13px] font-bold">Détails</h2>
          <div className="mb-4 rounded-md border border-border bg-surface p-5 shadow-sm">
            <dl className="grid grid-cols-[140px_1fr] gap-y-2 gap-x-3 text-sm">
              <dt className="text-text-soft">Priorité</dt>
              <dd><PriorityTag priority={job.priority} /></dd>
              <dt className="text-text-soft">Créneau</dt>
              <dd className="font-mono">{fmt(job.window_start)} → {fmt(job.window_end)}</dd>
              <dt className="text-text-soft">Durée estimée</dt>
              <dd>{job.duration_minutes ? `${job.duration_minutes} min` : "—"}</dd>
              <dt className="text-text-soft">Compétences requises</dt>
              <dd>{job.required_skills.length ? job.required_skills.map((s) => s.name).join(", ") : "—"}</dd>
              <dt className="text-text-soft">Description</dt>
              <dd>{job.description ?? "—"}</dd>
            </dl>
          </div>

          <h2 className="mb-3 border-b border-border pb-2 text-[13px] font-bold">Workflow</h2>
          <div className="mb-4 rounded-md border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {job.status === "scheduled" && (
                <form action={boundStart}>
                  <button className="rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110">
                    Démarrer l&apos;intervention
                  </button>
                </form>
              )}
              {job.status === "in_progress" && (
                <form action={boundClose} className="flex items-center gap-2">
                  <input name="closing_comment" placeholder="Commentaire de clôture" className={inputClass + " w-56"} />
                  <button className="rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110">
                    Clôturer
                  </button>
                </form>
              )}
              {job.status !== "done" && job.status !== "cancelled" && (
                <form action={boundCancel}>
                  <button className="rounded-md border border-[#F8D3D3] bg-[#FEF2F2] px-3.5 py-2 text-sm font-semibold text-stop hover:bg-[#FEE2E2]">
                    Annuler l&apos;intervention
                  </button>
                </form>
              )}
              {(job.status === "done" || job.status === "cancelled") && (
                <span className="text-sm text-text-soft">Intervention clôturée — aucune action disponible.</span>
              )}
            </div>
            {job.closing_comment && (
              <p className="mt-3 text-sm"><strong>Compte-rendu de clôture :</strong> {job.closing_comment}</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 border-b border-border pb-2 text-[13px] font-bold">Affectation</h2>
          <div className="mb-4 rounded-md border border-border bg-surface p-5 shadow-sm">
            <form action={boundAssign} className="space-y-2">
              <label className="block text-xs font-medium text-text-soft">Ressource affectée</label>
              <select name="resource_id" defaultValue={job.assigned_resource_id ?? ""} className={inputClass}>
                <option value="">— aucune —</option>
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.role})
                  </option>
                ))}
              </select>
              <button className="rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110">
                Mettre à jour
              </button>
            </form>
          </div>

          <h2 className="mb-3 border-b border-border pb-2 text-[13px] font-bold">Preuves terrain</h2>
          <div className="rounded-md border border-border bg-surface p-5 shadow-sm">
            <label className="block text-xs font-medium text-text-soft">Signature client</label>
            <form action={boundSignature} className="mt-1 flex items-center gap-2">
              <input type="file" name="file" accept="image/*" required className="text-sm" />
              <button className="rounded-md border border-accent bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110">
                Envoyer
              </button>
            </form>
            {job.signature_file && (
              <p className="mt-1.5 font-mono text-xs text-text-faint">Enregistrée : {job.signature_file}</p>
            )}

            <label className="mt-4 block text-xs font-medium text-text-soft">Photo avant/après</label>
            <form action={boundPhoto} className="mt-1 flex items-center gap-2">
              <input type="file" name="file" accept="image/*" required className="text-sm" />
              <button className="rounded-md border border-accent bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110">
                Ajouter
              </button>
            </form>
            {photos.length > 0 && (
              <p className="mt-1.5 font-mono text-xs text-text-faint">{photos.length} photo(s) : {photos.join(", ")}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
