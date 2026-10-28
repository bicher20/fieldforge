"use server";

import { redirect } from "next/navigation";
import { apiLogin, ApiError } from "@/lib/api";
import { setSessionCookie } from "@/lib/session";

export async function loginAction(_prevState: { error: string | null }, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const { access_token } = await apiLogin(username, password);
    await setSessionCookie(access_token);
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: err.status === 401 ? "Identifiants invalides." : "Erreur serveur, réessaie." };
    }
    return { error: "Impossible de joindre l'API FieldForge." };
  }
  redirect("/");
}
