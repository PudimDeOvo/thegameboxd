import React from "react";
import { HeaderUI, CardUI, TypographyUI } from '../Scripts/ui';
import { gamesData } from '../Scripts/api/igdbfake';
import ShowLists from "../Scripts/services/ShowLists";


export function Lists() {
    return (
        <div className="w-full min-h-[150vh]">
            <HeaderUI />

            <div>
                <TypographyUI as="span" variant="titulo" className="block ml-64 mt-24 text-4xl">Minhas Listas</TypographyUI>
            </div>

            <ShowLists />


        </div>
    )
}