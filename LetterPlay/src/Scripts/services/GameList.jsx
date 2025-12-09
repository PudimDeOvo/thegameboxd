import React from "react";
import { Link } from "react-router-dom";
import { CardUI } from "../ui";
import { gamesData } from "../api/igdbfake";

function GameList() {
    return (
        <div className="grid grid-cols-4 gap-6 p-4">
            {gamesData.map(game => (
                <Link key={game.id} to="/aboutGame">
                    <CardUI infosGame={game} />
                </Link>
            ))}
        </div>
    );
}

export default GameList;
