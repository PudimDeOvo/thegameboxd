import { HeaderUI, TypographyUI, CardUI } from "../Scripts/ui";
import logo from '/src/assets/logo.png';
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoGoogle from '/src/assets/logoGoogle.png';
import logoSteam from '/src/assets/logoSteam.png';
import { registerUser } from "../Scripts/services/userService";

export function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        profileName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();


        if (formData.password !== formData.confirmPassword) {
            alert("As senhas não coincidem. Por favor, tente novamente.");
            return;
        }


        const dadosParaEnviar = {
            username: formData.profileName, 
            email: formData.email,
            password: formData.password
        };

        try {
            console.log("Enviando:", dadosParaEnviar);
            await registerUser(dadosParaEnviar);
            alert("Conta criada com sucesso! Redirecionando para o login...");
            navigate('/login');
        } catch (error) {
            console.error("Erro ao registrar:", error);

            if (error.response && error.response.data) {
                alert(`Erro: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("Erro ao criar a conta. Por favor, tente novamente.");
            }
        }
    };

    return (
        <div className="w-auto h-auto">
            <div className="flex">

                <div id="sideLeft" className="bg-gradient-to-r from-[#573798] to-[#1a0c36] h-screen w-1/2 rounded-r-2xl shadow-2xl shadow-black"></div>

                <div id="sideRight" className=" w-1/2 h-full text-center mt-16">
                    <TypographyUI as="span" variant="titulo" className="text-center text-5xl">Registre-se</TypographyUI>


                    <form onSubmit={handleRegister} className="w-full flex flex-col items-center mt-24">

                        <div className="grid gap-12 w-full max-w-xl text-left">


                            <div className="grid">
                                <label className="mb-1 font-medium text-text-secondary">Nome do Perfil:</label>
                                <input
                                    type="text"
                                    name="profileName"
                                    value={formData.profileName}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-black"
                                    placeholder="Digite seu nome"
                                    required
                                />
                            </div>


                            <div className="grid">
                                <label className="mb-1 font-medium text-text-secondary">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-black"
                                    placeholder="exemplo@email.com"
                                    required
                                />
                            </div>


                            <div className="grid">
                                <label className="mb-1 font-medium text-text-secondary">Senha:</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-black"
                                    placeholder="Digite sua senha"
                                    required
                                />
                            </div>


                            <div className="grid">
                                <label className="mb-1 font-medium text-text-secondary">Confirme sua senha:</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-lg px-3 py-2 w-full text-black"
                                    placeholder="Confirme sua senha"
                                    required
                                />
                            </div>

                        </div>

                        <div className="flex flex-col items-center">
                            <button
                                type="submit"
                                className="mt-12 h-16 w-48 rounded-2xl bg-gradient-to-r from-violet-800 to-purple-900 transition delay-75 duration-300 ease-in-out shadow-shadowEffect hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                            >
                                <TypographyUI as="span" variant="default" className="text-xl">Registrar</TypographyUI>
                            </button>


                            <div id="loginIcones" className="flex gap-8 h-16 w-48 mt-10 justify-around">
                                <button type="button" className="h-12 w-16 bg-primary flex items-center justify-center rounded-lg transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.45)]">
                                    <img src={logoGoogle} alt="Google" className="h-6" />
                                </button>

                                <button type="button" className="h-12 w-16 bg-primary flex items-center justify-center rounded-lg transition duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:shadow-[0_0_15px_rgba(139,92,246,0.45)]">
                                    <img src={logoSteam} alt="Steam" className="h-6" />
                                </button>
                            </div>
                        </div>

                    </form>

                    <div>
                        <TypographyUI as="span" variant="muted">Você já possui uma conta?
                            <Link to="/login" className="line-clamp-1 underline">   Fazer Log-in</Link>
                        </TypographyUI>
                    </div>
                </div>
            </div>
        </div>
    )
}