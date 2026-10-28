"use client";

import { useActionState } from "react";
import { updateJobAction } from "./actions";
import { Field, inputClass, PrimaryButton } from "@/components/ui";
import type { Customer, Job, Location, Skill } from "@/lib/types";

function toLocalInput(dt: string | null) {
  if (!dt) return "";
  // datetime-local expects "YYYY-MM-DDTHH:mm" with no timezone/seconds.
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditJobForm({
  job,
  customers,
  locations,
  skills,
}: {
  job: Job;
  customers: Customer[];
  locations: Location[];
  skills: Skill[];
}) {
  const action = updateJobAction.bind(null, job.id);
  const [state, formAction, pending] = useActionState(action, { error: null as string | null });
  const requiredSkillIds = new Set(job.required_skills.map((s) => s.id));

  return (
    <div className="max-w-xl rounded-md border border-border bg-surface p-5 shadow-sm">
      {state.error && (
        <p className="mb-4 rounded-md border border-[#F8D3D3] bg-[#FEF2F2] px-3 py-2 text-sm text-stop">
          {state.error}
        </p>
      )}
      <form action={formAction} className="space-y-3.5">
        <Field label="Titre">
          <input name="title" required defaultValue={job.title} className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea name="description" rows={3} defaultValue={job.description ?? ""} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Type d'intervention">
            <input name="job_type" defaultValue={job.job_type ?? ""} className={inputClass} />
          </Field>
          <Field label="Priorité">
            <select name="priority" defaultValue={job.priority} className={inputClass}>
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </Field>
        </div>
        <Field label="Durée estimée (minutes)">
          <input name="duration_minutes" type="number" defaultValue={job.duration_minutes ?? ""} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Début de créneau">
            <input name="window_start" type="datetime-local" defaultValue={toLocalInput(job.window_start)} className={inputClass} />
          </Field>
          <Field label="Fin de créneau">
            <input name="window_end" type="datetime-local" defaultValue={toLocalInput(job.window_end)} className={inputClass} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client">
            <select name="customer_id" className={inputClass} defaultValue={job.customer_id ?? ""}>
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Site">
            <select name="location_id" className={inputClass} defaultValue={job.location_id ?? ""}>
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
          <select name="required_skill_ids" multiple size={5} defaultValue={[...requiredSkillIds].map(String)} className={inputClass}>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <PrimaryButton type="submit" disabled={pending} className="mt-1">
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
        </PrimaryButton>
      </form>
    </div>
  );
}
