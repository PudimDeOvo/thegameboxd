from fastapi import APIRouter, Depends, Query, HTTPException
from http import HTTPStatus
from fastapi import UploadFile, File

from app.schemas.user import (
    UserSchemaPublic,
    UserSchemaList,
    UserSchema,       
    UserSchemaUpdate,
    UserPictureUrls
)
from app.schemas.common import Message, FilterPage 

from app.dependencies import (
    UserServiceDep,
    CurrentUser,
    AdminUser,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    '/', 
    status_code=HTTPStatus.CREATED, 
    response_model=UserSchemaPublic, 
)

async def criar_usuario(user_schema: UserSchema, service: UserServiceDep):
    """Cria um novo usuário."""
    return await service.create_new_user(user_schema)

@router.get('/me', response_model=UserSchemaPublic)
async def ler_usuario_atual(current_user: CurrentUser):
    """Retorna os dados do usuário logado."""
    return current_user

@router.get('/todos', response_model=UserSchemaList)
async def ler_todos_usuarios(
    service: UserServiceDep,
    #admin: AdminUser,
    filter_params: FilterPage = Depends(FilterPage), 
    username: str | None = Query(None, description="Filtrar por nome de usuário"),
    email: str | None = Query(None, description="Filtrar por email"),
):
    """Lê a lista de usuários com paginação e filtros """
    
    return await service.get_all_users(
        offset=filter_params.offset, 
        limit=filter_params.limit,
        username=username,
        email=email
    )


@router.patch('/atualizar/{user_id}', response_model=UserSchemaPublic)
async def atualizar_usuario(
    user_id: int,
    user_schema: UserSchemaUpdate,
    service: UserServiceDep,
    current_user: CurrentUser,
):
    """Atualiza parcialmente um usuário."""
    return await service.update_existing_user(
        user_id=user_id, user_schema=user_schema, current_user=current_user
    )

@router.delete('/deletar/{user_id}', response_model=Message)
async def deletar_usuario(
    user_id: int,
    service: UserServiceDep,
    current_user: CurrentUser
):
    """Deleta um usuário."""
    message_dict = await service.delete_existing_user(
        user_id=user_id, 
        current_user=current_user
    )
    return message_dict

@router.post('/promover/{user_id}', response_model=UserSchemaPublic)
async def promover_usuario(
    user_id: int,
    service: UserServiceDep,
    #admin: AdminUser, 
):
    """Promove um usuário para admin"""
    user = await service.promote_user_to_admin(user_id=user_id)
    return user

@router.post('/rebaixar/{user_id}', response_model=UserSchemaPublic)
async def rebaixar_usuario(
    user_id: int,
    service: UserServiceDep,
    admin: AdminUser, 
):
    """Rebaixa um usuário de admin (Admin)."""
    user = await service.demote_user_from_admin(user_id=user_id)
    return user

@router.patch("/me/upload-pictures")
async def upload_pictures(
    current_user: CurrentUser, 
    service: UserServiceDep,
    profile_pic: UploadFile = File(None, description="Foto de Perfil (Opcional)"),
    background_pic: UploadFile = File(None, description="Foto de Fundo (Opcional)"),
):
    """
    Permite ao usuário logado fazer upload da foto de perfil e/ou de fundo.
    Salva os arquivos localmente e os caminha no banco de dados.
    """
    if not (profile_pic or background_pic):
         raise HTTPException(status_code=400, detail="Nenhum arquivo enviado.")
         
    return await service.upload_user_pictures(
        user_id=current_user.id,
        profile_pic=profile_pic,
        background_pic=background_pic
    )

@router.get('/me/pictures', response_model=UserPictureUrls)
async def ler_urls_fotos(
    current_user: CurrentUser,
    service: UserServiceDep 
):
    """
    Retorna os URLs das fotos do perfil e de fundo do usuário logado
    """
    return await service.get_user_pictures_urls(current_user.id)

