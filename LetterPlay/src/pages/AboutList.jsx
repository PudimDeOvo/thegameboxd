import { searchGames } from "../Scripts/api/searchApi";
import { addGameToWatchlist, updateGameStatus, removeGame } from "../Scripts/api/watchListGameApi";
import { getWatchlistFull, deleteWatchlist } from "../Scripts/api/watchListApi";
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom"; 
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui";
import CardUI from "../Scripts/ui/CardUI";

export default function AboutList() {
    const { state } = useLocation();
    const navigate = useNavigate(); 

    // Initialize State
    const [listInfo, setListInfo] = useState({
        id: state?.id || state?.watchlistId || null,
        name: state?.name || state?.nome || "Carregando...",
        games: state?.games || []
    });

    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingList, setIsLoadingList] = useState(false);

    // Exact Values from Swagger
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

    // --- HELPER: Refresh Data ---
    const refreshList = async (id) => {
        if (!id) return;
        try {
            const rawData = await getWatchlistFull(id);
            // In your JSON, the array is inside 'jogos'
            const rawItems = rawData.jogos || rawData.games || [];

            const formattedGames = rawItems.map((item) => {
                const game = item.jogo || item; 
                if (!game) return null;

                let cover = game.cover_url || game.cover?.url || game.capa_url || "";
                if (cover.startsWith("//")) cover = `https:${cover}`;
                if (cover.includes("t_thumb")) cover = cover.replace("t_thumb", "t_cover_big");

                return {
                    // 1. NAVIGATION ID: Use IGDB ID (e.g., 26192) so AboutGame loads the right data
                    id: game.id_igdb || game.id, 

                    // 2. LOCAL ID: Use Database ID (e.g., 3) for Delete/Update
                    local_id: game.id_jogo || game.id,

                    name: game.titulo || game.name, // Mapped from 'titulo'
                    cover_url: cover, 
                    
                    // Ratings & Metacritic
                    rating: game.nota_usuario || game.rating || 0,
                    metacritic: game.nota_metacritic || game.metacritic_rating || null,

                    genres: (game.generos || game.genres || []).map(g => g.nome_genero || g.name || g),
                    
                    status: item.status_jogo || "AINDA NAO JOGADO",
                    
                    summary: game.descricao || game.summary || "",
                    developer: game.desenvolvedora?.nome || "Desconhecido",
                    publisher: game.publicadora?.nome || "Desconhecido",
                    screenshots: (game.screenshots || []).map(s => s.url || s),
                };
            }).filter(Boolean);
                
            setListInfo({
                id: rawData.id_watchlist || rawData.id,
                name: rawData.nome || rawData.name,
                description: rawData.descricao || rawData.description || "",
                games: formattedGames
            });
        } catch (error) {
            console.error("Error refreshing list:", error);
        }
    };

    // --- ACTION: Update Status ---
    const handleStatusChange = async (gameId, newStatus) => {
        // Find the game to get its Local ID
        const game = listInfo.games.find(g => String(g.id) === String(gameId));
        // Fallback to gameId if local_id is missing, but local_id is preferred
        const idToUse = game?.local_id || gameId;

        try {
            // Optimistic Update
            setListInfo(prev => ({
                ...prev,
                games: prev.games.map(g => 
                    String(g.id) === String(gameId) ? { ...g, status: newStatus } : g
                )
            }));
            
            // Call API with LOCAL ID
            await updateGameStatus(listInfo.id, idToUse, newStatus);
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Erro ao atualizar status.");
            refreshList(listInfo.id); 
        }
    };

    // --- ACTION: Remove Game from List ---
    const handleRemoveGame = async (gameId) => {
        if (!window.confirm("Tem certeza que deseja remover este jogo da lista?")) return;
        
        const game = listInfo.games.find(g => String(g.id) === String(gameId));
        const idToUse = game?.local_id || gameId;

        try {
            setListInfo(prev => ({
                ...prev,
                games: prev.games.filter(g => String(g.id) !== String(gameId))
            }));

            // Call API with LOCAL ID
            await removeGame(listInfo.id, idToUse);
        } catch (error) {
            console.error("Error removing game:", error);
            alert("Erro ao remover jogo.");
            refreshList(listInfo.id); 
        }
    };

    // --- ACTION: Delete Entire List ---
    const handleDeleteList = async () => {
        const confirmDelete = window.confirm(
            `Tem certeza que deseja excluir a lista "${listInfo.name}"? Esta ação não pode ser desfeita.`
        );

        if (confirmDelete) {
            try {
                await deleteWatchlist(listInfo.id);
                navigate("/perfil"); 
            } catch (error) {
                console.error("Error deleting watchlist:", error);
                alert("Erro ao excluir a lista.");
            }
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        if (listInfo.id) refreshList(listInfo.id);
    }, []); 

    // Search Effect ...
    useEffect(() => {
        if (!searchTerm.trim()) { setSearchResults([]); return; }
        const delayDebounceFn = setTimeout(async () => {
            try {
                setIsSearching(true);
                const response = await searchGames(searchTerm); 
                let games = [];
                if (Array.isArray(response)) games = response;
                else if (Array.isArray(response.data)) games = response.data;
                else if (Array.isArray(response.results)) games = response.results;
                setSearchResults(games);
            } catch (error) { setSearchResults([]); } finally { setIsSearching(false); }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Add Game Action (Uses IGDB ID because search results come from IGDB)
    const addGameToList = async (game) => {
        if (!listInfo.id) return;
        try {
            setIsLoadingList(true);
            await addGameToWatchlist(listInfo.id, game.id);
            await refreshList(listInfo.id); 
            closePopup();
        } catch (error) {
            if (error.response && error.response.status === 409) {
                alert(`"${game.name}" já está nesta lista!`);
            } else {
                console.error(error);
                alert("Erro ao adicionar jogo.");
            }
        } finally {
            setIsLoadingList(false);
        }
    };

    if (!listInfo.id) return <div className="p-20 text-white">Carregando lista...</div>;

    return (
        <div className="p-10 min-h-screen bg-background relative">
            <HeaderUI />

            {/* HEADER SECTION */}
            <div className="flex flex-col items-center mt-24 relative">
                <div className="flex items-center gap-6">
                    <TypographyUI as="span" variant="titulo" className="text-4xl">
                        {listInfo.name}
                    </TypographyUI>

                    {/* DELETE LIST BUTTON */}
                    <button 
                        onClick={handleDeleteList}
                        className="bg-red-600/20 hover:bg-red-600 p-2 rounded-lg transition-colors group"
                        title="Excluir Lista"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* GAMES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-12 justify-items-center mt-12 ml-10">
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
                            {/* CardUI will automatically pick up 'metacritic' from game object */}
                            <CardUI infosGame={game} />
                        </Link>

                        {/* --- REMOVE GAME BUTTON --- */}
                        <button
                            onClick={(e) => {
                                e.preventDefault(); 
                                handleRemoveGame(game.id); // Uses ID to find the game, then uses local_id
                            }}
                            className="absolute top-2 left-2 z-20 bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover jogo da lista"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

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

            {/* Floating Add Button */}
            <div className="fixed top-[90%] right-10 z-50">
                <button onClick={openPopup} className="px-6 py-4 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-primary/80 flex items-center gap-2">
                    <span className="text-xl">+</span> Adicionar Jogo
                </button>
            </div>

            {/* Search Popup */}
            <Popup isOpen={isPopupOpen} onPopUpClick={closePopup} className="bg-background p-6 w-auto min-w-[600px] max-h-[70vh] overflow-y-auto">
                <button onClick={closePopup} className="absolute top-3 right-3 text-white p-2 rounded-lg hover:bg-black/60">✕</button>
                <TypographyUI variant="titulo" className="text-2xl mb-6">Adicionar Jogo</TypographyUI>
                <input
                    className="w-full rounded-lg h-12 px-4 bg-gray-800 text-white border border-gray-600 focus:border-primary outline-none"
                    placeholder="Digite o nome do jogo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                <div className="mt-4">
                    {isSearching && <p className="text-primary">Pesquisando...</p>}
                    {isLoadingList && <p className="text-primary">Adicionando...</p>}
                </div>
                <div className="grid gap-3 mt-6">
                    {searchResults.map((game, index) => {
                        const isAdded = listInfo.games.some(g => Number(g.id) === Number(game.id));
                        let cover = game.cover_url || game.cover?.url || "";
                        if (cover.startsWith("//")) cover = `https:${cover}`;
                        return (
                            <button
                                key={`${game.id}-${index}`}
                                disabled={isLoadingList || isAdded}
                                onClick={() => addGameToList(game)}
                                className={`flex items-center gap-4 p-3 rounded-lg text-left transition-colors border border-transparent
                                    ${isAdded ? "bg-gray-800 opacity-60 cursor-not-allowed" : "bg-gray-800 hover:border-primary hover:bg-gray-700"}
                                `}
                            >
                                {cover ? (
                                    <img src={cover} alt="" className="w-12 h-16 object-cover rounded bg-black" />
                                ) : (
                                    <div className="w-12 h-16 bg-black rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                                )}
                                <div>
                                    <div className="font-bold text-white">{game.name}</div>
                                    {isAdded && <div className="text-green-500 text-xs font-bold uppercase">✔ Adicionado</div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Popup>
        </div>
    );
}