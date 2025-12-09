"""
Arquivo central para Injeção de Dependências (DI) do FastAPI.

Define dependências reutilizáveis para sessões de DB, repositórios e serviços.
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.database.connection import get_session
from app.repositories.user import UserRepository
from app.services.auth import AuthService
from app.services.user import UserService 
from app.security.security import (
    get_current_user_from_refresh,
    get_current_user,
    get_admin_user 
)
from app.models.user import User


SessionDep = Annotated[AsyncSession, Depends(get_session)]

def get_user_repository(session: SessionDep) -> UserRepository:
    """Instancia o UserRepository com uma sessão."""
    return UserRepository(session)

UserRepoDep = Annotated[UserRepository, Depends(get_user_repository)]

def get_auth_service(repo: UserRepoDep) -> AuthService:
    """Instancia o AuthService com o UserRepository."""
    return AuthService(repo)

AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]

def get_user_service(repo: UserRepoDep) -> UserService:
    """Instancia o UserService com o UserRepository."""
    return UserService(repo)

UserServiceDep = Annotated[UserService, Depends(get_user_service)]



RefreshUser = Annotated[User, Depends(get_current_user_from_refresh)]


CurrentUser = Annotated[User, Depends(get_current_user)]

AdminUser = Annotated[User, Depends(get_admin_user)]