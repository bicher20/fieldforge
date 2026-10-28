"use client";

import { useActionState } from "react";
import { createJobAction } from "./actions";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import type { Customer, Location, Skill } from "@/lib/types";

export function NewJobForm({
  customers,
  locations,
  skills,
}: {
  customers: Customer[];
  locations: Location[];
  skills: Skill[];
}) {
  const [state, formAction, pending] = useActionState(createJobAction, { error: null as string | null });

  return (
    <div className="max-w-xl rounded-md border border-border bg-surface p-5 shadow-sm">
      {state.error && (
        <p className="mb-4 rounded-md border border-[#F8D3D3] bg-[#FEF2F2] px-3 py-2 text-sm text-stop">
          {state.error}
        </p>
      )}
      <form action={formAction} className="space-y-3.5">
        <Field label="Titre">
          <input name="title" required placeholder="ex: Remplacement vanne — Riad Atlas" className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea name="description" rows={3} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type d'intervention">
            <input name="job_type" placeholder="maintenance, installation…" className={inputClass} />
          </Field>
          <Field label="Priorité">
            <select name="priority" defaultValue="normal" className={inputClass}>
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </Field>
        </div>
        <Field label="Durée estimée (minutes)">
          <input name="duration_minutes" type="number" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Début de créneau">
            <input name="window_start" type="datetime-local" className={inputClass} />
          </Field>
          <Field label="Fin de créneau">
            <input name="window_end" type="datetime-local" className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client">
            <select name="customer_id" className={inputClass} defaultValue="">
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Site">
            <select name="location_id" className={inputClass} defaultValue="">
              <option value="">—</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Compétences requises">
          <select name="required_skill_ids" multiple size={5} className={inputClass}>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <PrimaryButton type="submit" disabled={pending} className="mt-1">
          {pending ? "Création…" : "Créer l'intervention"}
        </PrimaryButton>
      </form>
    </div>
  );
}
