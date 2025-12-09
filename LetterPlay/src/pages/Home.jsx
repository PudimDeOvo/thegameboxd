import React, { useState, useEffect} from "react";
import { HeaderUI, TypographyUI, CardUI } from "../Scripts/ui";
import logo from '/src/assets/logo.png';
import { Link } from "react-router-dom";
import { getUserProfile, uploadProfilePicture } from "../Scripts/services/userService";
export function Home() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchDados = async () => {
            try {
                const dados = await getUserProfile();
                setUser(dados);
            } catch (error) {
                console.error("Erro ao carregar usuário", error);
                setUser(null);
            }
        };
        fetchDados();
    }, []);

    const handePhotoChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                await uploadProfilePicture(file);
                const dadosAtualizados = await getUserProfile();
                setUser(dadosAtualizados);
                alert("Foto de perfil atualizada com sucesso!");
            } catch (error) {
                alert("Erro ao atualizar a foto de perfil. Tente novamente.");
            }
        }
    };

    return (
        <>
            <div className="bg-[url('../src/assets/backgroundHome.png')] bg-cover bg-center h-screen">
                <HeaderUI />

                <div id="divMain" className="flex flex-col col-span-2 m-48 gap-12">
                    <div className="flex gap-12">
                        <img src={logo} alt="" className="h-36" />
                        <TypographyUI as="span" className="text-7xl pt-8" variant="default">LetterPlay</TypographyUI>
                    </div>
                    <TypographyUI as="span" variant="default">Lorem ipsum dolor sit amet,
                        consectetur <br></br>adipiscing elit, sed do eiusmod tempor <br></br>incididunt </TypographyUI>

                    <button className="  h-16 w-48 rounded-2xl bg-gradient-to-r from-violet-800 to-purple-900 transition delay-75 duration-300 ease-in-out shadow-shadowEffect
                        hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                        <Link to="/register">
                            <TypographyUI as="span" variant="default" className="text-xl ">Crie uma conta</TypographyUI>
                        </Link>
                    </button>
                </div>
            </div>

        </>
    );
}
