import { getMyWatchlists, getWatchlistFull, createWatchlist } from "../api/watchListApi";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CardUI, TypographyUI, Popup } from "../ui";
import bttAdd from "/src/assets/bttAdicionar.png";

function ShowLists() {

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [listName, setListName] = useState("");
  

  const [lists, setLists] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);


  const openPopup = () => setIsPopupOpen(true);
  
  const closePopup = () => {
    setIsPopupOpen(false);
    setListName("");
  };


  useEffect(() => {
    async function fetchLists() {
      try {
        setIsLoading(true);
        const fullLists = await getMyWatchlists();

        const formatted = fullLists.map((list) => ({
          id: list.id_watchlist,
          name: list.nome,
          description: list.descricao || "", 
          games: (list.jogos || []).map((game) => ({
            id: game.id_jogo,
            name: game.titulo,
            summary: game.descricao,
            cover_url: game.capa_url,
            genres: game.generos?.map((g) => g.nome_genero) || [],
            rating: game.media,
            developer: game.desenvolvedora?.nome || "",
            publisher: game.publicadora?.nome || ""
          }))
        }));

        setLists(formatted);
      } catch (error) {
        console.error("Error fetching lists:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLists();
  }, []);


  const saveList = async () => {
    if (!listName.trim()) return;

    try {
      const response = await createWatchlist(listName);
      const newList = {
        id: response.id_watchlist || response.id || Date.now(), 
        name: listName,
        games: [] 
      };

      setLists([...lists, newList]);
      closePopup();

    } catch (error) {
      console.error("Error creating list:", error);
      alert("Failed to create list");
    }
  };

  return (
    <div>
      {isLoading && <div className="text-white p-10">Carregando...</div>}

      <div id="sectionCards" className="flex flex-wrap gap-16 p-10 m-24">
        

        <div
          onClick={openPopup}
          className="h-96 w-72 bg-black/60 rounded-xl hover:bg-primary/50 cursor-pointer flex flex-col items-center justify-center text-center gap-4 transition-colors"
        >
          <TypographyUI as="span" variant="default">Criar nova lista</TypographyUI>
          <img src={bttAdd} alt="Add" className="h-12 opacity-70" />
        </div>


        {lists.map((list) => (
          <Link
            to="/aboutlist"
            state={list} 
            key={list.id}
            className="h-96 w-72 bg-black/40 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/40 transition-colors"
          >
            <TypographyUI as="span" variant="default" className="text-2xl px-4">
              {list.name}
            </TypographyUI>
          </Link>
        ))}
      </div>


      <Popup
        isOpen={isPopupOpen}
        onPopUpClick={closePopup}
        className="bg-background h-1/2 w-auto min-w-[500px]"
      >
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 rounded-lg text-white p-2 hover:bg-black/60"
        >
          ✕
        </button>

        <div className="grid gap-8 w-full max-w-xl text-left mt-12 px-8">
          <TypographyUI as="h2" variant="default" className="text-center">
             Nova Gamelist
          </TypographyUI>

          <div className="grid gap-2">
            <label className="font-medium text-text-secondary">Nome da lista:</label>
            <input
              type="text"
              className="border border-gray-600 bg-black/20 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:border-primary"
              placeholder="Ex: Jogos de RPG"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>

          <button
            onClick={saveList}
            className="mt-15 px-15 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/80 transition-colors"
          >
            Salvar
          </button>
        </div>
      </Popup>
    </div>
  );
}

export default ShowLists;