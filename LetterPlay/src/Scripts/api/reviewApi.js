import api from "./api";

export function addReview(game_id, nota, comentario) {
  return api
    .post(`/watchlists/games/reviews/${game_id}`, {
      nota: Number(nota),
      comentario,
    })
    .then((r) => r.data);
}

export function getAllReviews(game_id) {
  return api
    .get(`/watchlists/games/all-reviews/${game_id}`)
    .then((r) => r.data);
}

export function deleteReview(game_id, review_id) {
  return api
    .delete(`/watchlists/games/${game_id}/reviews/${review_id}`)
    .then((r) => r.data);
}
