from fastapi import HTTPException
from http import HTTPStatus
from app.repositories.review import ReviewRepository
from app.repositories.watchlist import WatchlistRepository
from app.models.user import Avaliacao
from app.schemas.review import ReviewCreate, ReviewPublic

class ReviewService:
    def __init__(self, review_repo: ReviewRepository, watchlist_repo: WatchlistRepository):

            self.review_repo = review_repo
            self.watchlist_repo = watchlist_repo

    async def create_review(self, user_id: int, game_id: int, schema: ReviewCreate) -> ReviewPublic:
            """
            Adiciona uma avaliação OU atualiza se já existir (Sobrescrever).
            """

            review_existente = await self.review_repo.get_by_user_and_game(user_id, game_id)

            if review_existente:

                review_existente.nota = schema.nota
                review_existente.comentario = schema.comentario
                

                saved_review = await self.review_repo.update_review(review_existente)
            
            else:

                nova_avaliacao = Avaliacao(
                    nota=schema.nota,
                    comentario=schema.comentario,
                    id_jogo=game_id,
                    id_user=user_id
                )
                saved_review = await self.review_repo.create_review(nova_avaliacao)
            
            return ReviewPublic(
                id_avaliacao=saved_review.id_avaliacao,
                nota=saved_review.nota,
                comentario=saved_review.comentario,
                id_jogo=saved_review.id_jogo,
                id_user=saved_review.id_user
            )
            

    async def get_game_reviews(self, game_id: int) -> dict:
        """
        Retorna lista de avaliações e média.
        """
        reviews_data = await self.review_repo.get_reviews_by_game(game_id)
        
        media = 0.0
        if reviews_data:
            soma = sum(r['nota'] for r in reviews_data)
            media = round(soma / len(reviews_data), 1)
            
        return {
            "items": reviews_data,
            "media_nota": media
        }

    async def get_my_reviews(self, user_id: int):
        return await self.review_repo.get_reviews_by_user(user_id)

    async def delete_review(self, user_id: int, review_id: int):

        review = await self.review_repo.get_by_id(review_id) 

        if not review:
            raise HTTPException(status_code=HTTPStatus.NOT_FOUND, detail="Avaliação não encontrada")

        if (review.id_user != user_id) :
            raise HTTPException(status_code=HTTPStatus.FORBIDDEN, detail="Acesso negado: Você não é o autor desta avaliação")

        await self.review_repo.delete_review_by_id(review_id)
        return {"message": "Avaliação deletada com sucesso"}
    
    async def get_weekly_ranking(self) -> list[dict]:
        """
        Retorna o Top 10 jogos baseados nas avaliações dos usuários.
        """
        return await self.review_repo.get_top_rated_games(limit=10)