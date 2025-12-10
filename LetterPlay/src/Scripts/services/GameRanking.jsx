import React, { useEffect, useState } from "react";
import { TypographyUI, CardUI } from "../ui";
import { Link } from "react-router-dom";
import { getWeeklyRanking } from "../api/watchListApi"

function Ranking() {
    
    const [topGames, setTopGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRanking() {
            try {
                const rawData = await getWeeklyRanking();

                let list = [];
                
                if (Array.isArray(rawData)) {
                    list = rawData;
                } else if (Array.isArray(rawData.jogos)) {
                    list = rawData.jogos;
                } else if (Array.isArray(rawData.ranking)) {
                    list = rawData.ranking;
                } else if (Array.isArray(rawData.data)) {
                    list = rawData.data;
                } else if (Array.isArray(rawData.results)) {
                    list = rawData.results;
                }

                const formatted = list.slice(0, 3).map((game) => {
                    let cover = game.cover?.url || game.cover_url || game.capa_url || "";
                    if (cover.startsWith("//")) cover = `https:${cover}`;
                    
                    cover = cover.replace("t_thumb", "t_cover_big");

                    return {
                        id: game.id || game.id_jogo,
                        name: game.name || game.titulo,
                        cover_url: cover,
                        rating: game.rating || game.total_rating || game.media || 0,
                        genres: (game.genres || []).map(g => g.name || g.nome_genero || g),
                        summary: game.summary || game.descricao || "",
                        screenshots: (game.screenshots || []).map(s => s.url || s),
                        release_date: game.first_release_date,
                        involved_companies: game.involved_companies || []
                    };
                });

                setTopGames(formatted);
            } catch (error) {
                console.error("Error fetching ranking:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRanking();
    }, []);

    if (isLoading) {
        return <div className="text-white text-center mt-20">Carregando Ranking...</div>;
    }

    return (
        <div id="divRanking" className="h-auto w-128 mb-20">
            <TypographyUI as="span" variant="titulo" className="block ml-64 mt-20 text-4xl">
                Ranking Semanal
            </TypographyUI>

            <div id="cardJogosRanking" className="mx-64 pt-12 grid sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 justify-around gap-10">
                
                {topGames.length === 0 && (
                    <TypographyUI variant="muted">Nenhum dado de ranking disponível.</TypographyUI>
                )}

                {topGames.map((game, index) => (
                    <div key={game.id} className="relative flex flex-col items-center group">

                        <Link
                            to="/loreAccurateAboutGame"
                            state={{ infosGame: game }}
                            className="transform transition-transform duration-300 hover:scale-105"
                        >
                            <CardUI infosGame={game} className="-ml-10" /> 
                        </Link>


                        <div className={`h-12 w-12 absolute top-2 right-24 z-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20
                            ${index === 0 ? "bg-yellow-500 shadow-yellow-500/50" 
                            : index === 1 ? "bg-gray-400 shadow-gray-400/50"      
                            : "bg-orange-600 shadow-orange-600/50"               
                            }`}
                        >
                            <TypographyUI as="span" variant="titulo" className="text-white text-2xl drop-shadow-md">
                                {index + 1}
                            </TypographyUI>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Ranking;