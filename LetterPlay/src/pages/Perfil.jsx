import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeaderUI, TypographyUI, Popup, CardUI } from "../Scripts/ui"; 
import ShowLists from "../Scripts/services/ShowLists";

// Assets
import avatarDefault from '/src/assets/GenericAvatar.png';
import iconEdit from '/src/assets/edit.png';

// API & Services
import { 
    uploadProfilePicture, 
    getUserProfile, 
    updateUser 
} from "../Scripts/services/userService";

import { 
    getFavorites, 
    getPlayedGames 
} from '../Scripts/api/watchListApi'; 

// --- 1. TAB COMPONENT ---
function OptLists({ activeTab, setActiveTab }) {
    const tabs = [
        { id: "favorites", label: "Favoritos" },
        { id: "jogados",   label: "Jogados" },
        { id: "mylists",   label: "Minhas Listas" }
    ];

    return (
        <div className="h-20 w-auto mt-16 px-64 border-b border-gray-800">
            <div className="flex gap-12 h-full">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`cursor-pointer px-6 relative h-full flex items-center transition-all
                            ${activeTab === tab.id 
                                ? "border-b-4 border-secondary text-secondary" 
                                : "border-b-4 border-transparent text-gray-400 hover:text-white"
                            }`}
                    >
                        <TypographyUI as="span" variant="default" className="text-xl font-bold">
                            {tab.label}
                        </TypographyUI>
                    </button>
                ))}
            </div>
        </div>
    );
}

// --- 2. REUSABLE GAMES GRID (For Favorites/Played) ---
function UserGamesGrid({ fetchFunction }) {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadGames() {
            try {
                // Fetch data using the passed function (getFavorites or getPlayedGames)
                const rawData = await fetchFunction();
                
                // Ensure it's an array
                let list = [];
                if (Array.isArray(rawData)) list = rawData;
                else if (Array.isArray(rawData.data)) list = rawData.data;

                // Map Backend Data -> CardUI Format
                const formatted = list.map(item => {
                    // Handle wrapper: API usually returns { status:..., jogo: { ... } }
                    const game = item.jogo || item; 
                    
                    // Clean Image URL
                    let cover = game.cover?.url || game.cover_url || game.capa_url || "";
                    if (cover.startsWith("//")) cover = `https:${cover}`;
                    if (cover.includes("t_thumb")) cover = cover.replace("t_thumb", "t_cover_big");

                    return {
                        id: game.id || game.id_jogo,
                        name: game.name || game.titulo,
                        cover_url: cover,
                        rating: game.rating || game.total_rating || game.media || 0,
                        genres: (game.genres || game.generos || []).map(g => g.name || g.nome_genero || g),
                        summary: game.summary || game.descricao || "",
                        screenshots: (game.screenshots || []).map(s => s.url || s),
                        release_date: game.first_release_date,
                        // Pass status if available (for the badge)
                        status: item.status_jogo 
                    };
                });

                setGames(formatted);
            } catch (error) {
                console.error("Error loading games:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadGames();
    }, [fetchFunction]);

    if (isLoading) return <div className="text-white p-20 text-center">Carregando jogos...</div>;
    
    if (games.length === 0) return <div className="text-gray-500 p-20 text-center text-xl">Nenhum jogo encontrado nesta seção.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-64 py-10">
            {games.map((game, index) => (
                <Link
                    key={`${game.id}-${index}`}
                    to="/aboutGame"
                    state={{ infosGame: game }}
                    className="transform transition-transform duration-300 hover:scale-105"
                >
                    <CardUI infosGame={game} />
                </Link>
            ))}
        </div>
    );
}

// --- 3. MAIN PERFIL COMPONENT ---
export function Perfil() {
    
    // UI State
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("favorites");
    
    // User Data State
    const [user, setUser] = useState({
        id: null,
        username: 'Carregando...',
        email: '',
        profilePicture: ''
    });

    // Edit Form State
    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        file: null,
        previewUrl: null
    });

    // Load User Data
    const carregarDados = async () => {
        try {
            const dados = await getUserProfile();
            setUser(dados);
            setEditForm(prev => ({ 
                ...prev, 
                username: dados.username, 
                email: dados.email 
            }));
        } catch (error){
            console.error("Erro ao carregar usuário", error);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    // Save Profile
    const handleSave = async () => {
        try {
            if (!editForm.username || !editForm.email) {
                alert("Nome e Email são obrigatórios");
                return;
            }

            // Save Text Data
            if(editForm.username !== user.username || editForm.email !== user.email){
                await updateUser(user.id, { username: editForm.username, email: editForm.email});
            }

            // Save Image
            if(editForm.file){
                await uploadProfilePicture(editForm.file);
            }

            setIsPopUpOpen(false); 
            carregarDados(); // Refresh to show changes

        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar o perfil.");
        }
    };

    // Popup Logic
    const abrirPopup = () => {
        setEditForm({ 
            username: user.username, 
            email: user.email, 
            file: null, 
            previewUrl: null 
        });
        setIsPopUpOpen(true);
    };
    
    const fecharPopup = () => setIsPopUpOpen(false);

    const handleInputChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setEditForm({ 
                ...editForm, 
                file: file,
                previewUrl: URL.createObjectURL(file) 
            });
        }
    };

    // Avatar Logic
    const avatarUrl = user.profilePicture || avatarDefault;

    return (
        <div className="w-full min-h-screen bg-background relative">
            <HeaderUI />
            
            {/* Header / Cover Area */}
            <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-gray-900 to-background z-0"></div>

            {/* Profile Info Section */}
            <div className="flex items-end justify-between h-auto w-auto z-10 relative mt-48 px-64">
                <div className="flex items-end gap-8">
                    <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="w-40 h-40 rounded-full object-cover border-4 border-background shadow-2xl bg-gray-800" 
                    />

                    <div className="grid mb-4">
                        <TypographyUI as="h1" variant="titulo" className="text-5xl text-white">
                            {user.username}
                        </TypographyUI>
                        <TypographyUI as="span" variant="muted" className="text-xl">
                            {user.email}
                        </TypographyUI>
                    </div>
                </div>

                <button 
                    onClick={abrirPopup}
                    className="mb-6 hover:opacity-80 transition-opacity bg-black/40 p-2 rounded-full"
                    title="Editar Perfil"
                >
                    <img src={iconEdit} alt="Edit" className="w-6 h-6 invert" />
                </button>
            </div>

            {/* Navigation Tabs */}
            <OptLists activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* DYNAMIC CONTENT AREA */}
            <div className="min-h-[500px] bg-background pb-20">
                
                {activeTab === "favorites" && (
                    <UserGamesGrid fetchFunction={getFavorites} />
                )}

                {activeTab === "jogados" && (
                    <UserGamesGrid fetchFunction={getPlayedGames} />
                )}

                {activeTab === "mylists" && (
                    <div className="flex justify-center pt-10">
                        {/* Reusing your ShowLists Component */}
                        <div className="w-full max-w-[1400px]">
                            <ShowLists />
                        </div>
                    </div>
                )}
            </div>

            {/* EDIT POPUP */}
            <Popup isOpen={isPopUpOpen} onPopUpClick={fecharPopup} className="bg-background border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Editar Perfil</h2>
                    <button onClick={fecharPopup} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="grid gap-6 text-left w-[400px]">
                    <div className="flex justify-center">
                        <img 
                            src={editForm.previewUrl || avatarUrl} 
                            alt="Preview" 
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium text-gray-300">Nome de Usuário</label>
                        <input
                            type="text"
                            name="username" 
                            value={editForm.username} 
                            onChange={handleInputChange}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium text-gray-300">Email</label>
                        <input
                            type="text"
                            name="email" 
                            value={editForm.email} 
                            onChange={handleInputChange} 
                            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="font-medium text-gray-300">Alterar Foto</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                        />
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={fecharPopup}
                            className="flex-1 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave} 
                            className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary/80 text-white font-bold transition shadow-lg shadow-primary/20"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </Popup>
        </div>
    );
}