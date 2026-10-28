"""Point d'entrée FastAPI — assemble les routers API (JSON) et UI (HTML).

Choix volontaire pour la v1 : `Base.metadata.create_all()` au démarrage plutôt
qu'un outil de migration (Alembic) — ça marche identiquement en SQLite et en
Postgres, sans étape d'installation supplémentaire, ce qui est le but même de
"plug and play". Un outil de migration a du sens dès que le schéma évolue en
production avec des données déjà en place — à ajouter si ce projet grandit."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import auth, customers, jobs, locations, resources, skills, teams, ui

app = FastAPI(
    title="FieldForge",
    description="Référentiel field service management open source, standalone — "
    "sans dépendance à une plateforme ERP tierce.",
    version="0.1.0",
)

Base.metadata.create_all(bind=engine)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(locations.router)
app.include_router(resources.router)
app.include_router(skills.router)
app.include_router(teams.router)
app.include_router(jobs.router)
app.include_router(ui.router)


@app.get("/health")
def health():
    return {"status": "ok"}
