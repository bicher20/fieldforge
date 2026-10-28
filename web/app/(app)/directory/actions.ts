"use server";

import { revalidatePath } from "next/cache";
import { createCustomer, createLocation, createSkill, createTeam } from "@/lib/api";

type FormState = { error: string | null };

export async function createCustomerAction(_prevState: FormState, formData: FormData) {
  try {
    await createCustomer({
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
    });
  } catch {
    return { error: "Impossible d'ajouter le client — vérifie les champs." };
  }
  revalidatePath("/directory");
  return { error: null };
}

export async function createLocationAction(_prevState: FormState, formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "");
  const latitude = String(formData.get("latitude") ?? "").trim();
  const longitude = String(formData.get("longitude") ?? "").trim();
  try {
    await createLocation({
      label: String(formData.get("label") ?? ""),
      address_line: String(formData.get("address_line") ?? ""),
      city: String(formData.get("city") ?? "") || null,
      postal_code: String(formData.get("postal_code") ?? "") || null,
      zone: String(formData.get("zone") ?? "") || null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      customer_id: customerId ? Number(customerId) : null,
    });
  } catch {
    return { error: "Impossible d'ajouter le site — vérifie les champs." };
  }
  revalidatePath("/directory");
  return { error: null };
}

export async function createSkillAction(_prevState: FormState, formData: FormData) {
  try {
    await createSkill(String(formData.get("name") ?? ""));
  } catch {
    return { error: "Impossible d'ajouter la compétence." };
  }
  revalidatePath("/directory");
  return { error: null };
}

export async function createTeamAction(_prevState: FormState, formData: FormData) {
  try {
    await createTeam(String(formData.get("name") ?? ""));
  } catch {
    return { error: "Impossible d'ajouter l'équipe." };
  }
  revalidatePath("/directory");
  return { error: null };
}
