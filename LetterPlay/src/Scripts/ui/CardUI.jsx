import React from "react";
import Typography from './TypographyUI';
import iconStar from '/src/assets/Star.png';

function CardUI({ infosGame, className = "" }) {
    if (!infosGame) return null;

    // --- 1. Fix Image URL ---
    // Handle cases where API returns "cover.url", "cover_url" or just "cover"
    let rawCover = infosGame.cover_url || infosGame.cover?.url || "";
    
    // IGDB URLs start with "//", so we add "https:"
    if (rawCover.startsWith("//")) {
        rawCover = `https:${rawCover}`;
    }
    
    // If specific size is needed, IGDB uses 't_thumb'. Replace with 't_cover_big' for better quality
    // (Optional: remove if your API already handles this)
    const finalCover = rawCover.replace("t_thumb", "t_cover_big");


    // --- 2. Fix Rating ---
    // Ensure rating exists, otherwise show "-"
    // Math.round() removes decimals (e.g., 85.4 -> 85)
    const finalRating = infosGame.rating ? Math.round(infosGame.rating) : "-";


    // --- 3. Fix Genres ---
    // Ensure genres is an array. If it's a string, wrap it. If null, empty array.
    const genresList = Array.isArray(infosGame.genres) 
        ? infosGame.genres 
        : (infosGame.genres ? [infosGame.genres] : []);


    return (
        // Changed h-100 to h-auto or specific height to prevent layout collapse
        <div className={`w-72 flex flex-col ${className}`}>
            
            {/* Cover Image */}
            <div 
                id="capaJogo" 
                className="bg-cover bg-center h-[420px] rounded-xl shadow-lg bg-gray-800" 
                style={{ 
                    backgroundImage: finalCover ? `url(${finalCover})` : "none" 
                }}
            >
                {/* Fallback if no image */}
                {!finalCover && (
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}
            </div>

            {/* Title */}
            <div id="tituloJogo" className="pt-4 px-1">
                <Typography as="span" variant="default" className="font-bold text-lg leading-tight block truncate">
                    {infosGame.name || "Sem nome"}
                </Typography>
            </div>

            {/* Bottom Info */}
            <div className="flex justify-between items-start mt-2 px-1">
                
                {/* Genres */}
                <div id="generosJogo" className="w-2/3">
                    <Typography as="span" variant="muted" className="text-sm line-clamp-2">
                        {genresList.length > 0 ? genresList.join(", ") : "Sem gênero"}
                    </Typography>
                </div>

                {/* Rating Badge */}
                <div id="avaliacaoJogo" className="bg-primary px-2 py-1 rounded-lg flex items-center gap-1 shadow-md shrink-0">
                    <img src={iconStar} alt="Star" className="h-4 w-4" />
                    <span className="text-white font-bold text-sm">
                        {finalRating}
                    </span>
                </div>

            </div>
        </div>
    );
}

export default CardUI;