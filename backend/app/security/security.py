from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from http import HTTPStatus
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from app.models.user import User
from app.database.connection import get_session
from app.core.settings import Settings
from pwdlib import PasswordHash

from app.repositories.user import UserRepository

settings = Settings()
pwd_context = PasswordHash.recommended()

OAuth2_scheme = OAuth2PasswordBearer(
    tokenUrl="auth/token", refreshUrl="auth/refresh"
)

CREDENTIAL_EXCEPTION = HTTPException(
    status_code=HTTPStatus.UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_token(data: dict, expires_delta: timedelta, token_type: str):
    to_encode = data.copy()
    expire = datetime.now(tz=ZoneInfo("UTC")) + expires_delta

    to_encode.update({
        "exp": expire, 
        "type": token_type
    })
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(data: dict):
    return create_token(
        data, timedelta(minutes=settings.ACCES_TOKEN_EXPIRE_MINUTES), "access"
    )


def create_refresh_token(data: dict):
    return create_token(
        data, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS), "refresh"
    )


async def _get_current_user_base(
    token: str,
    expected_type: str,
    session: AsyncSession,
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
    except JWTError:
        raise CREDENTIAL_EXCEPTION

    token_type = payload.get("type")
    if token_type != expected_type:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail=f"Invalid token type: expected '{expected_type}'",
        )

    subject_id_str = payload.get("sub")
    if not subject_id_str:
        raise CREDENTIAL_EXCEPTION
    
    try:
        subject_id = int(subject_id_str)
    except ValueError:
        raise CREDENTIAL_EXCEPTION

    repo = UserRepository(session)
    
    user = await repo.get_by_id(subject_id)

    if not user:
        raise CREDENTIAL_EXCEPTION

    return user 

async def get_current_user(
    token: str = Security(OAuth2_scheme),
    session: AsyncSession = Depends(get_session)
):
    return await _get_current_user_base(token, "access", session)

async def get_current_user_from_refresh(
    token: str = Security(OAuth2_scheme),
    session: AsyncSession = Depends(get_session),
):
    return await _get_current_user_base(token, "refresh", session)

async def get_admin_user(
    current_user: User = Security(get_current_user)
) -> User:
    
    if not current_user.admin:
        raise HTTPException(
            status_code=HTTPStatus.FORBIDDEN,
            detail="Not enough permissions: Admin access required"
        )
    return current_user

def create_verification_token(data: dict) -> str:
    
    expires_delta = timedelta(hours=1)
    
    return create_token(
        data, expires_delta=expires_delta, token_type="verify_email"
    )

def create_password_reset_token(data: dict) -> str:
    
    expires_delta = timedelta(minutes=15)
    
    return create_token(
        data, expires_delta=expires_delta, token_type="reset_password"
    )
