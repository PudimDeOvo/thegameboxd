import React, { useState, useEffect } from "react";
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui/index";
import { useLocation } from "react-router-dom";
import iconStar from '/src/assets/Star.png';

// Imports - API calls for favorites only (Search removed)
import { addGameToFavorites, removeFromFavorites } from "../Scripts/api/watchListGameApi";

export function AboutGame() {
    const { state } = useLocation();

    // --- 1. DATA ADAPTER ---
    const formatGameData = (data) => {
        if (!data) return null;

        console.log("Raw Data received in AboutGame:", data); // CHECK THIS IN CONSOLE (F12)

        // 1. Determine if we have nested "jogo" object (from Watchlist JSON)
        // or if we have a flat object (from AboutList formatted state)
        let g = data;
        let status = data.status_jogo || null;

        if (data.jogo) {
            g = data.jogo; // Unwrap if nested
        }

        // Helper for images
        const fixImg = (url) => {
            if (!url) return "";
            let clean = typeof url === 'string' ? url : url.url;
            if (clean?.startsWith("//")) clean = `https:${clean}`;
            return clean?.replace("t_thumb", "t_cover_big").replace("t_screenshot_med", "t_screenshot_big");
        };

        return {
            id: g.id_jogo || g.id,
            name: g.titulo || g.name,
            summary: g.descricao || g.summary || "Sem descrição disponível.",
            rating: Math.round(g.nota_metacritic || g.rating || g.total_rating || 0),
            cover_url: fixImg(g.cover_url || g.cover || g.capa_url),
            screenshots: (g.screenshots || []).map(s => fixImg(s)),
            genres: (g.generos || g.genres || []).map(gen => 
                typeof gen === 'string' ? gen : (gen.nome_genero || gen.name)
            ),

            // --- DEVELOPER / PUBLISHER FIX ---
            // We check: 
            // 1. Nested Object (desenvolvedora.nome) -> Common in Watchlist JSON
            // 2. Flat String (developer) -> Common in Formatted List
            developer: g.desenvolvedora?.nome || g.developer || "Desconhecido",
            publisher: g.publicadora?.nome || g.publisher || "Desconhecido",

            user_status: status,
            is_favorite: g.is_favorite || false
        };
    };

    // --- 2. STATE ---
    const [gameDetails, setGameDetails] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // --- 3. LOAD DATA (No API Call for Info) ---
    useEffect(() => {
        const loadData = () => {
            let finalData = null;

            // Scenario A: Coming from List
            if (state?.infosGame) {
                finalData = formatGameData(state.infosGame);
                localStorage.setItem("currentGameCache", JSON.stringify(finalData));
            } 
            // Scenario B: Page Refresh (Read Cache)
            else {
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

    // --- 4. FAVORITE LOGIC ---
    const toggleFavorite = async () => {
        if (!gameDetails) return;
        const prev = isFavorite;
        setIsFavorite(!prev);
        try {
            if (prev) await removeFromFavorites(gameDetails.id);
            else await addGameToFavorites(gameDetails.id);
        } catch (e) { 
            setIsFavorite(prev); 
            // alert("Erro ao favoritar."); // Optional: remove alert if annoying
        }
    };

    const abrirPopup = (img) => { setSelectedImage(img); setIsPopUpOpen(true); };
    const fecharPopup = () => { setIsPopUpOpen(false); };

    if (isLoading) return <div className="text-white p-20 text-center">Carregando...</div>;
    
    if (!gameDetails) {
        return (
            <div className="text-white text-2xl p-12 text-center">
                <HeaderUI />
                <div className="mt-20">Dados não encontrados.</div>
            </div>
        );
    }

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

                    {/* Developer/Publisher Info */}
                    <div className="bg-black/30 p-6 rounded-xl grid gap-3 backdrop-blur-sm">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Desenvolvedora</span>
                            <span className="text-white font-medium">{gameDetails.developer}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Publicadora</span>
                            <span className="text-white font-medium">{gameDetails.publisher}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Text & Actions */}
                <div className="flex flex-col w-[600px] mt-10">
                    <TypographyUI as="h1" variant="titulo" className="text-6xl leading-tight mb-2">
                        {gameDetails.name}
                    </TypographyUI>

                    {/* Status Badge */}
                    {gameDetails.user_status && (
                        <div className={`
                            mb-6 px-4 py-1 rounded text-sm font-bold w-fit uppercase tracking-wider
                            ${gameDetails.user_status === 'JOGADO' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 
                              gameDetails.user_status === 'DROPADO' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 
                              'bg-gray-500/20 text-gray-400 border border-gray-500/50'}
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
                        <div className="flex items-center gap-3 bg-primary/20 px-4 py-2 rounded-lg border border-primary/50">
                            <img src={iconStar} className="h-6 w-6" />
                            <span className="text-2xl font-bold text-white">{gameDetails.rating}</span>
                        </div>

                        <button
                            onClick={toggleFavorite}
                            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-primary/20 transition-all border border-white/10"
                        >
                            <span className={isFavorite ? "text-primary font-bold" : "text-gray-400"}>
                                {isFavorite ? "★ Favorito" : "☆ Adicionar aos Favoritos"}
                            </span>
                        </button>
                    </div>
                    
                    {/* REVIEWS COMMENTED OUT AJDJASOID HERE
                    */}
                    {/* <div className="border-t border-white/10 pt-8 pb-20">
                        <TypographyUI variant="titulo" className="text-3xl mb-6">Avaliações</TypographyUI>
                        ...
                    </div> 
                    */}

                </div>
            </div>

            <Popup
                isOpen={isPopUpOpen}
                onPopUpClick={fecharPopup}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            >
                <div className="relative">
                    <button onClick={fecharPopup} className="absolute -top-10 right-0 text-white text-xl">✕</button>
                    {selectedImage && <img src={selectedImage} className="max-h-[85vh] rounded-lg shadow-2xl" />}
                </div>
            </Popup>
        </div>
    );
}