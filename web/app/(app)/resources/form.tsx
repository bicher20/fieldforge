"use client";

import { useActionState } from "react";
import { createResourceAction } from "./actions";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import type { Skill, Team } from "@/lib/types";

export function NewResourceForm({ teams, skills }: { teams: Team[]; skills: Skill[] }) {
  const [state, formAction, pending] = useActionState(createResourceAction, { error: null as string | null });

  return (
    <div className="max-w-xl rounded-md border border-border bg-surface p-5 shadow-sm">
      {state.error && <p className="mb-3 text-sm text-stop">{state.error}</p>}
      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom"><input name="name" required className={inputClass} /></Field>
          <Field label="Rôle"><input name="role" defaultValue="technician" className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone"><input name="phone" className={inputClass} /></Field>
          <Field label="Email"><input name="email" type="email" className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Véhicule"><input name="vehicle_label" className={inputClass} /></Field>
          <Field label="Équipe">
            <select name="team_id" defaultValue="" className={inputClass}>
              <option value="">—</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Compétences">
          <select name="skill_ids" multiple size={5} className={inputClass}>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <PrimaryButton type="submit" disabled={pending}>{pending ? "Ajout…" : "Ajouter la ressource"}</PrimaryButton>
      </form>
    </div>
  );
}
