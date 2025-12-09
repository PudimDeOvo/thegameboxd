from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.token import Token, AccessToken


from app.dependencies import (
    AuthServiceDep,
    RefreshUser
)

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Rotas ---

@router.post(
    '/token', 
    response_model=Token
)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], 
    service: AuthServiceDep
):
    """Retorna um access token e um refresh token."""
    access_token, refresh_token = await service.login(form_data)
    return {
        'access_token': access_token, 
        'refresh_token': refresh_token,
        'token_type': 'Bearer'
    }

@router.post('/refresh_token', response_model=AccessToken)
async def refresh_access_token(
    current_user: RefreshUser,
    service: AuthServiceDep
):
    """Recebe um refresh token e retorna um novo access token."""
    new_access_token = service.refresh_user_token(current_user)
    return {
        'access_token': new_access_token, 
        'token_type': 'Bearer'
    }

