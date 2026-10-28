export type JobStatus = "draft" | "scheduled" | "in_progress" | "done" | "cancelled";
export type JobPriority = "low" | "normal" | "high" | "urgent";

export interface Skill {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface Location {
  id: number;
  label: string;
  address_line: string;
  city: string | null;
  postal_code: string | null;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  customer_id: number | null;
}

export interface Resource {
  id: number;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  vehicle_label: string | null;
  active: boolean;
  team_id: number | null;
  skills: Skill[];
}

export interface Job {
  id: number;
  title: string;
  description: string | null;
  job_type: string | null;
  status: JobStatus;
  priority: JobPriority;
  duration_minutes: number | null;
  window_start: string | null;
  window_end: string | null;
  customer_id: number | null;
  location_id: number | null;
  assigned_resource_id: number | null;
  closing_comment: string | null;
  signature_file: string | null;
  photo_files: string | null;
  created_at: string;
  closed_at: string | null;
  required_skills: Skill[];
}
