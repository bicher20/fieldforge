"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getResource, updateResource } from "@/lib/api";

export async function updateResourceAction(
  resourceId: number,
  _prevState: { error: string | null },
  formData: FormData,
) {
  const skillIds = formData.getAll("skill_ids").map(Number).filter(Boolean);
  const teamId = String(formData.get("team_id") ?? "");

  const payload = {
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? "technician"),
    phone: String(formData.get("phone") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    vehicle_label: String(formData.get("vehicle_label") ?? "") || null,
    active: formData.get("active") === "on",
    team_id: teamId ? Number(teamId) : null,
    skill_ids: skillIds,
  };

  try {
    await updateResource(resourceId, payload);
  } catch {
    return { error: "Impossible de mettre à jour la ressource." };
  }
  redirect("/resources");
}

export async function toggleResourceActiveAction(resourceId: number) {
  const resource = await getResource(resourceId);
  await updateResource(resourceId, {
    name: resource.name,
    role: resource.role,
    phone: resource.phone,
    email: resource.email,
    vehicle_label: resource.vehicle_label,
    active: !resource.active,
    team_id: resource.team_id,
    skill_ids: resource.skills.map((s) => s.id),
  });
  revalidatePath("/resources");
}
