# FieldForge

Référentiel open source de gestion d'interventions terrain (field service
management) — **standalone**, sans dépendance à une plateforme ERP tierce
(pas d'Odoo, pas de Frappe/ERPNext, pas de SAP). Un backend FastAPI + Postgres,
une UI d'administration rendue serveur, et c'est tout : `docker compose up` et
c'est en ligne.

Code écrit from scratch. Les concepts métier (job, ressource, site, créneau,
compétence) sont du vocabulaire générique du secteur field service — aucune
ligne de code n'a été reprise d'un projet tiers.

## Ce que ça fait

- **Jobs/interventions** : création, priorité, créneau, compétences requises,
  cycle de vie complet (brouillon → planifiée → en cours → clôturée/annulée).
- **Ressources** : techniciens/chauffeurs/équipes, compétences, véhicule.
- **Dispatch** : affectation d'une ressource à une intervention, tableau de
  bord par statut.
- **Preuves terrain** : upload de signature client et de photos par
  intervention.
- **Annuaire** : clients, sites d'intervention, compétences, équipes.
- **API REST** complète et documentée automatiquement (`/docs`), en plus de
  l'UI web.
- **Auth** simple par compte admin (JWT), partagée entre l'UI et l'API.

## Ce que ça ne fait volontairement PAS (pour l'instant)

- Pas de moteur d'optimisation de tournées (multi-stop routing, contraintes
  de capacité, etc.) — ce n'est pas l'objectif de ce projet de référence, et
  ce serait un travail à part entière.
- Pas de notifications SMS/email, pas de suivi GPS temps réel, pas
  d'application mobile native.
- Pas de multi-société/multi-tenant.

C'est un squelette solide et honnête, pas une promesse de couvrir tous les cas
d'un vrai FSM commercial.

## Démarrage rapide (local, sans Docker)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # puis édite .env (ou laisse les valeurs de dev)
python scripts/seed_demo_data.py --demo
uvicorn app.main:app --reload
```

Puis ouvre http://localhost:8000 — identifiants de démo : `admin` / la valeur
de `ADMIN_PASSWORD` dans `.env` (par défaut `change-me`, à changer avant toute
exposition publique).

## Tester sans rien installer (GitHub Codespaces)

Pas de droits administrateur sur ta machine, ou juste envie de tester vite ?
Sur la page du repo GitHub : **Code** → onglet **Codespaces** → **Create
codespace on main**. Ça ouvre un environnement Linux dans le navigateur, avec
Docker déjà configuré (voir `.devcontainer/`) — aucun droit admin local requis.
Gratuit dans la limite du quota mensuel de ton compte GitHub.

Une fois dans le terminal du Codespace :

```bash
nano .env   # ou ouvre .env directement dans l'éditeur VS Code du Codespace — remplis JWT_SECRET, ADMIN_PASSWORD, POSTGRES_PASSWORD
docker compose up -d --build
```

VS Code (dans le navigateur) détecte le port 8000 et propose de l'ouvrir —
clique sur la notification, ou va dans l'onglet **Ports** en bas.

## Déploiement sur un VPS (Docker)

```bash
git clone <ton-repo> fieldforge && cd fieldforge
cp .env.example .env
# édite .env : JWT_SECRET (génère-en un vrai), ADMIN_PASSWORD, POSTGRES_PASSWORD
docker compose up -d --build
```

L'appli écoute sur le port défini par `APP_PORT` (8000 par défaut). Mets un
reverse proxy (Caddy, Nginx, Traefik) devant pour le HTTPS si c'est exposé sur
Internet — ce projet ne gère pas TLS lui-même.

## Structure du projet

```
app/
  main.py          point d'entrée FastAPI
  models.py        modèle de données (SQLAlchemy)
  schemas.py        schémas API (Pydantic)
  security.py       auth (JWT + hash de mot de passe)
  routers/          API REST (JSON) + UI (HTML serveur)
  templates/        pages HTML (Jinja2)
  static/           CSS + fichiers uploadés
scripts/
  seed_demo_data.py création du compte admin + données de démo
```

## Licence

MIT — voir [LICENSE](LICENSE). Fais-en ce que tu veux.
