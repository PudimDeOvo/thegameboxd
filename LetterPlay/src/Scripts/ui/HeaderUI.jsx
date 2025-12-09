import React, { useState } from "react";
import Typography from "./TypographyUI"
import { Link } from "react-router-dom";
import logo from '/src/assets/logo.png';
import avatarPerfil from '/src/assets/GenericAvatar.png';
import BttOptPerfil from "./BttOptPerfil";



function HeaderUI() {
    const [popupProfileOpen, setPopupProfileOpen] = useState(false);

    const togglePopup = () => {
        setPopupProfileOpen(prev => !prev);
    };

    return (
        <header className=" h-28 rounded-b-xl mx-48 pt-8 flex justify-around z-10 relative">
            <Link to={"/"}>
                <div id="divLogo" className="flex gap-4">
                    <img src={logo} className="h-12"></img>
                    <Typography as="span" className="pt-2" variant="default">LetterPlay</Typography>
                </div>
            </Link>


            <div id="divBarraPesquisa">
                <input className="rounded-full w-96 h-10 px-4 bg-gray-300 mt-2" placeholder="Procure jogos"></input>
            </div>

            <div id="divLinkAbas" className="flex h-4 gap-12 mt-2">
                <Link to={"/jogos"} >
                    <Typography variant="default" className="text-lg">Jogos</Typography>
                </Link>
                <Link to={"/lists"}>
                    <Typography variant="default" className="text-lg">Listas</Typography>
                </Link>
                <Link to={"/noticias"}>
                    <Typography variant="default" className="text-lg">Noticias</Typography>
                </Link>
                <div id="divOptPerfil">
                    <button onClick={togglePopup}><img src={avatarPerfil} alt="" className="h-12 -mt-2 cursor-pointer" /></button>
                </div>

                <BttOptPerfil isOpen={popupProfileOpen} />
            </div>



        </header>

    );
}

export default HeaderUI;
