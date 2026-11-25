from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from sqlmodel import select

from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario

COOKIE_NAME = "access_token"


def get_current_user(request: Request) -> Usuario:
    """Lee la cookie HttpOnly, valida firma y expiración y carga el usuario."""
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado"
    )
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credentials_error
    payload = decode_access_token(token)
    username = payload.get("sub") if payload else None
    if not isinstance(username, str):
        raise credentials_error
    with session_factory() as session:
        user = session.exec(select(Usuario).where(Usuario.username == username)).first()
        if user is None:
            raise credentials_error
        session.expunge(user)  
        return user


def get_current_active_user(user: Usuario = Depends(get_current_user)) -> Usuario:
    if user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return user


def require_role(roles: list[str]) -> Callable[[Usuario], Usuario]:
    def checker(user: Usuario = Depends(get_current_active_user)) -> Usuario:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permisos para esta acción")
        return user

    return checker
