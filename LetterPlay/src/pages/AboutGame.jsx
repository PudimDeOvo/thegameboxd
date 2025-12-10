import React, { useState, useEffect } from "react";
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui/index";
import { useLocation } from "react-router-dom";
import iconStar from '/src/assets/Star.png';
import { addGameToFavorites, removeFromFavorites } from "../Scripts/api/watchListGameApi";

// --- [NOVO] Imports para Avaliação ---
import { addReview, getAllReviews, deleteReview } from "../Scripts/api/reviewApi";
import { getAllUsers } from "../Scripts/api/userApi";

// --- [NOVO] Componente Visual de Estrelas ---
const StarRating = ({ rating, interactive = false, setRating = null }) => {
    return (
        <div className="flex cursor-pointer">
            {[1, 2, 3, 4, 5].map((star) => (
                <span 
                    key={star} 
                    onClick={() => interactive && setRating && setRating(star)}
                    className={`text-xl transition-colors ${interactive ? "hover:scale-110" : ""} ${star <= rating ? "text-yellow-400" : "text-gray-600"}`}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export function AboutGame() {
    const { state } = useLocation();

    // --- 1. DATA ADAPTER ---
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

    // --- [NOVO] States para Avaliação ---
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ nota: 5, comentario: "" });
    const [currentUser, setCurrentUser] = useState(null);
    const [usersMap, setUsersMap] = useState({}); // Mapa ID -> Nome
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

    // --- 3. EFEITOS E CARREGAMENTO ---
    
    // [NOVO] Carregar Usuário Logado e Lista de Usuários (para os nomes)
    useEffect(() => {
        const storedUser = localStorage.getItem("@LetterPlay:user"); // Ajuste a chave se for diferente
        if (storedUser) {
            try { setCurrentUser(JSON.parse(storedUser)); } catch (e) {}
        }

        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                const list = response.items || response || [];
                if (Array.isArray(list)) {
                    const map = {};
                    list.forEach(u => { if(u.id && u.username) map[u.id] = u.username; });
                    setUsersMap(map);
                }
            } catch (e) { console.error("Erro users map", e); }
        };
        fetchUsers();
    }, []);

    // Carregar Jogo
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
                // [NOVO] Carregar reviews assim que tiver o ID
                loadReviews(finalData.id);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    // --- 4. ACTIONS ---

    // [NOVO] Funções de Review
    const loadReviews = async (gameId) => {
        try {
            setIsLoadingReviews(true);
            const data = await getAllReviews(gameId);
            setReviews(data.items || []);
        } catch (error) {
            console.error("Erro ao buscar reviews", error);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const handlePostReview = async (e) => {
        e.preventDefault();
        if (!currentUser) return alert("Você precisa estar logado para avaliar.");
        if (!reviewForm.comentario.trim()) return alert("Escreva um comentário.");

        try {
            await addReview(gameDetails.id, reviewForm.nota, reviewForm.comentario);
            setReviewForm({ nota: 5, comentario: "" }); // Reset form
            loadReviews(gameDetails.id); // Reload list
            alert("Avaliação enviada!");
        } catch (error) {
            console.error(error);
            alert("Erro ao enviar avaliação.");
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Tem certeza que deseja apagar esta avaliação?")) return;
        try {
            await deleteReview(gameDetails.id, reviewId);
            loadReviews(gameDetails.id);
        } catch (error) {
            alert("Erro ao apagar avaliação.");
        }
    };

    // Favoritos (Mantido Original)
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
        <div className="w-auto h-auto relative bg-background min-h-screen pb-20">
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

            {/* =======================================================
                [NOVO] SEÇÃO DE AVALIAÇÕES
               ======================================================= */}
            <div className="max-w-5xl mx-auto px-10 border-t border-white/10 pt-10 mt-10">
                <TypographyUI as="h2" variant="titulo" className="text-3xl mb-8 text-white">
                    Avaliações da Comunidade
                </TypographyUI>

                {/* FORMULÁRIO DE NOVA AVALIAÇÃO */}
                {currentUser ? (
                    <div className="bg-black/30 p-6 rounded-xl border border-white/10 mb-10 backdrop-blur-md">
                        <h3 className="text-white text-xl font-semibold mb-4">Deixe sua avaliação</h3>
                        <form onSubmit={handlePostReview} className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span className="text-gray-300">Sua nota:</span>
                                <StarRating 
                                    rating={reviewForm.nota} 
                                    interactive={true} 
                                    setRating={(n) => setReviewForm({...reviewForm, nota: n})} 
                                />
                                <span className="text-white font-bold ml-2">{reviewForm.nota}/5</span>
                            </div>
                            <textarea
                                className="w-full bg-black/40 text-white rounded-lg p-3 border border-gray-700 focus:border-primary focus:outline-none resize-none h-24 placeholder-gray-500"
                                placeholder={`Comentando aqui`}
                                value={reviewForm.comentario}
                                onChange={(e) => setReviewForm({ ...reviewForm, comentario: e.target.value })}
                            />
                            <button type="submit" className="self-end bg-primary hover:bg-primary/80 text-white px-6 py-2 rounded-lg font-bold transition-all">
                                Publicar
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="p-6 mb-10 bg-white/5 border border-white/10 rounded-xl text-center text-gray-400">
                        Faça login para avaliar este jogo.
                    </div>
                )}

                {/* LISTA DE REVIEWS */}
                <div className="flex flex-col gap-4">
                    {isLoadingReviews ? (
                        <p className="text-gray-400 text-center">Carregando avaliações...</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-gray-500 italic text-center">Nenhuma avaliação ainda. Seja o primeiro!</p>
                    ) : (
                        reviews.map((review) => {
                            const authorName = usersMap[review.id_user] || `Usuário #${review.id_user}`;
                            const isMyReview = currentUser && (currentUser.id === review.id_user);

                            return (
                                <div key={review.id_avaliacao} className="bg-white/5 p-5 rounded-lg border border-white/5 flex justify-between items-start group hover:border-white/20 transition-all">
                                    <div className="w-full">
                                        <div className="flex items-center gap-3 mb-2">
                                            <StarRating rating={review.nota} />
                                            <span className="text-primary font-bold text-lg">{authorName}</span>
                                        </div>
                                        <p className="text-gray-200">{review.comentario}</p>
                                    </div>
                                    
                                    {isMyReview && (
                                        <button 
                                            onClick={() => handleDeleteReview(review.id_avaliacao)}
                                            className="ml-4 text-gray-500 hover:text-red-500 transition-colors"
                                            title="Excluir minha avaliação"
                                        >
                                            <span className="text-sm">Excluir</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {/* ======================================================= */}

            <Popup isOpen={isPopUpOpen} onPopUpClick={fecharPopup} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90">
                <div className="relative">
                    <button onClick={fecharPopup} className="absolute -top-10 right-0 text-white text-xl">✕</button>
                    {selectedImage && <img src={selectedImage} className="max-h-[85vh] rounded-lg shadow-2xl" />}
                </div>
            </Popup>
        </div>
    );
}