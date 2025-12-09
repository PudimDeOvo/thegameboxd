import api from "./api";

export function addGameToWatchlist(watchlist_id, igdb_game_id) {
  return api
    .post(`/watchlists/games/adicionar/${watchlist_id}`, {
      igdb_game_id,
    })
    .then((r) => r.data);
}

export function removeGame(watchlist_id, game_id) {
  return api
    .delete(`/watchlists/${watchlist_id}/games/${game_id}`)
    .then((r) => r.data);
}

export function removeFromFavorites(game_id) {
  return api
    .delete(`/watchlists/favoritos/remover-jogo/${game_id}`)
    .then((r) => r.data);
}

export function addGameToFavorites(igdb_game_id) {
  return api.post("/watchlists/favoritos/adicionar-jogo", {
      igdb_game_id
  }).then((r) => r.data);
}

export function getMyReviews() {
  return api.get("/watchlists/minhas-reviews").then((r) => r.data);
}

export function updateGameStatus(watchlist_id, game_id, status_value) {
  return api
    .patch(`/watchlists/${watchlist_id}/games/${game_id}/status`, {
      new_status: status_value 
    })
    .then((r) => r.data);
}
