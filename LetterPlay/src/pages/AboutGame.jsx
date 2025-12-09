import React, { useState, useEffect } from "react";
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui/index";
import { useLocation } from "react-router-dom";
import iconStar from '/src/assets/Star.png';
import { searchGameById } from "../Scripts/api/searchApi";
import { addGameToFavorites, removeFromFavorites } from "../Scripts/api/watchListGameApi";
import { getWatchlistFull } from "../Scripts/api/watchListApi";

export function AboutGame() {
    const { state } = useLocation();
    
    const [gameDetails, setGameDetails] = useState(state?.infosGame || null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false); 
    
    // Popup States
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // --- 1. FETCH FULL DETAILS ON MOUNT ---
    useEffect(() => {
        const loadGameData = async () => {
            const gameId = gameDetails?.id || gameDetails?.id_jogo;

            if (!gameId) {
                setIsLoading(false);
                return;
            }

            try {
                const rawData = await searchGameById(gameId);

                // --- HELPER: Safe Image ---
                const cleanImageUrl = (img, size = "t_cover_big") => {
                    const url = img?.url || img || ""; 
                    if (typeof url !== "string") return "";
                    
                    let final = url;
                    if (final.startsWith("//")) final = `https:${final}`;
                    
                    if (final.includes("t_thumb") || final.includes("t_screenshot_med")) {
                        return final.replace(/t_\w+/, size);
                    }
                    return final;
                };

                // --- MAPPING LOGIC ---
                const formatted = {
                    ...gameDetails,
                    id: rawData.id || rawData.id_jogo,
                    name: rawData.name || rawData.titulo,
                    summary: rawData.summary || rawData.descricao || gameDetails?.summary,
                    
                    // Rating: Check 'metacritic_rating', 'rating', 'total_rating'
                    rating: rawData.metacritic_rating || rawData.rating || rawData.total_rating || gameDetails?.rating,
                    
                    // Cover
                    cover_url: cleanImageUrl(rawData.cover_url || rawData.cover || rawData.capa_url || gameDetails?.cover_url, "t_cover_big"),
                    
                    screenshots: (rawData.screenshots || []).map(s => cleanImageUrl(s, "t_screenshot_big")),
                    
                    genres: (rawData.genres || []).map(g => (typeof g === 'string' ? g : g.name || g.nome_genero)),
                    
                    developer: rawData.developer || 
                               rawData.desenvolvedora?.nome || 
                               rawData.involved_companies?.find(c => c.developer)?.company?.name || 
                               "Desconhecido",
                    
                    publisher: rawData.publisher || 
                               rawData.publicadora?.nome || 
                               rawData.involved_companies?.find(c => c.publisher)?.company?.name || 
                               "Desconhecido",
                };

                setGameDetails(formatted);

            } catch (error) {
                console.error("Error loading game details:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGameData();
    }, []);


    // --- 2. HANDLE FAVORITES ---
    const toggleFavorite = async () => {
        if (!gameDetails?.id) return;

        try {
            if (isFavorite) {
                await removeFromFavorites(gameDetails.id);
                setIsFavorite(false);
            } else {
                await addGameToFavorites(gameDetails.id);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Erro ao atualizar favoritos.");
        }
    };

    // --- POPUP HANDLERS ---
    const abrirPopup = (img) => {
        setSelectedImage(img);
        setIsPopUpOpen(true);
    };

    const fecharPopup = () => {
        setIsPopUpOpen(false);
        setSelectedImage(null);
    };

    // --- RENDER ---
    if (!gameDetails && !isLoading) {
        return (
            <div className="text-white text-2xl p-12 text-center">
                <HeaderUI />
                <div className="mt-20">Jogo não encontrado. Volte para a página inicial.</div>
            </div>
        );
    }

    if (!gameDetails) return <div className="text-white p-10">Carregando...</div>;

    return (
        <div className="w-auto h-auto relative bg-background min-h-screen">
            <HeaderUI />

            {/* BACKGROUND BLURRED IMAGE */}
            <div className="absolute top-0 left-0 w-full h-[500px] z-0 overflow-hidden opacity-40">
                <div 
                    className="w-full h-full bg-cover bg-center blur-sm"
                    style={{ 
                        backgroundImage: `url(${gameDetails.screenshots?.[0] || gameDetails.cover_url})`,
                        maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)" 
                    }}
                ></div>
            </div>

            <div className="flex justify-center gap-24 px-10 relative z-10 pt-28">
                
                {/* LEFT COLUMN: Cover & Info */}
                <div className="flex flex-col gap-6 w-96">
                    {/* Cover Image */}
                    <div 
                        id="coverGame" 
                        className="bg-cover bg-center h-[500px] w-full rounded-xl shadow-2xl border border-gray-800" 
                        style={{ backgroundImage: `url(${gameDetails.cover_url})` }}
                    ></div>

                    {/* Screenshots Grid */}
                    <div id="picturesGame" className="grid grid-cols-4 gap-2">
                        {gameDetails.screenshots?.slice(0, 4).map((shot, i) => (
                            <img 
                                key={i} 
                                src={shot} 
                                alt={`screenshot ${i}`} 
                                className="w-full h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-700" 
                                onClick={() => abrirPopup(shot)} 
                            />
                        ))}
                    </div>

                    {/* Meta Data */}
                    <div id="infosAdc" className="bg-black/30 p-6 rounded-xl grid gap-3 backdrop-blur-sm">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Desenvolvido por</span>
                            <span className="text-white font-medium">{gameDetails.developer || "-"}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Publicado por</span>
                            <span className="text-white font-medium">{gameDetails.publisher || "-"}</span>
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Plataformas</span>
                            <span className="text-white text-sm">{gameDetails.platforms || "-"}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Title, Summary, Actions */}
                <div className="flex flex-col w-[600px] mt-10">
                    
                    {/* Title */}
                    <TypographyUI as="h1" variant="titulo" className="text-6xl leading-tight mb-2">
                        {gameDetails.name}
                    </TypographyUI>

                    {/* Genres */}
                    <TypographyUI as="span" variant="muted" className="text-xl mb-8 block">
                        {gameDetails.genres && gameDetails.genres.length > 0 ? gameDetails.genres.join(", ") : "Sem gênero"}
                    </TypographyUI>

                    {/* Summary */}
                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 mb-8">
                        <TypographyUI as="p" variant="default" className="text-lg leading-relaxed text-gray-200">
                            {gameDetails.summary || "Sem descrição disponível."}
                        </TypographyUI>
                    </div>

                    {/* Rating & Favorite */}
                    <div className="flex items-center gap-8">
                        {/* Rating Badge */}
                        <div className="flex items-center gap-3 bg-primary/20 px-4 py-2 rounded-lg border border-primary/50">
                            <img src={iconStar} alt="Star" className="h-6 w-6" />
                            <span className="text-2xl font-bold text-white">
                                {gameDetails.metacritic_rating ? Math.round(gameDetails.rating) : "-"}
                            </span>
                        </div>

                        {/* Favorite Button */}
                        <button
                            onClick={toggleFavorite}
                            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-primary/20 transition-all border border-white/10 hover:border-primary/50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className={`h-8 w-8 transition-colors ${isFavorite ? "text-primary fill-primary" : "text-gray-400 fill-none group-hover:text-primary"}`}
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className={`${isFavorite ? "text-primary" : "text-gray-400 group-hover:text-white"}`}>
                                {isFavorite ? "Favorito" : "Adicionar aos Favoritos"}
                            </span>
                        </button>
                    </div>

                </div>
            </div>

            {/* POPUP IMAGE */}
            <Popup
                isOpen={isPopUpOpen}
                onPopUpClick={fecharPopup}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
                <div className="relative max-w-[90vw] max-h-[90vh]">
                    <button
                        onClick={fecharPopup}
                        className="absolute -top-12 right-0 text-white text-xl hover:text-primary transition-colors"
                    >
                        ✕ Fechar
                    </button>

                    {selectedImage && (
                        <img
                            src={selectedImage.replace("t_screenshot_big", "t_1080p")} 
                            alt="Imagem ampliada"
                            className="max-h-[85vh] w-auto rounded-lg shadow-2xl"
                        />
                    )}
                </div>
            </Popup>
        </div>
    );
}