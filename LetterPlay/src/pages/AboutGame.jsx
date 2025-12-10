import React, { useState, useEffect } from "react";
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui/index";
import { useLocation } from "react-router-dom";
import iconStar from '/src/assets/Star.png';
import { addGameToFavorites, removeFromFavorites } from "../Scripts/api/watchListGameApi";

export function AboutGame() {
    const { state } = useLocation();

    const formatGameData = (data) => {
        if (!data) return null;

        let g = data.jogo || data;
        let status = data.status_jogo || null;

        const fixImg = (url) => {
            if (!url) return "";
            let clean = typeof url === 'string' ? url : url.url;
            if (clean?.startsWith("//")) clean = `https:${clean}`;
            return clean?.replace("t_thumb", "t_cover_big").replace("t_screenshot_med", "t_screenshot_big");
        };

        const getCompany = (role) => {
            if (g[role] && typeof g[role] === 'string') return g[role];
            
            if (role === 'developer' && g.desenvolvedora?.nome) return g.desenvolvedora.nome;
            if (role === 'publisher' && g.publicadora?.nome) return g.publicadora.nome;

            if (Array.isArray(g.involved_companies)) {
                const found = g.involved_companies.find(c => c[role]); 
                return found?.company?.name || found?.name || null;
            }
            return null;
        };

        return {
            id: g.id_jogo || g.id,
            name: g.titulo || g.name,
            summary: g.descricao || g.summary || "Sem descrição disponível.",
            rating: Math.round(g.nota_metacritic || g.rating || g.total_rating || 0),
            metacritic: g.nota_metacritic || g.metacritic || g.metacritic_rating || null,
            cover_url: fixImg(g.cover_url || g.cover || g.capa_url),
            screenshots: (g.screenshots || []).map(s => fixImg(s)),
            genres: (g.generos || g.genres || []).map(gen => 
                typeof gen === 'string' ? gen : (gen.nome_genero || gen.name)
            ),

            developer: getCompany("developer") || "Desconhecido",
            publisher: getCompany("publisher") || "Desconhecido",

            user_status: status,
            is_favorite: g.is_favorite || false,
            
            release_date: g.data_lancamento || g.first_release_date
        };
    };
    // --- 2. STATE ---
    const [gameDetails, setGameDetails] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // Popup States
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // --- 3. LOAD DATA ---
    useEffect(() => {
        const loadData = () => {
            let finalData = null;

            if (state?.infosGame) {
                finalData = formatGameData(state.infosGame);
                localStorage.setItem("currentGameCache", JSON.stringify(finalData));
            } else {
                const cached = localStorage.getItem("currentGameCache");
                if (cached) finalData = JSON.parse(cached);
            }

            if (finalData) {
                setGameDetails(finalData);
                setIsFavorite(finalData.is_favorite);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    // --- 4. FAVORITE LOGIC (Add & Remove) ---
    const toggleFavorite = async () => {
        if (!gameDetails?.id) return;
        
        const previousState = isFavorite;
        setIsFavorite(!previousState); 

        try {
            if (previousState) {
                await removeFromFavorites(gameDetails.id);
            } else {
                await addGameToFavorites(gameDetails.id);
            }
        } catch (error) { 
            console.error(error);
            setIsFavorite(previousState); 
            alert("Erro ao atualizar favoritos.");
        }
    };

    const abrirPopup = (img) => { setSelectedImage(img); setIsPopUpOpen(true); };
    const fecharPopup = () => { setIsPopUpOpen(false); };

    if (isLoading) return <div className="text-white p-20 text-center">Carregando...</div>;
    if (!gameDetails) return <div className="text-white text-center mt-20">Dados não encontrados.</div>;

    return (
        <div className="w-auto h-auto relative bg-background min-h-screen">
            <HeaderUI />

            {/* BACKGROUND */}
            <div className="absolute top-0 left-0 w-full h-[500px] z-0 overflow-hidden opacity-40">
                <div 
                    className="w-full h-full bg-cover bg-center blur-sm"
                    style={{ 
                        backgroundImage: `url(${gameDetails.cover_url})`,
                        maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)" 
                    }}
                ></div>
            </div>

            <div className="flex justify-center gap-24 px-10 relative z-10 pt-28">
                
                {/* LEFT: Images & Meta */}
                <div className="flex flex-col gap-6 w-96">
                    <div 
                        className="bg-cover bg-center h-[500px] w-full rounded-xl shadow-2xl border border-gray-800" 
                        style={{ backgroundImage: `url(${gameDetails.cover_url})` }}
                    ></div>

                    <div className="grid grid-cols-4 gap-2">
                        {gameDetails.screenshots?.slice(0, 4).map((shot, i) => (
                            <img 
                                key={i} src={shot} 
                                className="w-full h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 border border-gray-700" 
                                onClick={() => abrirPopup(shot)} 
                            />
                        ))}
                    </div>

                    <div className="bg-black/30 p-6 rounded-xl grid gap-3 backdrop-blur-sm border border-white/10">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Desenvolvedora</span>
                            <span className="text-white font-medium">{gameDetails.developer}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Publicadora</span>
                            <span className="text-white font-medium">{gameDetails.publisher}</span>
                        </div>
                        <div className="flex flex-col">
                        </div>
                    </div>
                </div>

                {/* RIGHT: Text & Actions */}
                <div className="flex flex-col w-[600px] mt-10">
                    <TypographyUI as="h1" variant="titulo" className="text-6xl leading-tight mb-2">
                        {gameDetails.name}
                    </TypographyUI>

                    {/* Status Badge */}
                    {gameDetails.user_status && gameDetails.user_status !== "AINDA NAO JOGADO" && (
                        <div className={`mb-4 px-3 py-1 rounded text-xs font-bold w-fit border uppercase tracking-wide
                            ${gameDetails.user_status === 'JOGADO' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}
                        `}>
                            {gameDetails.user_status}
                        </div>
                    )}

                    <TypographyUI as="span" variant="muted" className="text-xl mb-8 block">
                        {gameDetails.genres.join(", ")}
                    </TypographyUI>

                    <div className="bg-black/20 p-6 rounded-xl border border-white/5 mb-8">
                        <TypographyUI as="p" variant="default" className="text-lg leading-relaxed text-gray-200">
                            {gameDetails.summary}
                        </TypographyUI>
                    </div>

                    <div className="flex items-center gap-8 mb-12">
                        
                        {/* Star Rating */}
                        <div className="flex items-center gap-3 bg-primary/20 px-4 py-2 rounded-lg border border-primary/50">
                            <img src={iconStar} className="h-6 w-6" />
                            <span className="text-2xl font-bold text-white">{gameDetails.rating}</span>
                        </div>

                        {/* Metacritic Badge */}
                        {gameDetails.metacritic && (
                            <div className={`w-12 h-12 flex items-center justify-center rounded text-white text-xl font-bold border-2 border-white/10
                                ${gameDetails.metacritic >= 75 ? "bg-[#6c3]" : gameDetails.metacritic >= 50 ? "bg-[#fc3]" : "bg-[#f00]"}
                            `}>
                                {gameDetails.metacritic}
                            </div>
                        )}

                        {/* FAVORITE BUTTON */}
                        <button 
                            onClick={toggleFavorite} 
                            className={`group flex items-center gap-2 px-6 py-3 rounded-full transition-all border 
                                ${isFavorite 
                                    ? "bg-primary/20 border-primary text-primary hover:bg-primary/30" 
                                    : "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/10 text-gray-400 hover:text-white"
                                }`
                            }
                        >
                            {/* Heart Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isFavorite ? "fill-current" : "fill-none stroke-current"}`} viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="font-bold">
                                {isFavorite ? "Favorito" : "Adicionar aos Favoritos"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            <Popup isOpen={isPopUpOpen} onPopUpClick={fecharPopup} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
                <div className="relative">
                    <button onClick={fecharPopup} className="absolute -top-10 right-0 text-white text-xl">✕</button>
                    {selectedImage && <img src={selectedImage} className="max-h-[85vh] rounded-lg shadow-2xl" />}
                </div>
            </Popup>
        </div>
    );
}