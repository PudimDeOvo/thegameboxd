from fastapi import HTTPException
from http import HTTPStatus
from fastapi.security import OAuth2PasswordRequestForm

from app.repositories.user import UserRepository
from app.models.user import User
from app.security.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
)

LOGIN_EXCEPTION = HTTPException(
    status_code=HTTPStatus.UNAUTHORIZED,
    detail='Incorrect email or password',
)

INACTIVE_EXCEPTION = HTTPException(
    status_code=HTTPStatus.FORBIDDEN,
    detail="Account not activated. Please check your email for the verification link."
)

class AuthService:
    def __init__(
            self,
            repository: UserRepository,
        ):
            self.repository = repository

    async def login(self, form_data: OAuth2PasswordRequestForm) -> tuple[str, str]:
        """validar e gerar tokens"""
        
        user = await self.repository.get_by_email(email=form_data.username)

        if not user:
            raise LOGIN_EXCEPTION

        if not verify_password(form_data.password, user.password):
            raise LOGIN_EXCEPTION
        
        subject = str(user.id)
        
        access_token = create_access_token(data={'sub': subject})
        refresh_token = create_refresh_token(data={'sub': subject})

        return access_token, refresh_token

    def refresh_user_token(self, user: User) -> str:
        """
        Gera um novo access token para um usuário já validado
        """
        subject = str(user.id)
        new_access_token = create_access_token(data={'sub': subject})
        return new_access_token
    
