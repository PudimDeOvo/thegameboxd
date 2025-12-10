from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import Watchlist, Jogo, Genero, Plataforma, JogoPlataforma
from sqlalchemy import text, select
from sqlalchemy.orm import selectinload, joinedload
from app.models.user import Avaliacao, Jogo
from app.models.user import Watchlist, Jogo, Genero, Plataforma, JogoWatchlist

class WatchlistRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_watchlist(self, watchlist: Watchlist) -> Watchlist:
            stmt = text("INSERT INTO watchlists (id_user, nome) VALUES (:uid, :nm) RETURNING id_watchlist")
            result = await self.session.execute(stmt, {"uid": watchlist.id_user, "nm": watchlist.nome})
            watchlist.id_watchlist = result.scalar()
            await self.session.commit()

            return watchlist

    async def get_user_watchlists(self, user_id: int) -> list[Watchlist]:

        stmt = text("SELECT id_watchlist, id_user, nome FROM watchlists WHERE id_user = :uid")
        result = await self.session.execute(stmt, {"uid": user_id})
        watchlists = []
        for row in result.mappings():
            w = Watchlist(id_user=row.id_user, nome=row.nome)
            w.id_watchlist = row.id_watchlist
            watchlists.append(w)
        return watchlists

    async def get_watchlist_by_id(self, watchlist_id: int) -> Watchlist | None:

            stmt = (
                select(Watchlist)
                .where(Watchlist.id_watchlist == watchlist_id)
                .options(

                    selectinload(Watchlist.jogos_associacao).options( 
                        
                        joinedload(JogoWatchlist.jogo).options(
                            selectinload(Jogo.generos), 
                            selectinload(Jogo.dlcs),
                            joinedload(Jogo.desenvolvedora), 
                            joinedload(Jogo.publicadora),selectinload(Jogo.avaliacoes),
                            selectinload(Jogo.plataformas_associacao).joinedload(JogoPlataforma.plataforma)
                        )
                    )
                )
            )
            
            result = await self.session.execute(stmt)
            return result.scalars().first()

    async def get_game_by_title(self, title: str) -> Jogo | None:
        stmt = text("SELECT * FROM jogos WHERE titulo = :t LIMIT 1")
        res = await self.session.execute(stmt, {"t": title})
        row = res.mappings().first()
        if row:
            j = Jogo(
                titulo=row.titulo,
                descricao=row.descricao,
                nota_metacritic=row.nota_metacritic,
                id_desenvolvedor=row.id_desenvolvedor,
                id_publicadora=row.id_publicadora
            )
            j.id_jogo = row.id_jogo
            return j
        return None

    async def create_game_raw(self, game: Jogo) -> int:

            stmt = text("""
                INSERT INTO jogos (
                    titulo, 
                    descricao, 
                    nota_metacritic, 
                    id_desenvolvedor, 
                    id_publicadora, 
                    capa_url,
                    id_igdb
                )
                VALUES (:t, :d, :n, :dev, :pub, :capa, :igdb)
                RETURNING id_jogo
            """)
            

            params = {
                "t": game.titulo,
                "d": game.descricao,
                "n": game.nota_metacritic,
                "dev": game.id_desenvolvedor,
                "pub": game.id_publicadora,
                "capa": game.capa_url,
                "igdb": game.id_igdb
            }
            
            res = await self.session.execute(stmt, params)
            new_id = res.scalar()
            await self.session.commit()
            
            return new_id

    async def get_genre_by_name(self, name: str) -> Genero | None:
        stmt = text("SELECT * FROM generos WHERE nome_genero = :n")
        res = await self.session.execute(stmt, {"n": name})
        row = res.mappings().first()
        if row:
            g = Genero(nome_genero=row.nome_genero)
            g.id_genero = row.id_genero
            return g
        return None

    async def create_genre_raw(self, name: str) -> int:
        stmt = text("INSERT INTO generos (nome_genero) VALUES (:n) RETURNING id_genero")
        res = await self.session.execute(stmt, {"n": name})
        gid = res.scalar()
        await self.session.commit()
        return gid

    async def link_game_genre(self, game_id: int, genre_id: int):
        check = text("SELECT 1 FROM jogo_genero WHERE id_jogo=:j AND id_genero=:g")
        exists = await self.session.scalar(check, {"j": game_id, "g": genre_id})
        if not exists:
            stmt = text("INSERT INTO jogo_genero (id_jogo, id_genero) VALUES (:j, :g)")
            await self.session.execute(stmt, {"j": game_id, "g": genre_id})
            await self.session.commit()

    async def get_platform_by_name(self, name: str) -> Plataforma | None:
        stmt = text("SELECT * FROM plataformas WHERE nome = :n")
        res = await self.session.execute(stmt, {"n": name})
        row = res.mappings().first()
        if row:
            p = Plataforma(nome=row.nome)
            p.id_plataforma = row.id_plataforma
            return p
        return None

    async def create_platform_raw(self, name: str) -> int:
        stmt = text("INSERT INTO plataformas (nome) VALUES (:n) RETURNING id_plataforma")
        res = await self.session.execute(stmt, {"n": name})
        pid = res.scalar()
        await self.session.commit()
        return pid

    async def link_game_platform(self, game_id: int, platform_id: int, release_date):
        check = text("SELECT 1 FROM jogo_plataformas WHERE id_jogo=:j AND id_plataforma=:p")
        exists = await self.session.scalar(check, {"j": game_id, "p": platform_id})
        if not exists:
            stmt = text("INSERT INTO jogo_plataformas (id_jogo, id_plataforma, data_lancamento) VALUES (:j, :p, :d)")
            await self.session.execute(stmt, {"j": game_id, "p": platform_id, "d": release_date})
            await self.session.commit()

    async def link_watchlist_game(self, watchlist_id: int, game_id: int):
        stmt = text("INSERT INTO watchlist_jogo (id_watchlist, id_jogo) VALUES (:wid, :gid)")
        await self.session.execute(stmt, {"wid": watchlist_id, "gid": game_id})
        await self.session.commit()


    async def get_company_by_name(self, name: str) -> int | None:
        stmt = text("SELECT id_empresa FROM empresas WHERE nome = :n")
        return await self.session.scalar(stmt, {"n": name})

    async def create_company_raw(
            self, 
            name: str, 
            tipo: str, 
            data_fundacao=None, 
            pais_origem: str=None, 
            mercado_principal: str=None
        ) -> int:

            stmt1 = text("""
                INSERT INTO empresas (nome, tipo_empresa, data_fundacao, pais_origem) 
                VALUES (:n, :t, :df, :po) 
                RETURNING id_empresa
            """)
            
            res = await self.session.execute(stmt1, {
                "n": name, 
                "t": tipo,
                "df": data_fundacao,
                "po": pais_origem
            })
            cid = res.scalar()
            
            if tipo == 'desenvolvedora':
                stmt2 = text("""
                    INSERT INTO desenvolvedoras (id_empresa, mercado_principal) 
                    VALUES (:id, :mercado)
                """)
            else:
                stmt2 = text("""
                    INSERT INTO publicadoras (id_empresa, mercado_principal) 
                    VALUES (:id, :mercado)
                """)
                
            await self.session.execute(stmt2, {
                "id": cid, 
                "mercado": mercado_principal
            })
            
            await self.session.commit()
            return cid

    async def create_dlc_raw(self, game_id: int, name: str, desc: str):

        stmt = text("INSERT INTO dlcs (id_jogo, nome_dlc, descricao) VALUES (:jid, :n, :d)")
        await self.session.execute(stmt, {"jid": game_id, "n": name, "d": desc})
        await self.session.commit()
    
    async def get_reviews_by_user(self, user_id: int) -> list[Avaliacao]:

        stmt = (
            select(Avaliacao)
            .where(Avaliacao.id_user == user_id)
            .options(
                joinedload(Avaliacao.jogo)
               
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def unlink_watchlist_game(self, watchlist_id: int, game_id: int):

        stmt = text("DELETE FROM watchlist_jogo WHERE id_watchlist = :wid AND id_jogo = :gid")
        await self.session.execute(stmt, {"wid": watchlist_id, "gid": game_id})
        await self.session.commit()

    async def delete_watchlist_by_id(self, watchlist_id: int):
            
            stmt_unlink = text("DELETE FROM watchlist_jogo WHERE id_watchlist = :wid")
            await self.session.execute(stmt_unlink, {"wid": watchlist_id})
            
            stmt_delete = text("DELETE FROM watchlists WHERE id_watchlist = :wid")
            await self.session.execute(stmt_delete, {"wid": watchlist_id})
            
            await self.session.commit()

    async def get_watchlist_by_user_and_name(self, user_id: int, name: str) -> Watchlist | None:
        stmt = select(Watchlist).where(Watchlist.id_user == user_id, Watchlist.nome == name)
        result = await self.session.execute(stmt)
        return result.scalars().first()
    
    async def update_game_status(self, watchlist_id: int, game_id: int, new_status: str) -> JogoWatchlist | None:
        
        stmt = select(JogoWatchlist).where(
            JogoWatchlist.id_watchlist == watchlist_id,
            JogoWatchlist.id_jogo == game_id
        )
        result = await self.session.execute(stmt)
        association = result.scalars().first()
        
        if association:
            association.status_jogo = new_status
            await self.session.commit()
            await self.session.refresh(association)
            return association
        
        return None