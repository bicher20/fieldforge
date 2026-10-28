from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Team
from app.schemas import TeamIn, TeamOut
from app.security import get_current_username

router = APIRouter(prefix="/api/teams", tags=["teams"], dependencies=[Depends(get_current_username)])


@router.get("", response_model=list[TeamOut])
def list_teams(db: Session = Depends(get_db)):
    return db.query(Team).order_by(Team.name).all()


@router.post("", response_model=TeamOut, status_code=201)
def create_team(payload: TeamIn, db: Session = Depends(get_db)):
    team = Team(name=payload.name)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.delete("/{team_id}", status_code=204)
def delete_team(team_id: int, db: Session = Depends(get_db)):
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(404, "Équipe introuvable")
    db.delete(team)
    db.commit()
