import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CardUI } from "../ui";
import { globalRanking } from "../api/watchListApi" 

function GameList() {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchGames() {
            try {
                const rawData = await globalRanking(); 

                let list = [];
                if (Array.isArray(rawData)) list = rawData;
                else if (Array.isArray(rawData.data)) list = rawData.data;
                else if (Array.isArray(rawData.results)) list = rawData.results;
                else if (Array.isArray(rawData.ranking)) list = rawData.ranking;

                const formatted = list.map((item) => {
                    const game = item.jogo || item; 

                    let cover = game.cover?.url || game.cover_url || game.capa_url || game.url_capa || "";
                    if (typeof cover === 'string') {
                        if (cover.startsWith("//")) cover = `https:${cover}`;
                        cover = cover.replace("t_thumb", "t_cover_big");
                    }

                    return {
                        id: game.id || game.id_jogo,
                        name: game.name || game.titulo || game.nome,
                        cover_url: cover,
                        rating: game.rating || game.total_rating || game.media || 0,
                        genres: (game.genres || game.generos || []).map(g => g.name || g.nome_genero || g),
                        summary: game.summary || game.descricao || "",
                        screenshots: (game.screenshots || []).map(s => s.url || s),
                        release_date: game.first_release_date,
                    };
                });

                setGames(formatted);
            } catch (error) {
                console.error("Error fetching game list:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchGames();
    }, []);

    if (isLoading) {
        return <div className="text-white text-center p-10">Carregando jogos...</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {games.length > 0 ? (
                games.map((game) => (
                    <Link 
                        key={game.id} 
                        to="/aboutGame" 
                        state={{ infosGame: game }} 
                        className="transform transition-transform hover:scale-105"
                    >
                        <CardUI infosGame={game} />
                    </Link>
                ))
            ) : (
                <div className="col-span-full text-center text-gray-500">
                    Nenhum jogo encontrado.
                </div>
            )}
        </div>
    );
}

export default GameList;