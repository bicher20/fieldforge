"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { inputClass } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, { error: null as string | null });

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-bg bg-[length:28px_28px]"
      style={{
        backgroundImage:
          "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
      }}
    >
      <div className="w-full max-w-[340px] rounded-md border border-border border-t-[3px] border-t-accent bg-surface p-6 shadow-sm">
        <h1 className="mb-5 text-xl font-bold">
          Field<span className="text-accent">Forge</span>
        </h1>
        {state.error && (
          <p className="mb-4 rounded-md border border-[#F8D3D3] bg-[#FEF2F2] px-3 py-2 text-sm text-stop">
            {state.error}
          </p>
        )}
        <form action={formAction} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-soft">Utilisateur</span>
            <input name="username" required autoFocus className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-soft">Mot de passe</span>
            <input name="password" type="password" required className={inputClass} />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
