
import { searchGames } from "../Scripts/api/searchApi";
import { addGameToWatchlist, updateGameStatus } from "../Scripts/api/watchListGameApi";
import { getWatchlistFull } from "../Scripts/api/watchListApi";
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui";
import CardUI from "../Scripts/ui/CardUI";

export default function AboutList() {
    const { state } = useLocation();

    // Initialize State
    const [listInfo, setListInfo] = useState({
        id: state?.id || state?.watchlistId || null,
        name: state?.name || state?.nome || "Carregando...",
        description: state?.description || state?.descricao || "",
        games: state?.games || []
    });

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);

    const STATUS_OPTIONS = [
        { label: "Não Iniciado", value: "AINDA NAO JOGADO" },
        { label: "Concluído",    value: "JOGADO" }, 
        { label: "Abandonado",   value: "DROPADO" }
    ];

    const openPopup = () => setIsPopupOpen(true);
    const closePopup = () => {
        setIsPopupOpen(false);
        setSearchTerm("");
        setSearchResults([]); 
    };

    // --- HELPER: Refresh Data from Server ---
    const refreshList = async (id) => {
        if (!id) return;
        try {
            const rawData = await getWatchlistFull(id);
            const rawItems = rawData.jogos || rawData.games || [];

            const formattedGames = rawItems.map((item) => {
                const game = item.jogo || item; 
                if (!game) return null;

                let cover = game.cover?.url || game.cover_url || game.capa_url || game.url_capa || "";
                
                if (cover.startsWith("//")) cover = `https:${cover}`;
                
                if (cover.includes("t_thumb")) {
                    cover = cover.replace("t_thumb", "t_cover_big");
                }

                // 2. Return Formatted Object
                return {
                    id: game.id || game.id_jogo,
                    name: game.name || game.titulo,
                    cover_url: cover, 
                    rating: game.rating || game.total_rating || game.media || 0,
                    genres: (game.genres || game.generos || []).map(g => g.name || g.nome_genero || g),
                    status: item.status_jogo || "AINDA NAO JOGADO",
                    summary: game.summary || game.descricao || "",
                    screenshots: (game.screenshots || []).map(s => s.url || s),
                    release_date: game.first_release_date || item.data_lancamento,
                    involved_companies: game.involved_companies || [],
                    developer: game.desenvolvedora?.nome || "",
                    publisher: game.publicadora?.nome || ""
                };
            }).filter(Boolean);

            const formattedList = {
                id: rawData.id_watchlist || rawData.id,
                name: rawData.nome || rawData.name,
                description: rawData.descricao || rawData.description || "",
                games: formattedGames
            };
            
            setListInfo(formattedList);
        } catch (error) {
            console.error("Error refreshing list:", error);
        }
    };

    const handleStatusChange = async (gameId, newStatus) => {
        try {
            setListInfo(prev => ({
                ...prev,
                games: prev.games.map(g => 
                    String(g.id) === String(gameId) ? { ...g, status: newStatus } : g
                )
            }));

            await updateGameStatus(listInfo.id, gameId, newStatus);

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Erro ao atualizar status.");
            refreshList(listInfo.id); // Revert on error
        }
    };

    // --- EFFECT: Fetch on Mount ---
    useEffect(() => {
        if (listInfo.id) {
            refreshList(listInfo.id);
        }
    }, []); 

    // --- EFFECT: Search Logic ---
    useEffect(() => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                setIsSearching(true);
                const response = await searchGames(searchTerm); 
                
                let games = [];
                if (Array.isArray(response)) games = response;
                else if (Array.isArray(response.data)) games = response.data;
                else if (Array.isArray(response.results)) games = response.results;

                setSearchResults(games);
            } catch (error) {
                console.error("Error searching games:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // --- ACTION: Add Game ---
    const addGameToList = async (game) => {
        if (!listInfo.id) {
            alert("Erro: ID da lista não encontrado.");
            return;
        }
        try {
            setIsLoadingList(true);
            await addGameToWatchlist(listInfo.id, game.id);
            await refreshList(listInfo.id); 
            closePopup();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert(`"${game.name}" já está nesta lista!`);
            } else {
                console.error("Error adding game:", error);
                alert("Erro ao adicionar jogo.");
            }
        } finally {
            setIsLoadingList(false);
        }
    };

    if (!listInfo.id) {
        return <div className="p-20 text-white">Carregando lista...</div>;
    }

    return (
        <div className="p-10 min-h-screen bg-background">
            <HeaderUI />

            <div>
                <TypographyUI as="span" variant="titulo" className="block ml-64 mt-24 text-4xl">
                    {listInfo.name}
                </TypographyUI>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12 justify-items-center mt-10 ml-10">
                {listInfo.games.length === 0 && (
                     <TypographyUI variant="muted">Nenhum jogo adicionado.</TypographyUI>
                )}

                {listInfo.games.map((game, index) => (
                    <div key={`${game.id}-${index}`} className="relative group">
                        
                        <Link
                            to="/aboutGame"
                            state={{ infosGame: game }} 
                            className="block transform transition-transform duration-300 hover:scale-105"
                        >
                            <CardUI infosGame={game} />
                        </Link>

                        {/* --- STATUS DROPDOWN --- */}
                        <div className="absolute top-2 right-2 z-20">
                            <select
                                value={game.status}
                                onClick={(e) => e.preventDefault()} 
                                onChange={(e) => handleStatusChange(game.id, e.target.value)}
                                className={`
                                    appearance-none cursor-pointer text-[10px] font-bold py-1 px-2 rounded-md border shadow-sm outline-none text-center tracking-wide
                                    ${
                                      game.status === 'JOGADO' ? 'bg-green-600 border-green-500 text-white' : 
                                      game.status === 'DROPADO' ? 'bg-red-600 border-red-500 text-white' :
                                      // Default (AINDA NAO JOGADO)
                                      'bg-gray-800 border-gray-600 text-gray-300'
                                    }
                                `}
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-gray-900 text-gray-200">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                ))}
            </div>

            <div className="fixed top-[90%] right-10 z-50">
                <button onClick={openPopup} className="px-6 py-4 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary/80 flex items-center gap-2">
                    <span className="text-xl">+</span> Adicionar Jogo
                </button>
            </div>

            <Popup isOpen={isPopupOpen} onPopUpClick={closePopup} className="bg-background p-6 w-auto min-w-[600px] max-h-[70vh] overflow-y-auto">
                
            </Popup>
        </div>
    );
}