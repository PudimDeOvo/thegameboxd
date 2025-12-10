import api from "./api";

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/users/', userData);
        return response.data;
    }catch (error) {
        console.error("Erroa na requisicao de registro", error);
        throw error;
    }
};

export const getUserProfile = async ( ) => {
    try {
        const response = await api.get('/users/me/');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar o perfil do usuario", error);
        throw error;
    }
};

export const getUserProfilePic = async ( ) => {
    try {
        const response = await api.get('/me/pictures');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar foto de perfil do usuario", error);
        throw error;
    }
};

export const uploadProfilePicture = async (file) => {
    const formData = new FormData;
    formData.append('profile_pic', file);
    try{
        const response = await api.patch('/users/me/upload-pictures/', formData);
        return response.data;
    } catch (error) {
        console.error("Erro ao enviar a foto de perfil", error);
        throw error;
    }
};

export const updateUser = async (userId, dadosParaAtualizar) => {
    try {
        const response = await api.patch(`/users/atualizar/${userId}/`, dadosParaAtualizar);
        return response.data;
    } catch (error) {
        console.error("Erro ao tentar atualizar o perfil do usuario", error);
        throw error;
    }
    
};