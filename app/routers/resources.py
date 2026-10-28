from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resource, Skill
from app.schemas import ResourceIn, ResourceOut
from app.security import get_current_username

router = APIRouter(prefix="/api/resources", tags=["resources"], dependencies=[Depends(get_current_username)])


def _apply_skills(db: Session, resource: Resource, skill_ids: list[int]) -> None:
    resource.skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all() if skill_ids else []


@router.get("", response_model=list[ResourceOut])
def list_resources(db: Session = Depends(get_db)):
    return db.query(Resource).order_by(Resource.name).all()


@router.post("", response_model=ResourceOut, status_code=201)
def create_resource(payload: ResourceIn, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"skill_ids"})
    resource = Resource(**data)
    db.add(resource)
    db.flush()
    _apply_skills(db, resource, payload.skill_ids)
    db.commit()
    db.refresh(resource)
    return resource


@router.get("/{resource_id}", response_model=ResourceOut)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(404, "Ressource introuvable")
    return resource


@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource(resource_id: int, payload: ResourceIn, db: Session = Depends(get_db)):
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(404, "Ressource introuvable")
    data = payload.model_dump(exclude={"skill_ids"})
    for key, value in data.items():
        setattr(resource, key, value)
    _apply_skills(db, resource, payload.skill_ids)
    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/{resource_id}", status_code=204)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.get(Resource, resource_id)
    if not resource:
        raise HTTPException(404, "Ressource introuvable")
    db.delete(resource)
    db.commit()
