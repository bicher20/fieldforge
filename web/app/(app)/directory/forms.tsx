"use client";

import { useActionState } from "react";
import {
  createCustomerAction,
  createLocationAction,
  createSkillAction,
  createTeamAction,
} from "./actions";
import { inputClass } from "@/components/ui";
import type { Customer } from "@/lib/types";

const initialState = { error: null as string | null };

function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="mb-3 text-sm text-stop">{error}</p>;
}

export function NewCustomerForm() {
  const [state, formAction, pending] = useActionState(createCustomerAction, initialState);
  return (
    <form action={formAction} className="mb-6 rounded-md border border-border bg-surface p-4 shadow-sm">
      <ErrorNote error={state.error} />
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-1 block text-xs text-text-soft">Nom</span><input name="name" required className={inputClass} /></label>
        <label className="block"><span className="mb-1 block text-xs text-text-soft">Téléphone</span><input name="phone" className={inputClass} /></label>
      </div>
      <label className="mt-3 block"><span className="mb-1 block text-xs text-text-soft">Email</span><input name="email" type="email" className={inputClass} /></label>
      <button disabled={pending} className="mt-3 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
        {pending ? "Ajout…" : "Ajouter un client"}
      </button>
    </form>
  );
}

export function NewLocationForm({ customers }: { customers: Customer[] }) {
  const [state, formAction, pending] = useActionState(createLocationAction, initialState);
  return (
    <form action={formAction} className="mb-6 rounded-md border border-border bg-surface p-4 shadow-sm">
      <ErrorNote error={state.error} />
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-1 block text-xs text-text-soft">Libellé</span><input name="label" required className={inputClass} /></label>
        <label className="block"><span className="mb-1 block text-xs text-text-soft">Adresse</span><input name="address_line" required className={inputClass} /></label>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <label className="block"><span className="mb-1 block text-xs text-text-soft">Ville</span><input name="city" className={inputClass} /></label>
        <label className="block"><span className="mb-1 block text-xs text-text-soft">Code postal</span><input name="postal_code" className={inputClass} /></label>
        <label className="block"><span className="mb-1 block text-xs text-text-soft">Zone</span><input name="zone" className={inputClass} /></label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-text-soft">Latitude</span>
          <input name="latitude" type="number" step="any" placeholder="ex: 31.6295" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-text-soft">Longitude</span>
          <input name="longitude" type="number" step="any" placeholder="ex: -7.9811" className={inputClass} />
        </label>
      </div>
      <p className="mt-1.5 text-[0.78rem] text-text-faint">
        Nécessaire pour l&apos;optimisation de tournée (Nomadia) — un site sans coordonnées est ignoré par le calcul.
      </p>
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-text-soft">Client</span>
        <select name="customer_id" defaultValue="" className={inputClass}>
          <option value="">—</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>
      <button disabled={pending} className="mt-3 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
        {pending ? "Ajout…" : "Ajouter un site"}
      </button>
    </form>
  );
}

export function NewSkillForm() {
  const [state, formAction, pending] = useActionState(createSkillAction, initialState);
  return (
    <form action={formAction} className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <ErrorNote error={state.error} />
      <div className="flex gap-2">
        <input name="name" required placeholder="Nom de la compétence" className={inputClass} />
        <button disabled={pending} className="flex-shrink-0 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
          {pending ? "…" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}

export function NewTeamForm() {
  const [state, formAction, pending] = useActionState(createTeamAction, initialState);
  return (
    <form action={formAction} className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <ErrorNote error={state.error} />
      <div className="flex gap-2">
        <input name="name" required placeholder="Nom de l'équipe" className={inputClass} />
        <button disabled={pending} className="flex-shrink-0 rounded-md border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60">
          {pending ? "…" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}
