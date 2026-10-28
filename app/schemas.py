"""Schémas Pydantic pour l'API JSON (séparés du modèle ORM pour ne jamais exposer de
champ interne par accident)."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models import JobPriority, JobStatus


class SkillIn(BaseModel):
    name: str


class SkillOut(SkillIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class TeamIn(BaseModel):
    name: str


class TeamOut(TeamIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ResourceIn(BaseModel):
    name: str
    role: str = "technician"
    phone: str | None = None
    email: str | None = None
    vehicle_label: str | None = None
    active: bool = True
    team_id: int | None = None
    skill_ids: list[int] = []


class ResourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    role: str
    phone: str | None
    email: str | None
    vehicle_label: str | None
    active: bool
    team_id: int | None
    skills: list[SkillOut] = []


class CustomerIn(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    notes: str | None = None


class CustomerOut(CustomerIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class LocationIn(BaseModel):
    label: str
    address_line: str
    city: str | None = None
    postal_code: str | None = None
    zone: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    customer_id: int | None = None


class LocationOut(LocationIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class JobIn(BaseModel):
    title: str
    description: str | None = None
    job_type: str | None = None
    priority: JobPriority = JobPriority.normal
    duration_minutes: int | None = None
    window_start: datetime | None = None
    window_end: datetime | None = None
    customer_id: int | None = None
    location_id: int | None = None
    required_skill_ids: list[int] = []


class JobAssign(BaseModel):
    resource_id: int | None = None  # None = désassigner


class JobClose(BaseModel):
    closing_comment: str | None = None


class JobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str | None
    job_type: str | None
    status: JobStatus
    priority: JobPriority
    duration_minutes: int | None
    window_start: datetime | None
    window_end: datetime | None
    customer_id: int | None
    location_id: int | None
    assigned_resource_id: int | None
    closing_comment: str | None
    signature_file: str | None
    photo_files: str | None
    created_at: datetime
    closed_at: datetime | None
    required_skills: list[SkillOut] = []


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
