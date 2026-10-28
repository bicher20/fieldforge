"""Initialise le compte admin (depuis ADMIN_USERNAME/ADMIN_PASSWORD) et, en option,
quelques données de démo — pour pouvoir cliquer dans l'appli dès le premier
démarrage sans tout créer à la main.

Usage :
    python scripts/seed_demo_data.py            # admin seul
    python scripts/seed_demo_data.py --demo      # admin + jeu de données d'exemple
"""

import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, ".")

from app.config import get_settings  # noqa: E402
from app.database import Base, SessionLocal, engine  # noqa: E402
from app.models import AdminUser, Customer, Job, JobPriority, Location, Resource, Skill, Team  # noqa: E402
from app.security import hash_password  # noqa: E402

settings = get_settings()


def ensure_admin(db) -> None:
    existing = db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first()
    if existing:
        print(f"[seed] admin '{settings.admin_username}' existe déjà — rien à faire.")
        return
    db.add(AdminUser(username=settings.admin_username, hashed_password=hash_password(settings.admin_password)))
    db.commit()
    print(f"[seed] admin '{settings.admin_username}' créé.")


def seed_demo(db) -> None:
    if db.query(Customer).count() > 0:
        print("[seed] des données existent déjà — démo non rejouée.")
        return

    skill_elec = Skill(name="electricite")
    skill_froid = Skill(name="climatisation")
    team_nord = Team(name="Equipe Nord")
    db.add_all([skill_elec, skill_froid, team_nord])
    db.flush()

    tech1 = Resource(name="Yassine El Amrani", role="technician", team_id=team_nord.id, skills=[skill_elec])
    tech2 = Resource(name="Sara Benali", role="technician", team_id=team_nord.id, skills=[skill_froid])
    db.add_all([tech1, tech2])

    client = Customer(name="Riad Atlas SARL", phone="+212600000000")
    db.add(client)
    db.flush()

    site = Location(label="Siège Riad Atlas", address_line="12 Av. Mohammed VI", city="Marrakech", zone="Marrakech-Centre", customer_id=client.id)
    db.add(site)
    db.flush()

    now = datetime.now(timezone.utc)
    job = Job(
        title="Panne climatisation salle serveur",
        description="Climatisation en panne, température élevée signalée.",
        job_type="depannage",
        priority=JobPriority.urgent,
        duration_minutes=90,
        window_start=now + timedelta(hours=2),
        window_end=now + timedelta(hours=4),
        customer_id=client.id,
        location_id=site.id,
        required_skills=[skill_froid],
    )
    db.add(job)
    db.commit()
    print("[seed] données de démo créées (1 client, 1 site, 2 ressources, 1 intervention).")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        ensure_admin(db)
        if "--demo" in sys.argv:
            seed_demo(db)
    finally:
        db.close()
