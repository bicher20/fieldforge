"use client";

import { useState, useTransition } from "react";
import { applyOptimizeAction, optimizeAction } from "./actions";
import type { Job, Resource } from "@/lib/types";

export function OptimizePanel({ jobsById, resourcesById, configured }: {
  jobsById: Map<number, Job>;
  resourcesById: Map<number, Resource>;
  configured: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [applying, startApplying] = useTransition();
  const [result, setResult] = useState<Awaited<ReturnType<typeof optimizeAction>> | null>(null);
  const [applied, setApplied] = useState(false);

  if (!configured) {
    return (
      <div className="mb-5 rounded-md border border-border bg-surface-alt px-4 py-3 text-sm text-text-soft">
        Optimisation de tournée (Scheduler API Nomadia) non configurée — ajoute <code className="font-mono">NOMADIA_API_KEY</code> dans <code className="font-mono">.env</code> pour l&apos;activer.
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-md border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Optimisation de tournée</div>
          <div className="text-[0.8rem] text-text-soft">
            Calcule l&apos;affectation et l&apos;ordre optimaux via le Scheduler API Nomadia pour les interventions non terminées du jour.
          </div>
        </div>
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setApplied(false);
              const r = await optimizeAction();
              setResult(r);
            })
          }
          className="flex-shrink-0 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Calcul en cours…" : "Optimiser la tournée"}
        </button>
      </div>

      {result && (
        <div className="mt-4 border-t border-border pt-4">
          {result.error && <p className="text-sm text-stop">{result.error}</p>}
          {!result.error && (
            <>
              <p className="mb-2 text-sm text-text-soft">
                {result.sentJobs} intervention(s) envoyée(s) · {result.allocations.length} affectation(s) proposée(s)
                {result.unallocated.length > 0 && ` · ${result.unallocated.length} non allouée(s)`}
              </p>
              <div className="space-y-1.5">
                {result.allocations.map((a, i) => {
                  const job = jobsById.get(a.job_id);
                  const resource = resourcesById.get(a.resource_id);
                  return (
                    <div key={i} className="flex items-center justify-between rounded border border-border bg-surface-alt px-3 py-1.5 text-sm">
                      <span className="font-medium">{job?.title ?? `Job #${a.job_id}`}</span>
                      <span className="font-mono text-xs text-text-soft">
                        → {resource?.name ?? a.resource_id} · {new Date(a.start_date_time).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
                {result.unallocated.map((u) => (
                  <div key={u.job_id} className="flex items-center justify-between rounded border border-[#F8D3D3] bg-[#FEF2F2] px-3 py-1.5 text-sm text-stop">
                    <span>{jobsById.get(Number(u.job_id.replace("JOB-", "")))?.title ?? u.job_id}</span>
                    <span className="font-mono text-xs">{u.unallocated_reason}</span>
                  </div>
                ))}
              </div>
              {result.allocations.length > 0 && !applied && (
                <button
                  disabled={applying}
                  onClick={() =>
                    startApplying(async () => {
                      await applyOptimizeAction(result.allocations);
                      setApplied(true);
                    })
                  }
                  className="mt-3 rounded-md border border-border-strong bg-surface px-3.5 py-2 text-sm font-semibold text-text hover:bg-surface-alt disabled:opacity-60"
                >
                  {applying ? "Application…" : "Appliquer cette proposition"}
                </button>
              )}
              {applied && <p className="mt-3 text-sm font-medium text-clear">Proposition appliquée — le dispatch est à jour.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
