import React, { useState, useEffect, useRef } from "react";
import Typography from "./TypographyUI";
import { Link, useNavigate } from "react-router-dom"; 
import logo from '/src/assets/logo.png';
import avatarPerfil from '/src/assets/GenericAvatar.png';
import BttOptPerfil from "./BttOptPerfil";
import { searchGames } from "../api/searchApi"; 

function HeaderUI({ user, isHome }) {
    const [popupProfileOpen, setPopupProfileOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    
    const navigate = useNavigate();
    const searchRef = useRef(null); 

    const togglePopup = () => setPopupProfileOpen(prev => !prev);

    const handleProfileClick = () => {

        if (isHome && !user) {
            navigate("/register");
        } else {
            togglePopup();
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/";
    };

    const formatGameData = (item) => {
        const game = item.jogo || item;
        
        let cover = game.cover?.url || game.cover_url || game.capa_url || "";
        if (typeof cover === 'string') {
            if (cover.startsWith("//")) cover = `https:${cover}`;
            cover = cover.replace("t_thumb", "t_cover_big");
        }

        return {
            id: game.id || game.id_jogo,
            name: game.name || game.titulo,
            cover_url: cover,
            rating: game.rating || game.total_rating || 0,
            genres: (game.genres || []).map(g => g.name || g.nome_genero || g),
            summary: game.summary || game.descricao || "",
            screenshots: (game.screenshots || []).map(s => s.url || s),
            release_date: game.first_release_date,
            metacritic: game.metacritic || game.metacritic_rating || null
        };
    };

    useEffect(() => {
        if (searchTerm.length < 3) {
            setSearchResults([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const rawData = await searchGames(searchTerm);
                
                let list = [];
                if (Array.isArray(rawData)) list = rawData;
                else if (Array.isArray(rawData.data)) list = rawData.data;
                else if (Array.isArray(rawData.results)) list = rawData.results;

                const formatted = list.map(formatGameData);
                setSearchResults(formatted);
                setShowResults(true);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 500); 

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);


    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    const handleGameClick = (game) => {
        setShowResults(false);
        setSearchTerm("");
        navigate("/AboutGame", { state: { infosGame: game } });
    };

    return (
        <header className="h-28 rounded-b-xl mx-48 pt-8 flex justify-around z-50 relative">
            <Link to={"/"}>
                <div id="divLogo" className="flex gap-4">
                    <img src={logo} className="h-12" alt="Logo" />
                    <Typography as="span" className="pt-2" variant="default">LetterPlay</Typography>
                </div>
            </Link>

            <div id="divBarraPesquisa" className="relative" ref={searchRef}>
                <input 
                    className="rounded-full w-96 h-10 px-4 bg-gray-300 mt-2 text-black focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Procure jogos..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                    }}
                />

                {showResults && (searchTerm.length >= 3) && (
                    <div className="absolute top-14 left-0 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-[100]">
                        {isSearching ? (
                            <div className="p-4 text-gray-400 text-center">Pesquisando...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((game) => (
                                <div 
                                    key={game.id}
                                    onClick={() => handleGameClick(game)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-none transition-colors"
                                >

                                    <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden shrink-0">
                                        {game.cover_url ? (
                                            <img src={game.cover_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">N/A</div>
                                        )}
                                    </div>
                                    

                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-white font-bold text-sm truncate">{game.name}</span>
                                        <span className="text-gray-400 text-xs truncate">
                                            {game.release_date ? new Date(game.release_date * 1000).getFullYear() : "-"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-gray-500 text-center">Nenhum jogo encontrado.</div>
                        )}
                    </div>
                )}
            </div>

            <div id="divLinkAbas" className="flex h-4 gap-12 mt-2">
                <Link to={(isHome && !user) ? "/register" : "/jogos"} >
                    <Typography variant="default" className="text-lg hover:text-primary transition-colors">Jogos</Typography>
                </Link>
                <Link to={(isHome && !user) ? "/register" : "/lists"}>
                    <Typography variant="default" className="text-lg">Listas</Typography>
                </Link>
                
                <div id="divOptPerfil" className="relative">
                    <button onClick={handleProfileClick}>
                        <img src={avatarPerfil} alt="" className="h-12 -mt-2 cursor-pointer" />
                    </button>
                </div>

                <BttOptPerfil isOpen={popupProfileOpen} />
            </div>
        </header>
    );
}

export default HeaderUI;