import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HeaderUI, CardUI, TypographyUI, GameRanking, FilterByGenre } from '../Scripts/ui';
import { globalRanking } from '../Scripts/api/watchListApi';
import { searchByGenre } from '../Scripts/api/searchApi';

export function LibraryGames() {
    
    // --- STATE ---
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState(null); 

    const mapGames = (list) => {
        return list.map((item) => {
            const game = item.jogo || item;

            // Safe Cover URL
            let cover = game.cover?.url || game.cover_url || game.capa_url || game.url_capa || "";
            if (typeof cover === 'string') {
                if (cover.startsWith("//")) cover = `https:${cover}`;
                cover = cover.replace("t_thumb", "t_cover_big");
            }

            let dev = "Desconhecido";
            let pub = "Desconhecido";

            if (game.desenvolvedora?.nome) dev = game.desenvolvedora.nome;
            if (game.publicadora?.nome) pub = game.publicadora.nome;

            if (dev === "Desconhecido" && Array.isArray(game.involved_companies)) {
                const foundDev = game.involved_companies.find(c => c.developer);
                if (foundDev) dev = foundDev.company?.name || foundDev.name;
            }

            if (pub === "Desconhecido" && Array.isArray(game.involved_companies)) {
                const foundPub = game.involved_companies.find(c => c.publisher);
                if (foundPub) pub = foundPub.company?.name || foundPub.name;
            }

            return {
                id: game.id || game.id_jogo, 
                name: game.name || game.titulo || game.nome,
                cover_url: cover,
                rating: game.rating || game.total_rating || game.media || game.metacritic_rating || 0,
                genres: (game.genres || game.generos || []).map(g => g.name || g.nome_genero || g),
                summary: game.summary || game.descricao || "",
                developer: dev,
                publisher: pub,

                screenshots: (game.screenshots || []).map(s => s.url || s),
                release_date: game.first_release_date,
            };
        });
    };

    // --- FETCH DATA ---
    useEffect(() => {
        async function loadLibrary() {
            setIsLoading(true);
            try {
                let rawData;

                if (selectedGenre) {
                    rawData = await searchByGenre(selectedGenre);
                } else {
                    rawData = await globalRanking();
                }

                console.log("Library Data:", rawData);

                let list = [];
                if (Array.isArray(rawData)) list = rawData;
                else if (Array.isArray(rawData.data)) list = rawData.data;
                else if (Array.isArray(rawData.results)) list = rawData.results;
                else if (Array.isArray(rawData.ranking)) list = rawData.ranking; 

                setGames(mapGames(list));

            } catch (error) {
                console.error("Error loading library:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadLibrary();
    }, [selectedGenre]); // Re-run when genre changes


    // --- HANDLER FOR FILTER ---
    const handleGenreSelect = (genre) => {
        if (selectedGenre === genre) {
            setSelectedGenre(null);
        } else {
            setSelectedGenre(genre);
        }
    };

    return (
        <div className="w-full min-h-[150vh] bg-background">
            <HeaderUI />

            {/* Top Ranking Section */}
            <GameRanking />

            <div id="divBiblioteca" className="px-10 pb-20">
                <div className="flex flex-col items-center justify-center mt-32 mb-12">
                    <TypographyUI as="span" variant="titulo" className="text-4xl mb-8"> 
                        Biblioteca 
                    </TypographyUI>
                
                    <FilterByGenre onSelect={handleGenreSelect} activeGenre={selectedGenre} />
                </div>

                {/* --- GAMES GRID --- */}
                {isLoading ? (
                    <div className="text-white text-center mt-10">Carregando jogos...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12 justify-items-center">
                        {games.length > 0 ? (
                            games.map((game) => (
                                <Link
                                    key={game.id}
                                    to="/aboutGame"
                                    state={{ infosGame: game }}
                                    className="transform transition-transform duration-300 hover:scale-105"
                                >
                                    <CardUI infosGame={game} />
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-gray-400 text-xl mt-10">
                                Nenhum jogo encontrado.
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}