"use server";

import { revalidatePath } from "next/cache";
import { createResource } from "@/lib/api";

export async function createResourceAction(_prevState: { error: string | null }, formData: FormData) {
  const skillIds = formData.getAll("skill_ids").map(Number).filter(Boolean);
  const teamId = String(formData.get("team_id") ?? "");

  const payload = {
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? "technician"),
    phone: String(formData.get("phone") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    vehicle_label: String(formData.get("vehicle_label") ?? "") || null,
    team_id: teamId ? Number(teamId) : null,
    skill_ids: skillIds,
  };

  try {
    await createResource(payload);
  } catch {
    return { error: "Impossible d'ajouter la ressource." };
  }
  revalidatePath("/resources");
  return { error: null };
}
