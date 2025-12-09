from fastapi import APIRouter, Depends, HTTPException, Query
from http import HTTPStatus
from app.dependencies import SessionDep, CurrentUser
from app.services.watchlist import WatchlistService
from app.repositories.watchlist import WatchlistRepository
from app.services.igdb_client import IGDBClient
from app.schemas.watchlist import IGDBGameList, WatchlistPublic, AddGameToWatchlist, WatchlistPublic2
from app.schemas.review import ReviewCreate, ReviewPublic, ReviewList
from app.repositories.review import ReviewRepository
from app.services.review import ReviewService
from app.schemas.watchlist import (
    IGDBGameList, IGDBGameResult, WatchlistPublic, AddGameToWatchlist, WatchlistCreate
)
from app.schemas.review import MyReviewPublic, GameRankingPublic
from app.schemas.watchlist import UpdateGameStatus

IGDB_CLIENT_ID = "wsv3svrgvvr70488d7x2qqbzv13432"
IGDB_CLIENT_SECRET = "n2de8w4urryjkwzikm7rbov1xglrne"

def get_watchlist_service(session: SessionDep):
    repo = WatchlistRepository(session)
    client = IGDBClient(IGDB_CLIENT_ID, IGDB_CLIENT_SECRET)
    return WatchlistService(repo, client)

def get_review_service(session: SessionDep):
    """Cria e injeta dependências no ReviewService."""
    r_repo = ReviewRepository(session)
    w_repo = WatchlistRepository(session)
    return ReviewService(r_repo, w_repo)

router = APIRouter(prefix="/watchlists", tags=["watchlists"])

@router.get("/pesquisar-jogos-igdb", response_model=IGDBGameList)
async def pesquisar_games(
    query: str,
    page: int = Query(1, ge=1, description="Número da página (começa em 1)"),
    limit: int = Query(20, ge=1, le=50, description="Itens por página"),
    service: WatchlistService = Depends(get_watchlist_service),
    #current_user: CurrentUser = None 
):
    """
    Busca jogos na API externa do IGDB com paginação.
    """
    offset = (page - 1) * limit
    
    results = await service.search_games_igdb(query, limit=limit, offset=offset)
    return {"results": results}

@router.get("/pesquisar-jogo-id-igdb/{igdb_game_id}", response_model=IGDBGameResult)
async def pesquisar_game_id(
    igdb_game_id: int,
    service: WatchlistService = Depends(get_watchlist_service),
    #current_user: CurrentUser = None
):
    """
    Retorna os detalhes de um jogo específico direto do IGDB 
    """
    return await service.get_igdb_game_details(igdb_game_id)

@router.post("/criar-watchlist/", response_model=WatchlistPublic)
async def criar_watchlist(
    watchlist_data: WatchlistCreate, 
    current_user: CurrentUser, 
    service: WatchlistService = Depends(get_watchlist_service),
):
    """Cria uma nova watchlist com nome"""

    return await service.create_watchlist(user_id=current_user.id, nome=watchlist_data.nome)

@router.get("/minhas-watchlists-ids", response_model=list[WatchlistPublic2])
async def ler_minhas_watchlists_ids(
    current_user: CurrentUser, 
    service: WatchlistService = Depends(get_watchlist_service),
):
    """Lista todas as watchlists"""
    return await service.get_user_watchlists(current_user.id)

@router.get("/minhas-reviews", response_model=list[MyReviewPublic])
async def ler_minhas_reviews(
    current_user: CurrentUser,
    service: ReviewService = Depends(get_review_service)
):
    """
    Lista todas as avaliações feitas pelo usuário logado
    """
    return await service.get_my_reviews(current_user.id)



@router.get("/todas-informacoes-watchlist/{watchlist_id}", response_model=WatchlistPublic)
async def ler_watchlist_todos_jogos(
    watchlist_id: int,
    current_user: CurrentUser,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """Retorna a watchlist completa com todos os jogos e detalhes."""
    watchlist = await service.get_watchlist_details(current_user.id, watchlist_id)
    if not watchlist:
        raise HTTPException(status_code=404, detail="Watchlist não encontrada")
    return watchlist

@router.post("/games/adicionar/{watchlist_id}", response_model=WatchlistPublic)
async def add_game_watchlist(
    watchlist_id: int,
    game_data: AddGameToWatchlist,
    current_user: CurrentUser,
    service: WatchlistService = Depends(get_watchlist_service),
):
    """Adiciona um jogo (vindo do IGDB) a uma watchlist específica."""
    return await service.add_igdb_game_to_watchlist(
        user_id=current_user.id,
        watchlist_id=watchlist_id,
        igdb_game_id=game_data.igdb_game_id
    )

@router.post("/games/reviews/{game_id}", response_model=ReviewPublic)
async def add_review(
    game_id: int,
    review_data: ReviewCreate,
    current_user: CurrentUser,
    service: ReviewService = Depends(get_review_service)
):
    """
    Adiciona uma avaliação para um jogo.
    """
    return await service.create_review(
        user_id=current_user.id,
        game_id=game_id,
        schema=review_data
    )

@router.get("/games/all-reviews/{game_id}", response_model=ReviewList)
async def ler_todas_reviews_game(
    game_id: int,
    service: ReviewService = Depends(get_review_service)
):
    """
    Lista todas as avaliações de um jogo específico. e a media das notas
    """
    return await service.get_game_reviews(game_id)

@router.delete("/games/{game_id}/reviews/{review_id}", status_code=HTTPStatus.OK)
async def delete_review(
    review_id: int,
    current_user: CurrentUser,
    service: ReviewService = Depends(get_review_service)
):
    """Deleta uma avaliação específica. Apenas o autor pode deletar."""
    return await service.delete_review(current_user.id, review_id)


@router.delete("/{watchlist_id}/games/{game_id}", status_code=HTTPStatus.OK)
async def remove_game(
    watchlist_id: int,
    game_id: int,
    current_user: CurrentUser,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """Remove um jogo específico de uma watchlist. Apenas o dono pode remover."""
    return await service.remove_game_from_watchlist(current_user.id, watchlist_id, game_id)


@router.delete("/{watchlist_id}", status_code=HTTPStatus.OK)
async def delete_watchlist(
    watchlist_id: int,
    current_user: CurrentUser,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """Deleta uma watchlist inteira. Apenas o dono pode deletar."""
    return await service.delete_watchlist(current_user.id, watchlist_id)

@router.post("/favoritos/adicionar-jogo", response_model=WatchlistPublic)
async def add_game_to_favorites(
    game_data: AddGameToWatchlist,
    current_user: CurrentUser,
    service: WatchlistService = Depends(get_watchlist_service),
):
    """
    Adiciona um jogo à watchlist 'Favoritos' do usuário logado.
    A lista é criada automaticamente se for a primeira vez.
    """
    return await service.add_game_to_favorites(
        user_id=current_user.id,
        igdb_game_id=game_data.igdb_game_id
    )

@router.delete("/favoritos/remover-jogo/{game_id}", status_code=HTTPStatus.OK)
async def remove_game_from_favorites(
    game_id: int,
    current_user: CurrentUser,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Remove um jogo específico da watchlist 'Favoritos' do usuário logado.
    """
    return await service.remove_game_from_favorites(current_user.id, game_id)

@router.patch("/{watchlist_id}/games/{game_id}/status", response_model=WatchlistPublic) 
async def update_game_playing_status(
    watchlist_id: int,
    game_id: int,
    status_update: UpdateGameStatus,
    current_user: CurrentUser,
    service: WatchlistService = Depends(get_watchlist_service)
):
    """
    Atualiza o status de um jogo (JOGADO, AINDA NAO JOGADO, DROPADO) 
    em uma watchlist específica.
    """
    return await service.update_game_status_in_watchlist(
        user_id=current_user.id,
        watchlist_id=watchlist_id,
        game_id=game_id,
        new_status=status_update.new_status.value
    )

@router.get("/games/por-genero/{genre_name}", response_model=IGDBGameList)
async def listar_games_por_genero(
    genre_name: str,
    page: int = Query(1, ge=1, description="Número da página"),
    limit: int = Query(20, ge=1, le=50, description="Itens por página"),
    service: WatchlistService = Depends(get_watchlist_service),
):
    """
    Retorna jogos famosos de um determinado gênero (ex: 'RPG', 'Platform' , 'adventure').
    A busca é feita diretamente no IGDB e ordenada por popularidade.
    """
    offset = (page - 1) * limit
    
    results = await service.get_popular_games_by_genre(genre_name, limit=limit, offset=offset)
    
    if not results and page == 1:
        raise HTTPException(status_code=404, detail="Nenhum jogo encontrado para este gênero.")
        
    return {"results": results}

@router.get("/ranking/top-melhores", response_model=list[GameRankingPublic])
async def obter_ranking_semanal(
    service: ReviewService = Depends(get_review_service)
):
    """
    Retorna os 10 jogos com a maior média de notas baseada 
    nas reviews dos usuários do sistema.
    """
    return await service.get_weekly_ranking()


@router.get("/games/ranking-global-igdb", response_model=IGDBGameList)
async def listar_ranking_global(
    page: int = Query(1, ge=1, description="Número da página"),
    limit: int = Query(20, ge=1, le=50, description="Itens por página"),
    service: WatchlistService = Depends(get_watchlist_service),
):
    """
    Retorna os jogos mais famosos de todos os tempos listados no IGDB.
    Ordenados por popularidade (total de reviews).
    """
    offset = (page - 1) * limit
    
    results = await service.get_top_games_global(limit=limit, offset=offset)
    
    return {"results": results}