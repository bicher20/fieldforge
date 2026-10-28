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
- **Frontend Next.js** (`web/`) : interface moderne (React Server Components,
  Server Actions) consommant l'API REST FastAPI via un pattern BFF — le JWT
  reste côté serveur dans un cookie httpOnly, jamais exposé au JS client.
- **Optimisation de tournée (optionnelle)** : bouton "Optimiser la tournée"
  sur le tableau de dispatch, qui appelle le Scheduler API self-service de
  Nomadia (https://scheduler-json-api.readme.io) pour calculer une proposition
  d'affectation. Désactivé par défaut — voir "Intégration Nomadia" ci-dessous.

## Ce que ça ne fait volontairement PAS (pour l'instant)

- Pas de moteur d'optimisation de tournées *maison* (c'est pour ça que
  l'intégration Nomadia ci-dessus est optionnelle et externe, pas une
  fonctionnalité réinventée).
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
exposition publique). (C'est l'ancienne UI serveur Jinja2 ; voir ci-dessous
pour lancer le frontend Next.js.)

### Frontend Next.js (`web/`)

```bash
cd web
npm install
FIELDFORGE_API_URL=http://localhost:8000 npm run dev
```

Puis ouvre http://localhost:3000 — mêmes identifiants que l'API ci-dessus.

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

L'appli FastAPI écoute sur le port défini par `APP_PORT` (8000 par défaut),
et le frontend Next.js sur `WEB_PORT` (3000 par défaut) — `docker compose up`
démarre les deux services (`app` et `web`) plus Postgres. Mets un reverse
proxy (Caddy, Nginx, Traefik) devant pour le HTTPS si c'est exposé sur
Internet — ce projet ne gère pas TLS lui-même.

## Intégration Nomadia (optimisation de tournée, optionnelle)

FieldForge peut déléguer le calcul d'une tournée optimisée au Scheduler API
**self-service** de Nomadia (documentation publique :
https://scheduler-json-api.readme.io) — un appel API tiers classique, pas une
reprise de schéma propriétaire.

Pour l'activer, renseigne dans `.env` :

```
NOMADIA_BASE_URL=https://scheduler-api-test.nomadia-app.com
NOMADIA_API_KEY=<ta clé self-service>
```

Tant que `NOMADIA_API_KEY` est vide, le bouton "Optimiser la tournée" reste
désactivé et FieldForge fonctionne normalement sans cette fonctionnalité —
aucune dépendance dure. L'intégration n'envoie que les champs du schéma
self-service documenté publiquement ; elle ne reproduit pas le schéma de
l'offre complète Nomadia (projet dédié, hors self-service).

## Structure du projet

```
app/
  main.py          point d'entrée FastAPI
  models.py        modèle de données (SQLAlchemy)
  schemas.py        schémas API (Pydantic)
  security.py       auth (JWT + hash de mot de passe)
  routers/          API REST (JSON) + UI (HTML serveur) + optimize.py (Nomadia)
  services/         nomadia.py — client du Scheduler API self-service
  templates/        pages HTML (Jinja2, ancienne UI — toujours fonctionnelle)
  static/           CSS + fichiers uploadés
scripts/
  seed_demo_data.py création du compte admin + données de démo
web/
  app/(app)/        pages Next.js protégées (dashboard, jobs, dispatch, …)
  app/login/        page de connexion
  lib/               client API (BFF) + session JWT (cookie httpOnly)
```

## Licence

MIT — voir [LICENSE](LICENSE). Fais-en ce que tu veux.
