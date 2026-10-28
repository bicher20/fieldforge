"use server";

import { redirect } from "next/navigation";
import { createJob } from "@/lib/api";

export async function createJobAction(_prevState: { error: string | null }, formData: FormData) {
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

  let job;
  try {
    job = await createJob(payload);
  } catch {
    return { error: "Impossible de créer l'intervention — vérifie les champs." };
  }
  redirect(`/jobs/${job.id}`);
}
