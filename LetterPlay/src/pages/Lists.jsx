import React from "react";
import { HeaderUI, TypographyUI } from '../Scripts/ui';
import ShowLists from "../Scripts/services/ShowLists";

export function Lists() {
    return (
        <div className="w-full min-h-screen bg-background pb-20">
            <HeaderUI />

            <div className="flex justify-center w-full">
                <div className="w-full max-w-[1400px] px-10">
                    <TypographyUI as="h1" variant="titulo" className="mt-24 text-4xl">
                        Minhas Listas
                    </TypographyUI>
                </div>
            </div>

            <div className="flex justify-center w-full">
                <div className="w-full max-w-[1400px]">
                    <ShowLists />
                </div>
            </div>
        </div>
    );
}