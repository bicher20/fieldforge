from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Skill
from app.schemas import SkillIn, SkillOut
from app.security import get_current_username

router = APIRouter(prefix="/api/skills", tags=["skills"], dependencies=[Depends(get_current_username)])


@router.get("", response_model=list[SkillOut])
def list_skills(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.name).all()


@router.post("", response_model=SkillOut, status_code=201)
def create_skill(payload: SkillIn, db: Session = Depends(get_db)):
    skill = Skill(name=payload.name)
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@router.delete("/{skill_id}", status_code=204)
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.get(Skill, skill_id)
    if not skill:
        raise HTTPException(404, "Compétence introuvable")
    db.delete(skill)
    db.commit()
