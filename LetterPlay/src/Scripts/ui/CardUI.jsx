import React from "react";
import Typography from './TypographyUI';
import iconStar from '/src/assets/Star.png';

function CardUI({ infosGame, className = "" }) {
    if (!infosGame) return null;
    console.log("CardUI Data:", infosGame);
    
    let rawCover = infosGame.cover_url || infosGame.cover?.url || "";
    
    if (rawCover.startsWith("//")) {
        rawCover = `https:${rawCover}`;
    }
    const finalCover = rawCover.replace("t_thumb", "t_cover_big");


    let rawScore = infosGame.rating || infosGame.metacritic_rating || infosGame.total_rating || 0;
    const hasValidRating = rawScore > 0
    const finalRating = hasValidRating ? Math.round(rawScore) : "-";

    const genresList = Array.isArray(infosGame.genres) 
        ? infosGame.genres 
        : (infosGame.genres ? [infosGame.genres] : []);


    return (
        <div className={`w-72 flex flex-col ${className}`}>
            

            <div 
                id="capaJogo" 
                className="bg-cover bg-center h-[420px] rounded-xl shadow-lg bg-gray-800" 
                style={{ 
                    backgroundImage: finalCover ? `url(${finalCover})` : "none" 
                }}
            >

                {!finalCover && (
                    <div className="h-full w-full flex items-center justify-center text-gray-500">
                        No Image
                    </div>
                )}
            </div>

            <div id="tituloJogo" className="pt-4 px-1">
                <Typography as="span" variant="default" className="font-bold text-lg leading-tight block truncate">
                    {infosGame.name || "Sem nome"}
                </Typography>
            </div>


            <div className="flex justify-between items-start mt-2 px-1">
                

                <div id="generosJogo" className="w-2/3">
                    <Typography as="span" variant="muted" className="text-sm line-clamp-2">
                        {genresList.length > 0 ? genresList.join(", ") : "Sem gênero"}
                    </Typography>
                </div>


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