"""Modèle de données FieldForge — écrit from scratch, concepts métier génériques du
field service management (job, ressource, localisation, créneau, compétence) ; aucune
ligne ni structure copiée d'un ORM/framework tiers. Noms de champs volontairement
explicites en anglais pour rester un référentiel générique réutilisable."""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    Column,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class JobStatus(str, enum.Enum):
    draft = "draft"
    scheduled = "scheduled"
    in_progress = "in_progress"
    done = "done"
    cancelled = "cancelled"


class JobPriority(str, enum.Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"


# --- Tables d'association (many-to-many) ---------------------------------------

resource_skills = Table(
    "resource_skills",
    Base.metadata,
    Column("resource_id", ForeignKey("resources.id"), primary_key=True),
    Column("skill_id", ForeignKey("skills.id"), primary_key=True),
)

job_required_skills = Table(
    "job_required_skills",
    Base.metadata,
    Column("job_id", ForeignKey("jobs.id"), primary_key=True),
    Column("skill_id", ForeignKey("skills.id"), primary_key=True),
)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Skill(Base):
    """Compétence/habilitation/certification requise ou détenue."""

    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)

    resources = relationship("Resource", secondary=resource_skills, back_populates="skills")
    jobs = relationship("Job", secondary=job_required_skills, back_populates="required_skills")


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)

    resources = relationship("Resource", back_populates="team")


class Resource(Base):
    """Une ressource mobile : technicien, chauffeur, équipe, véhicule associé."""

    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    role: Mapped[str] = mapped_column(String(80), default="technician")
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(160), nullable=True)
    vehicle_label: Mapped[str | None] = mapped_column(String(80), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)

    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True)
    team = relationship("Team", back_populates="resources")

    skills = relationship("Skill", secondary=resource_skills, back_populates="resources")
    jobs = relationship("Job", back_populates="assigned_resource")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(160), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    locations = relationship("Location", back_populates="customer")
    jobs = relationship("Job", back_populates="customer")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Location(Base):
    """Un site/adresse d'intervention."""

    __tablename__ = "locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    label: Mapped[str] = mapped_column(String(160))
    address_line: Mapped[str] = mapped_column(String(255))
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    zone: Mapped[str | None] = mapped_column(String(80), nullable=True)
    latitude: Mapped[float | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(nullable=True)

    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer", back_populates="locations")

    jobs = relationship("Job", back_populates="location")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Job(Base):
    """Une intervention/visite à planifier et dispatcher."""

    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    job_type: Mapped[str | None] = mapped_column(String(80), nullable=True)

    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.draft, index=True)
    priority: Mapped[JobPriority] = mapped_column(Enum(JobPriority), default=JobPriority.normal)

    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    window_start: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    window_end: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id"), nullable=True)
    customer = relationship("Customer", back_populates="jobs")

    location_id: Mapped[int | None] = mapped_column(ForeignKey("locations.id"), nullable=True)
    location = relationship("Location", back_populates="jobs")

    assigned_resource_id: Mapped[int | None] = mapped_column(ForeignKey("resources.id"), nullable=True)
    assigned_resource = relationship("Resource", back_populates="jobs")

    required_skills = relationship("Skill", secondary=job_required_skills, back_populates="jobs")

    closing_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    signature_file: Mapped[str | None] = mapped_column(String(255), nullable=True)
    photo_files: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON list, simple et portable

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
