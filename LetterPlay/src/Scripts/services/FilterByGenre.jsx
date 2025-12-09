import React from "react";

function FilterByGenre({ onSelect, activeGenre }) {

    const genres = [
        { label: "Todos", value: null }, 
        { label: "Ação (Shooter)", value: "Shooter" }, 
        { label: "Aventura", value: "Adventure" },
        { label: "RPG", value: "Role-playing (RPG)" },
        { label: "Indie", value: "Indie" },
        { label: "Estratégia", value: "Strategy" }
    ];

    return (
        <div className="flex flex-wrap gap-4 mb-12 mt-12 justify-center">
            {genres.map((genre) => {
            
                const isActive = activeGenre === genre.value;

                return (
                    <button 
                        key={genre.label} 
                        onClick={() => onSelect(genre.value)} 
                        className={`
                            px-6 py-2 rounded-xl border-2 transition-all duration-300
                            ${isActive 
                                ? "bg-primary border-primary text-white scale-105 shadow-lg shadow-primary/50" 
                                : "border-white text-white hover:bg-primary/50 hover:border-primary"
                            }
                        `}
                    >
                        {genre.label}
                    </button>
                );
            })}
        </div>
    );
}

export default FilterByGenre;