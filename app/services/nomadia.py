"""Intégration optionnelle avec le Scheduler API Nomadia (environnement self-service
réel — https://scheduler-api-test.nomadia-app.com, doc https://scheduler-json-api.readme.io).

Construit un payload conforme au schéma self-service RÉEL (vérifié par test, pas le
PDF "offre complète" qui décrit des champs silencieusement ignorés par cette clé :
job_resources, parts, pre_requisite_definitions, schedule_definition, *_pattern,
appointment_priority — voir la doc du skill fsm-api-copilote). N'envoie donc que les
cinq entités racine réellement supportées : jobs, resource_types, resources,
locations, job_types.
"""

from __future__ import annotations

from datetime import datetime, timedelta

import httpx
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import Job, JobStatus, Resource

settings = get_settings()

DEPOT_ID = "DEPOT"
DEFAULT_RESOURCE_TYPE = "DEFAULT"


class NomadiaNotConfigured(Exception):
    """Levée quand NOMADIA_API_KEY est vide — l'appelant doit désactiver la fonction."""


class NomadiaApiError(Exception):
    def __init__(self, status_code: int, body: str):
        super().__init__(f"Nomadia API {status_code}: {body[:500]}")
        self.status_code = status_code
        self.body = body


def is_configured() -> bool:
    return bool(settings.nomadia_api_key)


def _iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S")


def build_schedule_payload(db: Session, day_start: datetime, day_end: datetime) -> dict:
    """Construit le payload /api/schedule pour les interventions non terminées ayant
    une fenêtre dans [day_start, day_end] et un site géolocalisé, et les ressources
    actives disponibles sur ce créneau."""

    jobs = (
        db.query(Job)
        .filter(Job.status.in_([JobStatus.draft, JobStatus.scheduled]))
        .filter(Job.location_id.isnot(None))
        .all()
    )
    resources = db.query(Resource).filter(Resource.active == True).all()  # noqa: E712

    locations_by_id: dict[str, dict] = {}
    job_entries = []
    for job in jobs:
        loc = job.location
        if loc is None or loc.latitude is None or loc.longitude is None:
            continue  # le solveur a besoin de coordonnées réelles — on ignore silencieusement
        loc_id = f"LOC-{loc.id}"
        locations_by_id.setdefault(loc_id, {"id": loc_id, "latitude": loc.latitude, "longitude": loc.longitude})

        earliest = job.window_start or day_start
        latest = job.window_end or (job.window_start + timedelta(hours=2) if job.window_start else day_end)

        entry: dict = {
            "id": f"JOB-{job.id}",
            "job_type_id": "DEFAULT",
            "location_id": loc_id,
            "sla": {
                "earliest_start_date_time": _iso(earliest),
                "latest_start_date_time": _iso(latest),
                "base_jeopardy_penalty": 500,
            },
            # Toujours explicite : la doc confirme qu'il n'y a pas de défaut fiable côté
            # self-service (voir entities.md) — un job urgent doit peser plus lourd.
            "value_per_hour": {"low": 500, "normal": 1000, "high": 5000, "urgent": 20000}.get(
                job.priority.value, 1000
            ),
            "requirements": [s.name for s in job.required_skills] if job.required_skills else [],
        }
        if job.duration_minutes:
            entry["custom_duration"] = f"PT{job.duration_minutes}M"
        if job.assigned_resource_id:
            entry["fixed_resource_id"] = f"RES-{job.assigned_resource_id}"
        job_entries.append(entry)

    resource_entries = []
    for res in resources:
        resource_entries.append(
            {
                "id": f"RES-{res.id}",
                "resource_type_id": DEFAULT_RESOURCE_TYPE,
                "requirements": [s.name for s in res.skills] if res.skills else [],
                "shifts": [
                    {
                        "start_date_time": _iso(day_start),
                        "end_date_time": _iso(day_end),
                    }
                ],
            }
        )

    locations_by_id[DEPOT_ID] = locations_by_id.get(DEPOT_ID) or {
        # Dépôt générique — faute d'adresse d'agence connue, centré sur la première
        # location réelle pour que les trajets calculés restent cohérents.
        "id": DEPOT_ID,
        "latitude": next(iter(locations_by_id.values()))["latitude"] if locations_by_id else 0.0,
        "longitude": next(iter(locations_by_id.values()))["longitude"] if locations_by_id else 0.0,
    }

    return {
        "jobs": job_entries,
        "resource_types": [
            {
                "id": DEFAULT_RESOURCE_TYPE,
                "start_location_id": DEPOT_ID,
                "end_location_id": DEPOT_ID,
            }
        ],
        "resources": resource_entries,
        "locations": list(locations_by_id.values()),
    }


def call_schedule(payload: dict) -> dict:
    if not is_configured():
        raise NomadiaNotConfigured()
    url = f"{settings.nomadia_base_url}/api/schedule"
    try:
        resp = httpx.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json", "x-api-key": settings.nomadia_api_key},
            timeout=30,
        )
    except httpx.HTTPError as exc:
        raise NomadiaApiError(0, str(exc)) from exc
    if resp.status_code != 200:
        raise NomadiaApiError(resp.status_code, resp.text)
    return resp.json()
