// Scripts/utils/gameMapper.js

export const formatGameData = (data) => {
    if (!data) return null;

    // Handle nested "jogo" object if it comes from a watchlist response
    const game = data.jogo || data;

    // Helper to fix image URLs (HTTPS and Size)
    const cleanImage = (img, size = "t_cover_big") => {
        if (!img) return "";
        let url = typeof img === "string" ? img : img.url || "";
        if (!url) return "";
        
        if (url.startsWith("//")) url = `https:${url}`;
        if (url.includes("t_thumb")) url = url.replace("t_thumb", size);
        if (url.includes("t_screenshot_med")) url = url.replace("t_screenshot_med", size);
        
        return url;
    };

    return {
        // IDs
        id: game.id || game.id_jogo,
        
        // Basic Info
        name: game.name || game.titulo || "Nome Indisponível",
        summary: game.summary || game.descricao || "Sem descrição.",
        
        // Dates & Ratings
        release_date: game.first_release_date || game.data_lancamento,
        rating: Math.round(game.rating || game.total_rating || game.metacritic_rating || game.media || 0),
        
        // Images
        cover_url: cleanImage(game.cover || game.cover_url || game.capa_url || game.url_capa, "t_cover_big"),
        screenshots: (game.screenshots || []).map(s => cleanImage(s, "t_screenshot_big")),
        
        // Genres (Handle Array of Objects OR Array of Strings)
        genres: (game.genres || game.generos || []).map(g => {
            if (typeof g === 'string') return g;
            return g.name || g.nome_genero;
        }).filter(Boolean),

        // Companies
        developer: game.developer || 
                   game.desenvolvedora?.nome || 
                   game.involved_companies?.find(c => c.developer)?.company?.name || 
                   "Desconhecido",
                   
        publisher: game.publisher || 
                   game.publicadora?.nome || 
                   game.involved_companies?.find(c => c.publisher)?.company?.name || 
                   "Desconhecido",

        // Status (Only if coming from a list)
        status: data.status_jogo || null
    };
};