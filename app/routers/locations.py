from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Location
from app.schemas import LocationIn, LocationOut
from app.security import get_current_username

router = APIRouter(prefix="/api/locations", tags=["locations"], dependencies=[Depends(get_current_username)])


@router.get("", response_model=list[LocationOut])
def list_locations(db: Session = Depends(get_db)):
    return db.query(Location).order_by(Location.label).all()


@router.post("", response_model=LocationOut, status_code=201)
def create_location(payload: LocationIn, db: Session = Depends(get_db)):
    location = Location(**payload.model_dump())
    db.add(location)
    db.commit()
    db.refresh(location)
    return location


@router.get("/{location_id}", response_model=LocationOut)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(404, "Site introuvable")
    return location


@router.put("/{location_id}", response_model=LocationOut)
def update_location(location_id: int, payload: LocationIn, db: Session = Depends(get_db)):
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(404, "Site introuvable")
    for key, value in payload.model_dump().items():
        setattr(location, key, value)
    db.commit()
    db.refresh(location)
    return location


@router.delete("/{location_id}", status_code=204)
def delete_location(location_id: int, db: Session = Depends(get_db)):
    location = db.get(Location, location_id)
    if not location:
        raise HTTPException(404, "Site introuvable")
    db.delete(location)
    db.commit()
