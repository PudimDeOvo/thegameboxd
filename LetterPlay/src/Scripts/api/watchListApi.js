import api from "./api";

export function createWatchlist(nome) {
  return api.post('/watchlists/criar-watchlist/', { nome })
    .then(r => r.data);
}

export function getMyWatchlists() {
  return api.get('/watchlists/minhas-watchlists-ids')
    .then(r => r.data);
}

export function getWatchlistFull(watchlist_id) {
  return api.get(`/watchlists/todas-informacoes-watchlist/${watchlist_id}`)
    .then(r => r.data);
}

export function deleteWatchlist(watchlist_id) {
  return api.delete(`/watchlists/${watchlist_id}`)
    .then(r => r.data);
}

export function globalRanking(page = 1, limit = 20) {
  return api
    .get("/watchlists/games/ranking-global-igdb", {
      params: { page, limit },
    })
    .then((r) => r.data);
}