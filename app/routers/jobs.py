import json
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Job, JobStatus, Resource, Skill
from app.schemas import JobAssign, JobClose, JobIn, JobOut
from app.security import get_current_username

router = APIRouter(prefix="/api/jobs", tags=["jobs"], dependencies=[Depends(get_current_username)])
settings = get_settings()


def _apply_required_skills(db: Session, job: Job, skill_ids: list[int]) -> None:
    job.required_skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all() if skill_ids else []


@router.get("", response_model=list[JobOut])
def list_jobs(status_filter: JobStatus | None = None, db: Session = Depends(get_db)):
    query = db.query(Job)
    if status_filter:
        query = query.filter(Job.status == status_filter)
    return query.order_by(Job.created_at.desc()).all()


@router.post("", response_model=JobOut, status_code=201)
def create_job(payload: JobIn, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"required_skill_ids"})
    job = Job(**data)
    db.add(job)
    db.flush()
    _apply_required_skills(db, job, payload.required_skill_ids)
    db.commit()
    db.refresh(job)
    return job


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    return job


@router.put("/{job_id}", response_model=JobOut)
def update_job(job_id: int, payload: JobIn, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    data = payload.model_dump(exclude={"required_skill_ids"})
    for key, value in data.items():
        setattr(job, key, value)
    _apply_required_skills(db, job, payload.required_skill_ids)
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    db.delete(job)
    db.commit()


@router.post("/{job_id}/assign", response_model=JobOut)
def assign_job(job_id: int, payload: JobAssign, db: Session = Depends(get_db)):
    """Affecte (ou désaffecte si resource_id=None) une ressource à l'intervention.
    Fait passer le statut à 'scheduled' dès qu'une ressource est affectée (sauf si
    déjà en cours/terminé/annulé — on ne rétrograde jamais un job avancé)."""
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")

    if payload.resource_id is not None:
        resource = db.get(Resource, payload.resource_id)
        if not resource:
            raise HTTPException(404, "Ressource introuvable")
        job.assigned_resource_id = resource.id
        if job.status == JobStatus.draft:
            job.status = JobStatus.scheduled
    else:
        job.assigned_resource_id = None
        if job.status == JobStatus.scheduled:
            job.status = JobStatus.draft

    db.commit()
    db.refresh(job)
    return job


@router.post("/{job_id}/start", response_model=JobOut)
def start_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    if not job.assigned_resource_id:
        raise HTTPException(400, "Impossible de démarrer : aucune ressource affectée")
    job.status = JobStatus.in_progress
    db.commit()
    db.refresh(job)
    return job


@router.post("/{job_id}/close", response_model=JobOut)
def close_job(job_id: int, payload: JobClose, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    job.status = JobStatus.done
    job.closing_comment = payload.closing_comment
    job.closed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(job)
    return job


@router.post("/{job_id}/cancel", response_model=JobOut)
def cancel_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    job.status = JobStatus.cancelled
    db.commit()
    db.refresh(job)
    return job


def _save_upload(upload: UploadFile) -> str:
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = os.path.splitext(upload.filename or "")[1] or ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest = os.path.join(settings.upload_dir, filename)
    with open(dest, "wb") as f:
        f.write(upload.file.read())
    return filename


@router.post("/{job_id}/signature", response_model=JobOut)
def upload_signature(job_id: int, file: UploadFile, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    job.signature_file = _save_upload(file)
    db.commit()
    db.refresh(job)
    return job


@router.post("/{job_id}/photos", response_model=JobOut)
def upload_photo(job_id: int, file: UploadFile, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Intervention introuvable")
    filename = _save_upload(file)
    existing = json.loads(job.photo_files) if job.photo_files else []
    existing.append(filename)
    job.photo_files = json.dumps(existing)
    db.commit()
    db.refresh(job)
    return job
