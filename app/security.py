"""Auth maison, minimale et autonome : hash de mot de passe (passlib/bcrypt) + JWT
(python-jose). Un seul mécanisme sert à la fois l'UI (cookie httpOnly) et l'API
(header Authorization: Bearer) — pas deux systèmes à maintenir."""

from datetime import datetime, timedelta, timezone

from fastapi import Cookie, Depends, Header, HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import AdminUser

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)


def create_access_token(username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _decode(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload.get("sub")
    except JWTError:
        return None


def get_current_username(
    authorization: str | None = Header(default=None),
    access_token: str | None = Cookie(default=None),
) -> str:
    """Accepte le token soit en header Authorization (API), soit en cookie (UI web)."""
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif access_token:
        token = access_token

    username = _decode(token) if token else None
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Non authentifié")
    return username


def get_current_username_optional(
    authorization: str | None = Header(default=None),
    access_token: str | None = Cookie(default=None),
) -> str | None:
    """Comme get_current_username mais retourne None au lieu de 401 — pour les pages
    qui redirigent elles-mêmes vers /login plutôt que de renvoyer une erreur JSON."""
    token = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1]
    elif access_token:
        token = access_token
    return _decode(token) if token else None


def authenticate_admin(db: Session, username: str, password: str) -> AdminUser | None:
    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
