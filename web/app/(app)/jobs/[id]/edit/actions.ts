"use server";

import { redirect } from "next/navigation";
import { updateJob } from "@/lib/api";

export async function updateJobAction(
  jobId: number,
  _prevState: { error: string | null },
  formData: FormData,
) {
  const toInt = (v: FormDataEntryValue | null) => (v && String(v).trim() ? Number(v) : null);
  const skillIds = formData.getAll("required_skill_ids").map(Number).filter(Boolean);

  const payload = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    job_type: String(formData.get("job_type") ?? "") || null,
    priority: String(formData.get("priority") ?? "normal"),
    duration_minutes: toInt(formData.get("duration_minutes")),
    window_start: String(formData.get("window_start") ?? "") || null,
    window_end: String(formData.get("window_end") ?? "") || null,
    customer_id: toInt(formData.get("customer_id")),
    location_id: toInt(formData.get("location_id")),
    required_skill_ids: skillIds,
  };

  try {
    await updateJob(jobId, payload);
  } catch {
    return { error: "Impossible de mettre à jour l'intervention — vérifie les champs." };
  }
  redirect(`/jobs/${jobId}`);
}
