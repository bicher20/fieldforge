import "server-only";
import { getToken } from "@/lib/session";
import type { Customer, Job, Location, Resource, Skill, Team } from "@/lib/types";

const API_BASE = process.env.FIELDFORGE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.status === 401 ? "Identifiants invalides" : res.statusText);
  }
  return (await res.json()) as { access_token: string; token_type: string };
}

// --- Jobs ---------------------------------------------------------------

export const listJobs = (statusFilter?: string) =>
  request<Job[]>(`/api/jobs${statusFilter ? `?status_filter=${statusFilter}` : ""}`);
export const getJob = (id: number) => request<Job>(`/api/jobs/${id}`);
export const createJob = (payload: Record<string, unknown>) =>
  request<Job>("/api/jobs", { method: "POST", body: JSON.stringify(payload) });
export const updateJob = (id: number, payload: Record<string, unknown>) =>
  request<Job>(`/api/jobs/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const assignJob = (id: number, resourceId: number | null) =>
  request<Job>(`/api/jobs/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ resource_id: resourceId }),
  });
export const startJob = (id: number) => request<Job>(`/api/jobs/${id}/start`, { method: "POST" });
export const closeJob = (id: number, closingComment: string) =>
  request<Job>(`/api/jobs/${id}/close`, {
    method: "POST",
    body: JSON.stringify({ closing_comment: closingComment }),
  });
export const cancelJob = (id: number) => request<Job>(`/api/jobs/${id}/cancel`, { method: "POST" });
export const uploadSignature = (id: number, form: FormData) =>
  request<Job>(`/api/jobs/${id}/signature`, { method: "POST", body: form });
export const uploadPhoto = (id: number, form: FormData) =>
  request<Job>(`/api/jobs/${id}/photos`, { method: "POST", body: form });

// --- Référentiel ----------------------------------------------------------

export const listResources = () => request<Resource[]>("/api/resources");
export const getResource = (id: number) => request<Resource>(`/api/resources/${id}`);
export const createResource = (payload: Record<string, unknown>) =>
  request<Resource>("/api/resources", { method: "POST", body: JSON.stringify(payload) });
export const updateResource = (id: number, payload: Record<string, unknown>) =>
  request<Resource>(`/api/resources/${id}`, { method: "PUT", body: JSON.stringify(payload) });

export const listCustomers = () => request<Customer[]>("/api/customers");
export const createCustomer = (payload: Record<string, unknown>) =>
  request<Customer>("/api/customers", { method: "POST", body: JSON.stringify(payload) });

export const listLocations = () => request<Location[]>("/api/locations");
export const createLocation = (payload: Record<string, unknown>) =>
  request<Location>("/api/locations", { method: "POST", body: JSON.stringify(payload) });

export const listSkills = () => request<Skill[]>("/api/skills");
export const createSkill = (name: string) =>
  request<Skill>("/api/skills", { method: "POST", body: JSON.stringify({ name }) });

export const listTeams = () => request<Team[]>("/api/teams");
export const createTeam = (name: string) =>
  request<Team>("/api/teams", { method: "POST", body: JSON.stringify({ name }) });

// --- Optimisation de tournée (Nomadia, optionnel) --------------------------

export interface OptimizeAllocation {
  job_id: number;
  resource_id: number;
  start_date_time: string;
}

export interface OptimizeResponse {
  result: {
    allocations: { job_id: string; visits: { resource_id: string; start_date_time: string; end_date_time: string }[] }[];
    unallocated_job_reasons?: { job_id: string; unallocated_reason: string }[];
  } | null;
  sent_jobs: number;
  sent_resources?: number;
  message?: string;
}

export const optimizeStatus = () => request<{ configured: boolean; base_url: string }>("/api/optimize/status");
export const runOptimize = (date?: string) =>
  request<OptimizeResponse>("/api/optimize/schedule", { method: "POST", body: JSON.stringify({ date: date ?? null }) });
export const applyOptimize = (allocations: OptimizeAllocation[]) =>
  request<{ updated: number }>("/api/optimize/apply", { method: "POST", body: JSON.stringify({ allocations }) });
