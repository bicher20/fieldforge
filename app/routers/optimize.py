"""Optimisation de tournée via le Scheduler API Nomadia (self-service, optionnel).
FieldForge reste 100% fonctionnel sans cette intégration — voir app/services/nomadia.py."""

from datetime import datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Job
from app.security import get_current_username
from app.services import nomadia

router = APIRouter(prefix="/api/optimize", tags=["optimize"], dependencies=[Depends(get_current_username)])


class OptimizeRequest(BaseModel):
    date: str | None = None  # YYYY-MM-DD ; défaut : aujourd'hui


class ApplyAllocation(BaseModel):
    job_id: int
    resource_id: int
    start_date_time: str


class ApplyRequest(BaseModel):
    allocations: list[ApplyAllocation]


@router.get("/status")
def status():
    return {"configured": nomadia.is_configured(), "base_url": nomadia.settings.nomadia_base_url}


@router.post("/schedule")
def optimize_schedule(payload: OptimizeRequest, db: Session = Depends(get_db)):
    if not nomadia.is_configured():
        raise HTTPException(503, "Intégration Nomadia non configurée (NOMADIA_API_KEY absente).")

    day = datetime.strptime(payload.date, "%Y-%m-%d").date() if payload.date else datetime.utcnow().date()
    day_start = datetime.combine(day, time(7, 0))
    day_end = datetime.combine(day, time(19, 0)) + timedelta(hours=0)

    request_payload = nomadia.build_schedule_payload(db, day_start, day_end)
    if not request_payload["jobs"]:
        return {
            "result": None,
            "sent_jobs": 0,
            "message": "Aucune intervention éligible (brouillon/planifiée, avec site géolocalisé) sur cette journée.",
        }

    try:
        result = nomadia.call_schedule(request_payload)
    except nomadia.NomadiaApiError as exc:
        raise HTTPException(502, f"Erreur Nomadia ({exc.status_code}) : {exc.body[:300]}") from exc

    return {"result": result, "sent_jobs": len(request_payload["jobs"]), "sent_resources": len(request_payload["resources"])}


@router.post("/apply")
def apply_allocations(payload: ApplyRequest, db: Session = Depends(get_db)):
    """Applique une proposition d'optimisation : affecte la ressource et le créneau
    proposés à chaque job. Volontairement séparé de /schedule — on ne modifie jamais
    les interventions sans confirmation explicite côté UI."""
    updated = 0
    for alloc in payload.allocations:
        job = db.get(Job, alloc.job_id)
        if not job:
            continue
        job.assigned_resource_id = alloc.resource_id
        job.window_start = datetime.fromisoformat(alloc.start_date_time)
        if job.status.value == "draft":
            from app.models import JobStatus

            job.status = JobStatus.scheduled
        updated += 1
    db.commit()
    return {"updated": updated}
