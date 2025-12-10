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

export function getWeeklyRanking() {
  return api.get('/watchlists/ranking/top-melhores')
    .then((r) => r.data);
}

export async function getFavorites() {
  try {
      const myLists = await getMyWatchlists();
      
      const favListSummary = myLists.find(l => 
          l.nome.toLowerCase() === "favoritos" || 
          l.nome.toLowerCase() === "favorites"
      );

      if (!favListSummary) {
          console.warn("Lista de Favoritos não encontrada.");
          return [];
      }

      const fullList = await getWatchlistFull(favListSummary.id_watchlist || favListSummary.id);
      
      return fullList.jogos || fullList.games || [];

  } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      return [];
  }
}

export async function getPlayedGames() {
  try {
      const myLists = await getMyWatchlists();
      
      const allListsDetails = await Promise.all(
          myLists.map(list => 
              getWatchlistFull(list.id_watchlist || list.id)
          )
      );

      const playedGames = [];
      const seenGameIds = new Set(); 

      allListsDetails.forEach(list => {
          const games = list.jogos || list.games || [];
          
          games.forEach(item => {

              if (item.status_jogo === "JOGADO") {
                  const gameId = item.jogo?.id_jogo || item.id;
                  if (!seenGameIds.has(gameId)) {
                      seenGameIds.add(gameId);
                      playedGames.push(item); 
                  }
              }
          });
      });

      return playedGames;

  } catch (error) {
      console.error("Erro ao buscar jogos jogados:", error);
      return [];
  }
}