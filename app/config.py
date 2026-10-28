"""Configuration centrale — tout vient de variables d'environnement, rien en dur.

But : zéro dépendance à une plateforme externe (pas d'Odoo, pas de Frappe). Cette
appli tourne seule, avec sa propre base de données, son propre modèle, son propre
serveur web — "plug and play" au sens strict : `docker compose up` et c'est en
ligne, ou `uvicorn app.main:app` en local avec juste Python + les deps du
requirements.txt.
"""

import os
from functools import lru_cache

from dotenv import load_dotenv

# Charge .env s'il existe (exécution locale sans Docker) — docker-compose, lui,
# injecte déjà les variables d'environnement directement, donc load_dotenv() n'a
# simplement rien à faire dans ce cas (fichier absent dans le conteneur).
load_dotenv()


class Settings:
    # Base de données : SQLite par défaut (zéro config pour essayer en local),
    # remplacée par Postgres en production via docker-compose (voir .env.example).
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./fieldforge.db")

    # Secret JWT — DOIT être changé en production (voir .env.example). Pas de valeur
    # par défaut "sûre" : si absente, on en génère une aléatoire au démarrage pour que
    # l'appli ne tourne jamais avec un secret public connu, mais ça invalide les
    # sessions à chaque redémarrage — mets un vrai secret dans .env pour la prod.
    jwt_secret: str = os.getenv("JWT_SECRET") or os.urandom(32).hex()
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

    # Compte admin initial, créé par scripts/seed_demo_data.py s'il n'existe pas déjà.
    admin_username: str = os.getenv("ADMIN_USERNAME", "admin")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "changeme")

    upload_dir: str = os.getenv("UPLOAD_DIR", "app/static/uploads")


@lru_cache
def get_settings() -> Settings:
    return Settings()
