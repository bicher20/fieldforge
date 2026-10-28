"""UI d'administration — rendu serveur (Jinja2), zéro build JS, zéro dépendance
npm : exactement ce qu'il faut pour être "plug and play" sur un VPS nu. Les
interactions (assigner, démarrer, clôturer) passent par des formulaires HTML
classiques ; pas de SPA à maintenir."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Form, Request, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, Job, JobPriority, JobStatus, Location, Resource, Skill, Team
from app.security import (
    authenticate_admin,
    create_access_token,
    get_current_username_optional,
)
from app.routers.jobs import _save_upload
import json

router = APIRouter(tags=["ui"])
templates = Jinja2Templates(directory="app/templates")


def _require_login(request: Request) -> str | None:
    return get_current_username_optional(
        authorization=request.headers.get("authorization"),
        access_token=request.cookies.get("access_token"),
    )


@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse(request, "login.html", {"error": None})


@router.post("/login")
def login_submit(request: Request, username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = authenticate_admin(db, username, password)
    if not user:
        return templates.TemplateResponse(
            request, "login.html", {"error": "Identifiants invalides"}, status_code=401
        )
    token = create_access_token(user.username)
    response = RedirectResponse(url="/", status_code=303)
    response.set_cookie("access_token", token, httponly=True, max_age=60 * 60 * 8, samesite="lax")
    return response


@router.get("/logout")
def logout():
    response = RedirectResponse(url="/login", status_code=303)
    response.delete_cookie("access_token")
    return response


@router.get("/", response_class=HTMLResponse)
def dashboard(request: Request, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)

    counts = {s.value: db.query(Job).filter(Job.status == s).count() for s in JobStatus}
    unassigned = db.query(Job).filter(Job.assigned_resource_id.is_(None), Job.status == JobStatus.draft).count()
    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {"username": username, "counts": counts, "unassigned": unassigned},
    )


@router.get("/jobs", response_class=HTMLResponse)
def jobs_list(request: Request, status_filter: str | None = None, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)

    query = db.query(Job)
    if status_filter:
        query = query.filter(Job.status == status_filter)
    jobs = query.order_by(Job.created_at.desc()).all()
    resources = db.query(Resource).filter(Resource.active == True).order_by(Resource.name).all()  # noqa: E712
    return templates.TemplateResponse(
        request,
        "jobs_list.html",
        {"username": username, "jobs": jobs, "resources": resources, "statuses": list(JobStatus), "status_filter": status_filter},
    )


@router.get("/jobs/new", response_class=HTMLResponse)
def job_new_form(request: Request, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    return templates.TemplateResponse(
        request,
        "job_form.html",
        {
            "username": username,
            "customers": db.query(Customer).order_by(Customer.name).all(),
            "locations": db.query(Location).order_by(Location.label).all(),
            "skills": db.query(Skill).order_by(Skill.name).all(),
            "priorities": list(JobPriority),
        },
    )


@router.post("/jobs/new")
def job_new_submit(
    request: Request,
    title: str = Form(...),
    description: str = Form(""),
    job_type: str = Form(""),
    priority: str = Form("normal"),
    duration_minutes: str = Form(""),
    window_start: str = Form(""),
    window_end: str = Form(""),
    customer_id: str = Form(""),
    location_id: str = Form(""),
    required_skill_ids: list[str] = Form([]),
    db: Session = Depends(get_db),
):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)

    job = Job(
        title=title,
        description=description or None,
        job_type=job_type or None,
        priority=JobPriority(priority),
        duration_minutes=int(duration_minutes) if duration_minutes else None,
        window_start=datetime.fromisoformat(window_start) if window_start else None,
        window_end=datetime.fromisoformat(window_end) if window_end else None,
        customer_id=int(customer_id) if customer_id else None,
        location_id=int(location_id) if location_id else None,
    )
    db.add(job)
    db.flush()
    if required_skill_ids:
        job.required_skills = db.query(Skill).filter(Skill.id.in_([int(i) for i in required_skill_ids])).all()
    db.commit()
    return RedirectResponse(url=f"/jobs/{job.id}", status_code=303)


@router.get("/jobs/{job_id}", response_class=HTMLResponse)
def job_detail(request: Request, job_id: int, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    job = db.get(Job, job_id)
    resources = db.query(Resource).filter(Resource.active == True).order_by(Resource.name).all()  # noqa: E712
    photos = json.loads(job.photo_files) if job.photo_files else []
    return templates.TemplateResponse(
        request,
        "job_detail.html",
        {"username": username, "job": job, "resources": resources, "photos": photos},
    )


@router.post("/jobs/{job_id}/assign")
def job_assign_submit(request: Request, job_id: int, resource_id: str = Form(""), db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    job = db.get(Job, job_id)
    if resource_id:
        job.assigned_resource_id = int(resource_id)
        if job.status == JobStatus.draft:
            job.status = JobStatus.scheduled
    else:
        job.assigned_resource_id = None
        if job.status == JobStatus.scheduled:
            job.status = JobStatus.draft
    db.commit()
    return RedirectResponse(url=f"/jobs/{job_id}", status_code=303)


@router.post("/jobs/{job_id}/start")
def job_start_submit(request: Request, job_id: int, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    job = db.get(Job, job_id)
    if job.assigned_resource_id:
        job.status = JobStatus.in_progress
        db.commit()
    return RedirectResponse(url=f"/jobs/{job_id}", status_code=303)


@router.post("/jobs/{job_id}/close")
def job_close_submit(request: Request, job_id: int, closing_comment: str = Form(""), db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    job = db.get(Job, job_id)
    job.status = JobStatus.done
    job.closing_comment = closing_comment or None
    job.closed_at = datetime.now(timezone.utc)
    db.commit()
    return RedirectResponse(url=f"/jobs/{job_id}", status_code=303)


@router.post("/jobs/{job_id}/cancel")
def job_cancel_submit(request: Request, job_id: int, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    job = db.get(Job, job_id)
    job.status = JobStatus.cancelled
    db.commit()
    return RedirectResponse(url=f"/jobs/{job_id}", status_code=303)


@router.post("/jobs/{job_id}/signature")
def job_signature_submit(request: Request, job_id: int, file: UploadFile, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    job = db.get(Job, job_id)
    job.signature_file = _save_upload(file)
    db.commit()
    return RedirectResponse(url=f"/jobs/{job_id}", status_code=303)


@router.post("/jobs/{job_id}/photos")
def job_photo_submit(request: Request, job_id: int, file: UploadFile, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    job = db.get(Job, job_id)
    filename = _save_upload(file)
    existing = json.loads(job.photo_files) if job.photo_files else []
    existing.append(filename)
    job.photo_files = json.dumps(existing)
    db.commit()
    return RedirectResponse(url=f"/jobs/{job_id}", status_code=303)


@router.get("/dispatch", response_class=HTMLResponse)
def dispatch_board(request: Request, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    jobs = db.query(Job).order_by(Job.window_start.asc().nulls_last()).all()
    columns = {s: [j for j in jobs if j.status == s] for s in JobStatus}
    return templates.TemplateResponse(request, "dispatch_board.html", {"username": username, "columns": columns})


@router.get("/resources", response_class=HTMLResponse)
def resources_page(request: Request, db: Session = Depends(get_db)):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    return templates.TemplateResponse(
        request,
        "resources_list.html",
        {
            "username": username,
            "resources": db.query(Resource).order_by(Resource.name).all(),
            "teams": db.query(Team).order_by(Team.name).all(),
            "skills": db.query(Skill).order_by(Skill.name).all(),
        },
    )


@router.post("/resources/new")
def resource_new_submit(
    request: Request,
    name: str = Form(...),
    role: str = Form("technician"),
    phone: str = Form(""),
    email: str = Form(""),
    vehicle_label: str = Form(""),
    team_id: str = Form(""),
    skill_ids: list[str] = Form([]),
    db: Session = Depends(get_db),
):
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    resource = Resource(
        name=name,
        role=role,
        phone=phone or None,
        email=email or None,
        vehicle_label=vehicle_label or None,
        team_id=int(team_id) if team_id else None,
    )
    db.add(resource)
    db.flush()
    if skill_ids:
        resource.skills = db.query(Skill).filter(Skill.id.in_([int(i) for i in skill_ids])).all()
    db.commit()
    return RedirectResponse(url="/resources", status_code=303)


@router.get("/directory", response_class=HTMLResponse)
def directory_page(request: Request, db: Session = Depends(get_db)):
    """Page simple pour gérer clients / sites / compétences / équipes — le CRUD de
    base, volontairement minimal (créer + supprimer) pour rester lisible."""
    username = _require_login(request)
    if not username:
        return RedirectResponse(url="/login", status_code=303)
    return templates.TemplateResponse(
        request,
        "directory.html",
        {
            "username": username,
            "customers": db.query(Customer).order_by(Customer.name).all(),
            "locations": db.query(Location).order_by(Location.label).all(),
            "skills": db.query(Skill).order_by(Skill.name).all(),
            "teams": db.query(Team).order_by(Team.name).all(),
        },
    )


@router.post("/directory/customers/new")
def customer_new(request: Request, name: str = Form(...), phone: str = Form(""), email: str = Form(""), db: Session = Depends(get_db)):
    if not _require_login(request):
        return RedirectResponse(url="/login", status_code=303)
    db.add(Customer(name=name, phone=phone or None, email=email or None))
    db.commit()
    return RedirectResponse(url="/directory", status_code=303)


@router.post("/directory/locations/new")
def location_new(
    request: Request,
    label: str = Form(...),
    address_line: str = Form(...),
    city: str = Form(""),
    postal_code: str = Form(""),
    zone: str = Form(""),
    customer_id: str = Form(""),
    db: Session = Depends(get_db),
):
    if not _require_login(request):
        return RedirectResponse(url="/login", status_code=303)
    db.add(
        Location(
            label=label,
            address_line=address_line,
            city=city or None,
            postal_code=postal_code or None,
            zone=zone or None,
            customer_id=int(customer_id) if customer_id else None,
        )
    )
    db.commit()
    return RedirectResponse(url="/directory", status_code=303)


@router.post("/directory/skills/new")
def skill_new(request: Request, name: str = Form(...), db: Session = Depends(get_db)):
    if not _require_login(request):
        return RedirectResponse(url="/login", status_code=303)
    db.add(Skill(name=name))
    db.commit()
    return RedirectResponse(url="/directory", status_code=303)


@router.post("/directory/teams/new")
def team_new(request: Request, name: str = Form(...), db: Session = Depends(get_db)):
    if not _require_login(request):
        return RedirectResponse(url="/login", status_code=303)
    db.add(Team(name=name))
    db.commit()
    return RedirectResponse(url="/directory", status_code=303)
