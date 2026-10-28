"use server";

import { revalidatePath } from "next/cache";
import { createCustomer, createLocation, createSkill, createTeam } from "@/lib/api";

export async function createCustomerAction(formData: FormData) {
  await createCustomer({
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
  });
  revalidatePath("/directory");
}

export async function createLocationAction(formData: FormData) {
  const customerId = String(formData.get("customer_id") ?? "");
  await createLocation({
    label: String(formData.get("label") ?? ""),
    address_line: String(formData.get("address_line") ?? ""),
    city: String(formData.get("city") ?? "") || null,
    postal_code: String(formData.get("postal_code") ?? "") || null,
    zone: String(formData.get("zone") ?? "") || null,
    customer_id: customerId ? Number(customerId) : null,
  });
  revalidatePath("/directory");
}

export async function createSkillAction(formData: FormData) {
  await createSkill(String(formData.get("name") ?? ""));
  revalidatePath("/directory");
}

export async function createTeamAction(formData: FormData) {
  await createTeam(String(formData.get("name") ?? ""));
  revalidatePath("/directory");
}
