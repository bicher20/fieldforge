"use client";

import { useActionState } from "react";
import { updateResourceAction } from "./actions";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import type { Resource, Skill, Team } from "@/lib/types";

export function EditResourceForm({ resource, teams, skills }: { resource: Resource; teams: Team[]; skills: Skill[] }) {
  const action = updateResourceAction.bind(null, resource.id);
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });
  const skillIds = new Set(resource.skills.map((s) => s.id));

  return (
    <div className="max-w-xl rounded-md border border-border bg-surface p-5 shadow-sm">
      {state.error && <p className="mb-3 text-sm text-stop">{state.error}</p>}
      <form action={formAction} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom"><input name="name" required defaultValue={resource.name} className={inputClass} /></Field>
          <Field label="Rôle"><input name="role" defaultValue={resource.role} className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Téléphone"><input name="phone" defaultValue={resource.phone ?? ""} className={inputClass} /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={resource.email ?? ""} className={inputClass} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Véhicule"><input name="vehicle_label" defaultValue={resource.vehicle_label ?? ""} className={inputClass} /></Field>
          <Field label="Équipe">
            <select name="team_id" defaultValue={resource.team_id ?? ""} className={inputClass}>
              <option value="">—</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Compétences">
          <select name="skill_ids" multiple size={5} defaultValue={[...skillIds].map(String)} className={inputClass}>
            {skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={resource.active} className="h-4 w-4" />
          Ressource active
        </label>
        <PrimaryButton type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer les modifications"}</PrimaryButton>
      </form>
    </div>
  );
}
