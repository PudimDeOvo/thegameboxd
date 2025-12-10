from pydantic import BaseModel, Field
from datetime import date
from enum import Enum 

class GenrePublic(BaseModel):
    id_genero: int
    nome_genero: str
    class Config: from_attributes = True

class PlatformPublic(BaseModel):
    id_plataforma: int
    nome: str
    class Config: from_attributes = True

class JogoPlataformaPublic(BaseModel):
    data_lancamento: date | None = None
    plataforma: PlatformPublic
    class Config: from_attributes = True

class CompanyPublic(BaseModel):
    id_empresa: int
    nome: str
    pais_origem: str | None = None
    mercado_principal: str | None = None
    data_fundacao: date | None = None
    class Config: from_attributes = True

class DLCPublic(BaseModel):
    nome_dlc: str
    descricao: str | None = None
    class Config: from_attributes = True

class GameDetailsPublic(BaseModel):
    id_jogo: int
    titulo: str
    descricao: str | None = None
    nota_metacritic: int | None = None
    desenvolvedora: CompanyPublic | None = None
    publicadora: CompanyPublic | None = None
    id_igdb: int | None = None
    cover_url: str | None = Field(default=None, validation_alias="capa_url")
    nota_usuario: float | None = None  
    media_geral: float | None = None  
    generos: list[GenrePublic] = []
    dlcs: list[DLCPublic] = []
    plataformas_associacao: list[JogoPlataformaPublic] = [] 
    class Config:
        from_attributes = True

class IGDBGameResult(BaseModel):
    id: int
    name: str
    summary: str | None = None
    cover_url: str | None = None
    screenshots: list[str] = [] 
    videos: list[str] = []     
    genres: list[str] = []
    metacritic_rating: float | None
    developer: str | None = None
    publisher: str | None = None

class IGDBGameList(BaseModel):
    results: list[IGDBGameResult]

class WatchlistCreate(BaseModel):
    nome: str 

class WatchlistGameItem(BaseModel):
    status_jogo: str
    jogo: GameDetailsPublic
    class Config:
        from_attributes = True

class WatchlistPublic(BaseModel):
    id_watchlist: int
    id_user: int
    nome: str | None = None
    jogos: list[WatchlistGameItem] = Field(default=[], validation_alias="jogos_associacao")
    class Config:
        from_attributes = True

class WatchlistPublic2(BaseModel):
    id_watchlist: int
    id_user: int
    nome: str | None = None 
    class Config:
        from_attributes = True

class AddGameToWatchlist(BaseModel):
    igdb_game_id: int

class GameStatus(str, Enum):
    JOGADO = "JOGADO"
    AINDA_NAO_JOGADO = "AINDA NAO JOGADO"
    DROPADO = "DROPADO"

class UpdateGameStatus(BaseModel):
    new_status: GameStatus = Field(..., description="Novo status do jogo na watchlist.")

    