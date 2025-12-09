import api from "./api";

export function searchGames(query, page = 1, limit = 20) {
  return api
    .get(`/watchlists/pesquisar-jogos-igdb`, {
      params: { query, page, limit },
    })
    .then((r) => r.data);
}

export function searchGameById(igdb_game_id) {
  return api
    .get(`/watchlists/pesquisar-jogo-id-igdb/${igdb_game_id}`)
    .then((r) => r.data);
}

export function searchByGenre(genre_name, page = 1, limit = 20) {
  return api
    .get(`/watchlists/games/por-genero/${genre_name}`, {
      params: { page, limit },
    })
    .then((r) => r.data);
}

export function globalRanking(page = 1, limit = 20) {
  return api
    .get(`/watchlists/games/ranking-global-igdb`, {
      params: { page, limit },
    })
    .then((r) => r.data);
}

export function weeklyTopRanking() {
  return api
    .get(`/watchlists/ranking/top-melhores`)
    .then((r) => r.data);
}
