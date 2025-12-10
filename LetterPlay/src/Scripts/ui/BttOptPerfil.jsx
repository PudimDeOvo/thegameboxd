import React from "react";
import { Link } from "react-router-dom";
import TypographyUI from "./TypographyUI"

const IconPerfil = (
    <svg className="humbleicons hi-user text-black" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeWidth="2" d="M5 17v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4ZM15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const IconConfig = (
    <svg className="humbleicons hi-cog text-black" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M10.47 4.32c.602-1.306 2.458-1.306 3.06 0l.218.473a1.684 1.684 0 0 0 2.112.875l.49-.18c1.348-.498 2.66.814 2.162 2.163l-.18.489a1.684 1.684 0 0 0 .875 2.112l.474.218c1.305.602 1.305 2.458 0 3.06l-.474.218a1.684 1.684 0 0 0-.875 2.112l.18.49c.498 1.348-.814 2.66-2.163 2.162l-.489-.18a1.684 1.684 0 0 0-2.112.875l-.218.473c-.602 1.306-2.458 1.306-3.06 0l-.218-.473a1.684 1.684 0 0 0-2.112-.875l-.49.18c-1.348.498-2.66-.814-2.163-2.163l.181-.489a1.684 1.684 0 0 0-.875-2.112l-.474-.218c-1.305-.602-1.305-2.458 0-3.06l.474-.218a1.684 1.684 0 0 0 .875-2.112l-.18-.49c-.498-1.348.814-2.66 2.163-2.163l.489.181a1.684 1.684 0 0 0 2.112-.875l.218-.474Z" />
    </svg>
);

const IconExit = (
    <svg className="humbleicons hi-logout text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12h-9.5m7.5 3 3-3-3-3m-5-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-1" />
    </svg>
);

function BttOptPerfil({ isOpen }) {

    const handlelogout = () => {
        localStorage.removeItem('@LetterPlay:token');
        window.location.href = '/';
    };

    if (!isOpen) return null;

    return (
        <aside className={`
            w-48 flex flex-col gap-4 pt-4 mt-4 border border-bg-secondary rounded-xl shadow-sombra
            absolute top-20 right-28 bg-white z-50
            transition-all duration-200 origin-top-right
            ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}>

            <div className="flex flex-col gap-2 border-b-2 py-1 px-4 w-full">
                <Link to="/perfil" className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    {IconPerfil}
                    <TypographyUI as="span" variant="default" className="pt-0.5 text-sm  !text-gray-900">Meu Perfil</TypographyUI>
                </Link>

                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    {IconConfig}
                    <TypographyUI as="span" variant="default" className="pt-0.5 text-sm !text-gray-900">Configurações</TypographyUI>
                </div>
            </div>

            <div className="flex flex-col gap-4 py-2 px-4 w-full">
                <div 
                    onClick={handlelogout} 
                    className="flex items-center gap-2 cursor-pointer hover:bg-red-50 p-1 rounded"
                >
                    {IconExit}
                    <TypographyUI as="span" variant="default" className="pt-0.5 text-sm !text-black">Sair</TypographyUI>
                </div>
            </div>

        </aside>
    );
}

export default BttOptPerfil;