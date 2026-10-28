"use server";

import { revalidatePath } from "next/cache";
import { assignJob, cancelJob, closeJob, startJob, uploadPhoto, uploadSignature } from "@/lib/api";

export async function assignAction(jobId: number, formData: FormData) {
  const resourceId = formData.get("resource_id");
  await assignJob(jobId, resourceId && String(resourceId) ? Number(resourceId) : null);
  revalidatePath(`/jobs/${jobId}`);
}

export async function startAction(jobId: number) {
  await startJob(jobId);
  revalidatePath(`/jobs/${jobId}`);
}

export async function closeAction(jobId: number, formData: FormData) {
  await closeJob(jobId, String(formData.get("closing_comment") ?? ""));
  revalidatePath(`/jobs/${jobId}`);
}

export async function cancelAction(jobId: number) {
  await cancelJob(jobId);
  revalidatePath(`/jobs/${jobId}`);
}

export async function signatureAction(jobId: number, formData: FormData) {
  await uploadSignature(jobId, formData);
  revalidatePath(`/jobs/${jobId}`);
}

export async function photoAction(jobId: number, formData: FormData) {
  await uploadPhoto(jobId, formData);
  revalidatePath(`/jobs/${jobId}`);
}
