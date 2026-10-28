// Session côté serveur uniquement : le JWT FieldForge vit dans un cookie
// httpOnly géré par Next.js (jamais lu depuis le JS client). Chaque appel
// serveur vers l'API FastAPI le relaie en header Authorization: Bearer.
import "server-only";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

const COOKIE_NAME = "ff_session";

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getUsername(): Promise<string | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const payload = decodeJwt(token) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}
