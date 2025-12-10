import api from "./api";

export async function addGameToFavoritos(watchlistId, gameId) {
    try {
        const response = await api.post(`/watchlists/favoritos/adicionar-jogo`, {
            watchlist_id: watchlistId,
            game_id: gameId
        });

        return response.data;
    } catch (error) {
        console.error("Erro ao adicionar jogo aos favoritos:", error);
        throw error;
    }
}

export async function removeGameFromFavoritos(gameId) {
    try {
        const response = await api.delete(`/watchlists/favoritos/remover-jogo/${gameId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao remover jogo dos favoritos:", error);
        throw error;
    }
}

export async function getAllUsers() {
  return api
    .get(`/users/todos`)
    .then((r) => r.data);
}

