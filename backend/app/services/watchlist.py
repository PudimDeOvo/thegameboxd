from datetime import datetime
from fastapi import HTTPException
from http import HTTPStatus

from app.repositories.watchlist import WatchlistRepository
from app.services.igdb_client import IGDBClient
from app.models.user import Watchlist, Jogo
from app.schemas.watchlist import IGDBGameResult


def resolve_country_and_market(country_id: int | None):
    if not country_id:
        return None, "Global"


    iso_map = {
        840: ("Estados Unidos", "EUA"),
        392: ("Japão", "Asia"),
        156: ("China", "Asia"),
        410: ("Coreia do Sul", "Asia"),
        826: ("Reino Unido", "Europa"),
        250: ("França", "Europa"),
        276: ("Alemanha", "Europa"),
        124: ("Canadá", "America do Norte"),
        752: ("Suécia", "Europa"),
        616: ("Polônia", "Europa"),
        76:  ("Brasil", "América do Sul")
    }

    if country_id in iso_map:
        return iso_map[country_id][0], iso_map[country_id][1]

    return "Desconhecido", "Global"

class WatchlistService:
    def __init__(self, repository: WatchlistRepository, igdb_client: IGDBClient):
        self.repository = repository
        self.igdb_client = igdb_client

    def _format_igdb_game(self, item: dict) -> IGDBGameResult:
        cover = item.get("cover", {}).get("url", "")
        if cover:
            cover = "https:" + cover.replace("t_thumb", "t_cover_big")
        
        screenshots = []
        for shot in item.get("screenshots", []):
            url = shot.get("url", "")
            if url:
                screenshots.append("https:" + url.replace("t_thumb", "t_screenshot_med"))

        videos = []
        for vid in item.get("videos", []):
            vid_id = vid.get("video_id")
            if vid_id:
                videos.append(f"https://www.youtube.com/watch?v={vid_id}")

        return IGDBGameResult(
            id=item["id"],
            name=item["name"],
            summary=item.get("summary"),
            cover_url=cover,
            screenshots=screenshots, 
            videos=videos           
        )


    async def search_games_igdb(self, query: str, limit: int = 20, offset: int = 0) -> list[IGDBGameResult]:
        """Busca no IGDB e formata imagens/videos."""
        results = await self.igdb_client.search_games(query, limit, offset)
        return [self._format_igdb_game(item) for item in results]


    async def get_igdb_game_details(self, igdb_id: int) -> IGDBGameResult:
        """Busca um jogo específico no IGDB e formata para visualização."""

        item = await self.igdb_client.get_game_by_id(igdb_id)
        
        if not item:
            raise HTTPException(status_code=404, detail="Jogo não encontrado no IGDB")
            
        return self._format_igdb_game(item)

    async def create_watchlist(self, user_id: int, nome: str) -> Watchlist:

        watchlist = Watchlist(id_user=user_id, nome=nome)
        return await self.repository.create_watchlist(watchlist)
        
    async def get_watchlist_details(self, user_id: int, watchlist_id: int) -> Watchlist:
            watchlist = await self.repository.get_watchlist_by_id(watchlist_id)
            if not watchlist:
                raise HTTPException(status_code=404, detail="Watchlist não encontrada")
            
            for item in watchlist.jogos_associacao:
                jogo = item.jogo
                avaliacoes = jogo.avaliacoes
                
                if avaliacoes:
                    media = sum(a.nota for a in avaliacoes) / len(avaliacoes)
                    jogo.media_geral = round(media, 1)
                else:
                    jogo.media_geral = None

                user_review = next((a for a in avaliacoes if a.id_user == user_id), None)
                if user_review:
                    jogo.nota_usuario = user_review.nota
                else:
                    jogo.nota_usuario = None

            return watchlist

    async def get_user_watchlists(self, user_id: int) -> list[Watchlist]:
        return await self.repository.get_user_watchlists(user_id)
    

    async def add_igdb_game_to_watchlist(self, user_id: int, watchlist_id: int, igdb_game_id: int):
        watchlist = await self.repository.get_watchlist_by_id(watchlist_id)
        if not watchlist or watchlist.id_user != user_id:
             raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado ou Watchlist não encontrada")
        
        igdb_game = await self.igdb_client.get_game_by_id(igdb_game_id)
        if not igdb_game:
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Jogo não encontrado no IGDB")

        game_title = igdb_game["name"]
        jogo = await self.repository.get_game_by_title(game_title)
        
        if not jogo:
            dev_id = None
            pub_id = None
            
            companies = igdb_game.get("involved_companies", [])
            for comp_data in companies:
                c_data = comp_data.get("company", {})
                c_name = c_data.get("name")
                if not c_name: continue
                

                c_country_id = c_data.get("country")
                c_start_ts = c_data.get("start_date")


                dt_fundacao = None
                if c_start_ts:
                    try:

                        dt_fundacao = datetime.fromtimestamp(c_start_ts).date()
                    except (OSError, ValueError):
                        dt_fundacao = None
                
                pais_nome, mercado_nome = resolve_country_and_market(c_country_id)

                if comp_data.get("developer") and not dev_id:
                    existing_id = await self.repository.get_company_by_name(c_name)
                    if existing_id:
                        dev_id = existing_id
                    else:

                        dev_id = await self.repository.create_company_raw(
                            c_name, 'desenvolvedora', dt_fundacao, pais_nome, mercado_nome
                        )
                
                elif comp_data.get("publisher") and not pub_id:
                    existing_id = await self.repository.get_company_by_name(c_name)
                    if existing_id:
                        pub_id = existing_id
                    else:

                        pub_id = await self.repository.create_company_raw(
                            c_name, 'publicadora', dt_fundacao, pais_nome, mercado_nome
                        )

            nota = int(igdb_game.get("aggregated_rating", 0)) if igdb_game.get("aggregated_rating") else None
            cover_url = igdb_game.get("cover", {}).get("url", "")
            if cover_url:
                cover_url = "https:" + cover_url.replace("t_thumb", "t_cover_big")

            novo_jogo = Jogo(
                titulo=game_title,
                descricao=igdb_game.get("summary"),
                nota_metacritic=nota,
                id_desenvolvedor=dev_id,
                id_publicadora=pub_id,
                capa_url=cover_url,
                id_igdb=igdb_game["id"]
            )
            
            game_id = await self.repository.create_game_raw(novo_jogo)
            jogo = novo_jogo
            jogo.id_jogo = game_id

            for g_data in igdb_game.get("genres", []):
                g_nome = g_data["name"]
                genero = await self.repository.get_genre_by_name(g_nome)
                if not genero:
                    gid = await self.repository.create_genre_raw(g_nome)
                else:
                    gid = genero.id_genero
                await self.repository.link_game_genre(game_id, gid)

            release_ts = igdb_game.get("first_release_date")
            release_date = datetime.fromtimestamp(release_ts).date() if release_ts else None
            
            for p_data in igdb_game.get("platforms", []):
                p_nome = p_data["name"]
                plat = await self.repository.get_platform_by_name(p_nome)
                if not plat:
                    pid = await self.repository.create_platform_raw(p_nome)
                else:
                    pid = plat.id_plataforma
                await self.repository.link_game_platform(game_id, pid, release_date)

            for dlc_data in igdb_game.get("dlcs", []):
                d_name = dlc_data.get("name")
                d_summary = dlc_data.get("summary")
                if d_name:
                    await self.repository.create_dlc_raw(game_id, d_name, d_summary)

        existing_ids = {j.id_jogo for j in watchlist.jogos}
        if jogo.id_jogo in existing_ids:
             raise HTTPException(status_code=HTTPStatus.CONFLICT, detail="Jogo já está nesta watchlist")

        await self.repository.link_watchlist_game(watchlist.id_watchlist, jogo.id_jogo)
        watchlist.jogos.append(jogo)
        
        return watchlist
    
    def _format_igdb_game(self, item: dict) -> IGDBGameResult:
        
        cover = item.get("cover", {}).get("url", "")
        if cover:
            cover = "https:" + cover.replace("t_thumb", "t_cover_big")
        
        images_list = []
        
        raw_artworks = item.get("artworks", [])
        if raw_artworks:
            for art in raw_artworks:
                url = art.get("url", "")
                if url:
                    images_list.append("https:" + url.replace("t_thumb", "t_screenshot_med"))

        if not images_list:
            raw_screenshots = item.get("screenshots", [])
            for shot in raw_screenshots:
                url = shot.get("url", "")
                if url:
                    images_list.append("https:" + url.replace("t_thumb", "t_screenshot_med"))

        videos = []
        for vid in item.get("videos", []):
            vid_id = vid.get("video_id")
            if vid_id:
                youtube_url = f"https://www.youtube.com/watch?v={vid_id}"
                videos.append(youtube_url)
                
                if not images_list:
                    thumb_url = f"https://img.youtube.com/vi/{vid_id}/hqdefault.jpg"
                    images_list.append(thumb_url)

        genres_list = []
        raw_genres = item.get("genres", [])
        if raw_genres:

            genres_list = [g.get("name") for g in raw_genres if g.get("name")]

        raw_rating = item.get("aggregated_rating")
        if raw_rating and raw_rating > 0:
                    metacritic_rating = round(raw_rating / 10, 2) 
        else:
            metacritic_rating = None

        developers = []
        publishers = []
        
        companies = item.get("involved_companies", [])
        if companies:
            for entry in companies:
                company_data = entry.get("company", {})
                company_name = company_data.get("name")
                
                if company_name:
                    if entry.get("developer"):
                        developers.append(company_name)
                    if entry.get("publisher"):
                        publishers.append(company_name)
        
        dev_str = ", ".join(developers) if developers else None
        pub_str = ", ".join(publishers) if publishers else None


        return IGDBGameResult(
            id=item["id"],
            name=item["name"],
            summary=item.get("summary"),
            cover_url=cover,
            screenshots=images_list,
            videos=videos, 
            genres=genres_list,
            metacritic_rating=metacritic_rating,
            developer=dev_str,
            publisher=pub_str
        )
    
    async def remove_game_from_watchlist(self, user_id: int, watchlist_id: int, game_id: int):

        watchlist = await self.repository.get_watchlist_by_id(watchlist_id)
        if not watchlist:
             raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Watchlist não encontrada")

        if watchlist.id_user != user_id:
             raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado: Watchlist pertence a outro usuário")

        game_ids_in_list = {j.id_jogo for j in watchlist.jogos}
        if game_id not in game_ids_in_list:
             raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Jogo não está nesta watchlist")

        await self.repository.unlink_watchlist_game(watchlist_id, game_id)
        return {"message": "Jogo removido da watchlist com sucesso"}

    async def delete_watchlist(self, user_id: int, watchlist_id: int):

        watchlist = await self.repository.get_watchlist_by_id(watchlist_id)
        if not watchlist:
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Watchlist não encontrada")

        if watchlist.id_user != user_id:
            raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado: Watchlist pertence a outro usuário")

        await self.repository.delete_watchlist_by_id(watchlist_id)
        return {"message": "Watchlist deletada permanentemente"}
    
    async def add_game_to_favorites(self, user_id: int, igdb_game_id: int) -> Watchlist:

        FAVORITES_NAME = "Favoritos"
        
        favorites_list = await self.repository.get_watchlist_by_user_and_name(user_id, FAVORITES_NAME)

        if not favorites_list:
            favorites_list = await self.create_watchlist(user_id, FAVORITES_NAME)
            print(f"Watchlist 'Favoritos' criada para o usuário {user_id}")

        return await self.add_igdb_game_to_watchlist(
            user_id=user_id,
            watchlist_id=favorites_list.id_watchlist,
            igdb_game_id=igdb_game_id
        )
    
    async def remove_game_from_favorites(self, user_id: int, game_id: int):

        FAVORITES_NAME = "Favoritos"
        
        favorites_list = await self.repository.get_watchlist_by_user_and_name(user_id, FAVORITES_NAME)

        if not favorites_list:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND, 
                detail=f"A watchlist '{FAVORITES_NAME}' não existe para este usuário."
            )

        await self.remove_game_from_watchlist(
            user_id=user_id,
            watchlist_id=favorites_list.id_watchlist,
            game_id=game_id
        )
        
        return {"message": "Jogo removido dos Favoritos com sucesso."}
    
    async def update_game_status_in_watchlist(self, user_id: int, watchlist_id: int, game_id: int, new_status: str):
        
        watchlist = await self.repository.get_watchlist_by_id(watchlist_id)
        
        if not watchlist:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Watchlist não encontrada ou não pertence ao usuário."
            )

        updated_assoc = await self.repository.update_game_status(watchlist_id, game_id, new_status)

        if not updated_assoc:
            raise HTTPException(
                status_code=HTTPStatus.NOT_FOUND,
                detail="Jogo não encontrado nesta watchlist."
            )

        return await self.get_watchlist_details(user_id, watchlist_id)
    
    async def get_popular_games_by_genre(self, genre_name: str, limit: int = 20, offset: int = 0) -> list[IGDBGameResult]:

        results = await self.igdb_client.search_games_by_genre(genre_name, limit, offset)
        

        return [self._format_igdb_game(item) for item in results]
    
    async def get_top_games_global(self, limit: int = 20, offset: int = 0) -> list[IGDBGameResult]:

        
        results = await self.igdb_client.get_all_popular_games(limit, offset)
        
        return [self._format_igdb_game(item) for item in results]