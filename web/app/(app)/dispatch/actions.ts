"use server";

import { revalidatePath } from "next/cache";
import { applyOptimize, ApiError, type OptimizeAllocation, runOptimize } from "@/lib/api";

export async function optimizeAction(date?: string): Promise<{
  error: string | null;
  message: string | null;
  sentJobs: number;
  allocations: OptimizeAllocation[];
  unallocated: { job_id: string; unallocated_reason: string }[];
  resourceByRef: Record<string, number>;
}> {
  try {
    const res = await runOptimize(date);
    if (!res.result) {
      return {
        error: null,
        message: res.message ?? "Aucune intervention éligible.",
        sentJobs: 0,
        allocations: [],
        unallocated: [],
        resourceByRef: {},
      };
    }
    const allocations: OptimizeAllocation[] = [];
    for (const a of res.result.allocations) {
      const jobId = Number(a.job_id.replace("JOB-", ""));
      for (const visit of a.visits) {
        allocations.push({
          job_id: jobId,
          resource_id: Number(visit.resource_id.replace("RES-", "")),
          start_date_time: visit.start_date_time,
        });
      }
    }
    return {
      error: null,
      message: null,
      sentJobs: res.sent_jobs,
      allocations,
      unallocated: res.result.unallocated_job_reasons ?? [],
      resourceByRef: {},
    };
  } catch (err) {
    const msg = err instanceof ApiError ? err.message : "Erreur d'appel à l'API d'optimisation.";
    return { error: msg, message: null, sentJobs: 0, allocations: [], unallocated: [], resourceByRef: {} };
  }
}

export async function applyOptimizeAction(allocations: OptimizeAllocation[]) {
  await applyOptimize(allocations);
  revalidatePath("/dispatch");
  revalidatePath("/jobs");
  revalidatePath("/");
}
