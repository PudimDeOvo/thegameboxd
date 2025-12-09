import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom"; 
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui";
import CardUI from "../Scripts/ui/CardUI";
import { searchGames } from "../Scripts/api/searchApi";
import { addGameToWatchlist } from "../Scripts/api/watchListGameApi";
import { getWatchlistFull } from "../Scripts/api/watchListApi";

export default function AboutList() {
    const { state } = useLocation();

    const [listInfo, setListInfo] = useState({
        id: state?.id || state?.watchlistId || null, 
        name: state?.name || state?.nome || "Carregando...",
        games: state?.games || []
    });

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    
    // Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);

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
            
            console.log("Raw JSON:", rawData);

            const rawItems = rawData.jogos || [];

            const formattedGames = rawItems.map((item) => {
                
                const gameData = item.jogo; 
                
                if (!gameData) return null;

                const genres = (gameData.generos || []).map(g => g.nome_genero);

                return {
                    id: gameData.id_jogo,
                    name: gameData.titulo,
                    summary: gameData.descricao,
                    cover_url: gameData.capa_url || gameData.url_capa || "",
                    genres: genres,
                    rating: gameData.nota_metacritic || gameData.media_geral || 0,
                    developer: gameData.desenvolvedora?.nome || "",
                    status: item.status_jogo 
                };
            }).filter(Boolean); // Remove any null items

            const formattedList = {
                id: rawData.id_watchlist,
                name: rawData.nome,
                description: rawData.descricao || "", 
                games: formattedGames
            };
            
            setListInfo(formattedList);

        } catch (error) {
            console.error("Error refreshing list:", error);
        }
    };

    // runs immediately when the page loads/reloads
    useEffect(() => {
        if (listInfo.id) {
            refreshList(listInfo.id);
        }
    }, []); // Empty dependency array = runs once on mount


    // --- Search Logic (Debounce) ---
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
                if (Array.isArray(response)) {
                    games = response;
                } else if (response && Array.isArray(response.data)) {
                    games = response.data;
                } else if (response && Array.isArray(response.results)) {
                    games = response.results;
                }

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


    // --- Add Game Logic ---
    const addGameToList = async (game) => {
        if (!listInfo.id) {
            alert("Erro: ID da lista não encontrado.");
            return;
        }

        try {
            setIsLoadingList(true);
            await addGameToWatchlist(listInfo.id, game.id);
            await refreshList(listInfo.id); // Update UI
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

    // --- 3. FAILSAFE: If no ID found (e.g. hard reload cleared state) ---
    if (!listInfo.id) {
        return (
            <div className="p-20 text-center">
                <TypographyUI variant="title" className="text-red-500">
                    Lista não encontrada.
                </TypographyUI>
                <Link to="/watchlists" className="text-primary underline mt-4 block">
                    Voltar para minhas listas
                </Link>
            </div>
        );
    }

    return (
        <div className="p-10">
            <HeaderUI />

            {/* List Header */}
            <div>
                <TypographyUI
                    as="span"
                    variant="titulo"
                    className="block ml-64 mt-24 text-4xl"
                >
                    {listInfo.name}
                </TypographyUI>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-4 gap-10 mt-10 ml-32">
                {listInfo.games.length === 0 && (
                    <TypographyUI variant="muted">
                        Nenhum jogo adicionado.
                    </TypographyUI>
                )}

                {listInfo.games.map((game, index) => (
                    // Uses ID + Index for unique key
                    <CardUI key={`${game.id}-${index}`} infosGame={game} />
                ))}
            </div>

            {/* Floating Button */}
            <div className="fixed top-[95%] -translate-y-1/2 right-10 z-50">
                <button
                    onClick={openPopup}
                    className="px-5 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/60 transition-all"
                >
                    + Add Game
                </button>
            </div>

            {/* Popup */}
            <Popup
                isOpen={isPopupOpen}
                onPopUpClick={closePopup}
                className="bg-background p-6 w-auto min-w-[500px] max-h-[600px] overflow-y-auto"
            >
                <button
                    onClick={closePopup}
                    className="absolute top-3 right-3 text-white p-2 rounded-lg hover:bg-black/60"
                >
                    ✕
                </button>

                <TypographyUI variant="titulo" className="text-2xl mb-6">
                    Select a Game
                </TypographyUI>

                {/* Search Bar */}
                <div id="divBarraPesquisa" className="mt-12">
                    <input
                        className="rounded-full w-96 h-10 px-4 bg-gray-300 mt-2 text-black focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Digite para pesquisar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
                
                <div className="mt-4 min-h-[20px]">
                    {isSearching && <p className="text-primary text-sm">Pesquisando...</p>}
                    {isLoadingList && <p className="text-primary text-sm">Adicionando jogo...</p>}
                </div>

                <div className="grid gap-4 mt-8">
                    {searchResults.map((game, index) => {
                        const isAlreadyAdded = listInfo.games.some(
                            (savedGame) => Number(savedGame.id) === Number(game.id)
                        );
                        
                        const coverImage = game.cover?.url || game.cover_url || game.cover || "";
                        const finalCover = coverImage.startsWith("//") ? `https:${coverImage}` : coverImage;

                        return (
                            <button
                                key={`${game.id}-${index}`}
                                disabled={isLoadingList || isAlreadyAdded}
                                onClick={() => addGameToList(game)}
                                className={`p-4 rounded-lg text-left flex items-center gap-4 transition-colors 
                                    ${isAlreadyAdded 
                                        ? "bg-gray-600 opacity-50 cursor-not-allowed" 
                                        : "bg-primary hover:bg-primary/40"
                                    }`}
                            >
                                {finalCover ? (
                                    <img 
                                        src={finalCover} 
                                        alt="" 
                                        className="w-12 h-16 object-cover rounded bg-black/50" 
                                    />
                                ) : (
                                    <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-400">
                                        N/A
                                    </div>
                                )}
                                
                                <div className="flex flex-col">
                                    <TypographyUI as="span" variant="default" className="text-sm font-bold text-white">
                                        {game.name || game.titulo || "Sem Nome"}
                                    </TypographyUI>
                                    
                                    {isAlreadyAdded && (
                                        <span className="text-xs text-green-400 font-bold uppercase mt-1">
                                            ✔ Já na lista
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Popup>
        </div>
    );
}