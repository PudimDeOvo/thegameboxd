import httpx
from datetime import datetime, timedelta
from fastapi import HTTPException
from http import HTTPStatus

class IGDBClient:
    BASE_URL = "https://api.igdb.com/v4"
    AUTH_URL = "https://id.twitch.tv/oauth2/token"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token = None
        self.token_expires_at = None

    async def _authenticate(self):
        """Obtém um novo token de acesso se o atual expirou ou não existe."""
        if self.access_token and self.token_expires_at and datetime.now() < self.token_expires_at:
            return

        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.AUTH_URL,
                params={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "client_credentials",
                },
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=HTTPStatus.SERVICE_UNAVAILABLE,
                    detail="Falha ao autenticar com IGDB. Verifique as credenciais.",
                )

            data = response.json()
            self.access_token = data["access_token"]
            self.token_expires_at = datetime.now() + timedelta(seconds=data["expires_in"] - 60)


    async def search_games(self, query: str, limit: int = 20, offset: int = 0) -> list[dict]:

            await self._authenticate()
            headers = {
                "Client-ID": self.client_id,
                "Authorization": f"Bearer {self.access_token}",
            }

            async with httpx.AsyncClient() as client:
                
                fields = "name, cover.url, summary, screenshots.url, artworks.url, videos.video_id, genres.name, aggregated_rating, total_rating_count,involved_companies.company.name, involved_companies.developer, involved_companies.publisher"
                
                body = (
                    f'fields {fields}; '
                    f'where name ~ "{query}"* & total_rating_count != null; ' 
                    f'sort total_rating_count desc; '
                    f'limit {limit}; offset {offset};'
                )

                response = await client.post(
                    f"{self.BASE_URL}/games",
                    headers=headers,
                    data=body
                )
                

                if response.status_code != 200:

                    print(f" ERRO REAL IGDB/Twitch: Status {response.status_code}")
                    try:
                        igdb_error_detail = response.json()
                    except Exception:
                        igdb_error_detail = response.text
                    
                    print(f"   Detalhes da Resposta do IGDB: {igdb_error_detail}")

                    if response.status_code == 401:
                        detail_msg = "Falha de Autenticação (401). Verifique Client ID/Secret e expiry do Token."
                    elif response.status_code == 429:
                        detail_msg = "Limite de Requisições Excedido (429 - Rate Limit)."
                    elif response.status_code == 406:
                        detail_msg = "Sintaxe IGDB: Conflito entre busca e ordenação. (ERRO 406)"
                    else:
                        detail_msg = f"Erro {response.status_code} ao buscar jogos no IGDB. Verifique detalhes no log."
                    
                    raise HTTPException(
                        status_code=HTTPStatus.BAD_GATEWAY,
                        detail=detail_msg
                    )

                
                return response.json()

    async def get_game_by_id(self, game_id: int) -> dict | None:
            """
            Busca detalhes completos de um jogo, incluindo Empresas, DLCs e Notas.
            """
            await self._authenticate()
            
            headers = {
                "Client-ID": self.client_id,
                "Authorization": f"Bearer {self.access_token}",
            }
            
            fields = (
                "name, cover.url, summary, "
                "aggregated_rating, total_rating_count, " 
                "genres.name, platforms.name, first_release_date, "
                "involved_companies.company.name, "
                "involved_companies.company.country, "
                "involved_companies.company.start_date, "
                "involved_companies.developer, involved_companies.publisher, "
                "dlcs.name, dlcs.summary,"
                "screenshots.url, artworks.url, videos.video_id"
            )
            
            body = f'fields {fields}; where id = {game_id};'
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.BASE_URL}/games",
                    headers=headers,
                    data=body
                )
                
                if response.status_code != 200:
                    print(f"Erro IGDB ID: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=HTTPStatus.BAD_GATEWAY,
                        detail="Erro ao buscar detalhes do jogo no IGDB",
                    )
                
                data = response.json()
                return data[0] if data else None
        

    async def search_games_by_genre(self, genre_name: str, limit: int = 20, offset: int = 0) -> list[dict]:

        await self._authenticate()
        
        GENRE_IDS = {
            "luta": 4, "fighting": 4,
            "tiro": 5, "shooter": 5, "fps": 5,
            "musica": 7, "music": 7,
            "plataforma": 8, "platform": 8,
            "puzzle": 9, "quebra-cabeca": 9,
            "corrida": 10, "racing": 10,
            "rts": 11, "estrategia": 15, "strategy": 15,
            "rpg": 12, "role-playing": 12, "role-playing (rpg)": 12,
            "simulador": 13, "simulator": 13,
            "esporte": 14, "sport": 14,
            "aventura": 31, "adventure": 31,
            "terror": 31, "horror": 31,
            "indie": 32, "arcade": 33,
            "point-and-click": 2,
            "pinball": 30,
            "visual novel": 34,
            "card": 26, "cartas": 26
        }
        
        clean_name = genre_name.strip().lower()
        genre_id = GENRE_IDS.get(clean_name)

        headers = {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {self.access_token}",
        }

        async with httpx.AsyncClient() as client:
            
            if not genre_id:
                genre_body = f'fields id; where name ~ "{genre_name}"*; limit 1;'
                
                response = await client.post(
                    f"{self.BASE_URL}/genres",
                    headers=headers,
                    data=genre_body
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data:
                        genre_id = data[0]['id']
            
            if not genre_id:
                return []

            fields = "name, cover.url, summary, screenshots.url, artworks.url, videos.video_id, genres.name, total_rating_count, aggregated_rating, involved_companies.company.name, involved_companies.developer, involved_companies.publisher"
            
            games_body = (
                f'fields {fields}; '
                f'where genres = ({genre_id}) & total_rating_count != null; '
                f'sort total_rating_count desc; '
                f'limit {limit}; offset {offset};'
            )

            response = await client.post(
                f"{self.BASE_URL}/games",
                headers=headers,
                data=games_body
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=HTTPStatus.BAD_GATEWAY,
                    detail="Erro ao buscar jogos no IGDB",
                )

            return response.json()
        
    async def get_all_popular_games(self, limit: int = 20, offset: int = 0) -> list[dict]:

        await self._authenticate()
        
        headers = {
            "Client-ID": self.client_id,
            "Authorization": f"Bearer {self.access_token}",
        }

        fields = "name, cover.url, summary, screenshots.url, artworks.url, videos.video_id, genres.name, aggregated_rating, rating_count, involved_companies.company.name, involved_companies.developer, involved_companies.publisher"
        
        
        body = (
            f'fields {fields}; '
            f'where rating_count >= 300; ' 
            f'sort rating_count desc; '
            f'limit {limit}; offset {offset};'
        )

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/games",
                headers=headers,
                data=body
            )

            if response.status_code != 200:
                print(f" ERRO  Status {response.status_code}")
                try: 
                    detail = response.json() 
                except: 
                    detail = response.text
                
                raise HTTPException(
                    status_code=HTTPStatus.BAD_GATEWAY,
                    detail=f"Erro IGDB ({response.status_code}): {detail}"
                )

            return response.json()