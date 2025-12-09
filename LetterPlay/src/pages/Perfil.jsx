import React, { useEffect, useState } from "react";
import { HeaderUI, TypographyUI, Popup } from "../Scripts/ui";
import imageBG from "../assets/image18.png";
import avatarPerfil from '/src/assets/GenericAvatar.png';
import logo from '/src/assets/logo.png';
import iconEdit from '/src/assets/edit.png'
import { uploadProfilePicture } from "../Scripts/services/userService";
import { getUserProfile, updateUser} from "../Scripts/services/userService";

function OptLists() {
    const [option, setOption] = useState("favorites");

    return (
        <div className="h-96 w-auto m-16 pl-40">
            <div className="flex gap-12">
                <button
                    className={`cursor-pointer border-b-2 leading-[3rem] px-6 relative z-10 hover:text-secondary
                ${option === "favorites" ? "!text-secondary border-secondary" : "text-text border-transparent"}`}
                    onClick={() => setOption("favorites")}
                >
                    <TypographyUI as="span" variant="muted" className="!text-inherit">Favoritos</TypographyUI>
                </button>

                <button
                    className={`cursor-pointer border-b-2 leading-[3rem] px-6 relative z-10
                ${option === "jogados" ? "!text-secondary border-secondary" : "text-text border-transparent"}`}
                    onClick={() => setOption("jogados")}
                >
                    <TypographyUI as="span" variant="muted" className="!text-inherit">Jogados</TypographyUI>
                </button>

                <button
                    className={`cursor-pointer border-b-2 leading-[3rem] px-6 relative z-10
                ${option === "mylists" ? "!text-secondary border-secondary" : "text-text border-transparent"}`}
                    onClick={() => setOption("mylists")}
                >
                    <TypographyUI as="span" variant="muted" className="!text-inherit">Listas</TypographyUI>
                </button>
            </div>
        </div>
    )
}

export function Perfil() {


    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [loading, setLoading] = useState(true);


    const [user, setUser] = useState({
        id: null,
        username: 'Carregando...',
        email: '',
        profilePicture: ''
    });


    const [editForm, setEditForm] = useState({
        username: '',
        email: '',
        file: null
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const dados = await getUserProfile();
            console.log("Dados recebidos:", dados);
            setUser(dados);

            setEditForm({ 
                username: dados.username, 
                email: dados.email, 
                file: null 
            });
        } catch (error){
            console.error("Erro ao carregar usuário", error);
        } finally{
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try{

            if (!editForm.username || !editForm.email) {
                alert("Nome e Email são obrigatórios");
                return;
            }


            if(editForm.username !== user.username || editForm.email !== user.email){

                await updateUser(user.id, { username: editForm.username, email: editForm.email});
            }
            

            if(editForm.file){
                await uploadProfilePicture(editForm.file);
            }

            alert("Perfil atualizado com sucesso!");
            setIsPopUpOpen(false); 
            carregarDados();

        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar o perfil. Tente novamente.");
        }
    };

    const abrirPopup = () => {

        setEditForm({ username: user.username, email: user.email, file: null });
        setIsPopUpOpen(true);
    }
    
    const fecharPopup = () => setIsPopUpOpen(false);

    const handleInputChange = (e) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };


    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setEditForm({ ...editForm, file: e.target.files[0] });
        }
    };

    return (
        <div className="w-full h-auto relative">
            <HeaderUI />
            <div className="absolute top-0 left-0 w-full h-[315px] bg-cover bg-center z-0 bg-black"></div>

            <div className="flex items-center justify-between h-auto w-auto z-10 relative mt-36 px-64">
                <div className="flex items-center gap-8">

                    <img src={avatarPerfil} alt="" className="size-32 rounded-full object-cover" />

                    <div className="grid">

                        <TypographyUI as="span" variant="titulo" className="mt-3 text-5xl">
                            {user.username}
                        </TypographyUI>
                        

                        <TypographyUI as="span" variant="muted" className="">
                            {user.email}
                        </TypographyUI>
                    </div>
                </div>

                <button onClick={abrirPopup}>
                    <img src={iconEdit} alt="" className="size-8 -mt-3 cursor-pointer" />
                </button>
            </div>

            <OptLists />

            <Popup isOpen={isPopUpOpen} onPopUpClick={fecharPopup} className="bg-primary">
                <h2 className="text-2xl mb-6 font-semibold">Editar Perfil</h2>

                <div className="grid gap-6 text-left">

                    <div className="grid">
                        <label className="mb-1 font-medium">Nome do Perfil:</label>
                        <input
                            type="text"
                            name="username" 
                            value={editForm.username} 
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-black"
                            placeholder="Digite seu nome"
                        />
                    </div>

                    <div className="grid">
                        <label className="mb-1 font-medium">Email (Handle):</label>
                        <input
                            type="text"
                            name="email" 
                            value={editForm.email} 
                            onChange={handleInputChange} 
                            className="border border-gray-300 rounded-lg px-3 py-2 text-black"
                            placeholder="Digite seu email"
                        />
                    </div>

                    <div className="grid">
                        <label className="mb-1 font-medium">Foto de perfil:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-black"
                        />
                    </div>

                    <div className="grid">

                        <label className="mb-1 font-medium">Foto de fundo:</label>

                        <input

                            type="file"

                            className="border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"

                        />

                    </div>


                </div>

                <div className="flex justify-end mt-8 gap-4">
                    <button
                        onClick={fecharPopup}
                        className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition text-black"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSave} 
                        className="px-4 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition"
                    >
                        Salvar
                    </button>
                </div>
            </Popup>
        </div>
    );
}