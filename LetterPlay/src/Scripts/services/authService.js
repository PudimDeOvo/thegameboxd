import api from './api';

export const loginUser = async (username, password) => {

    const params = new URLSearchParams();
    params.append('username', username); 
    params.append('password', password);

    try {

        const response = await api.post('/auth/token', params);

        if (response.data.access_token) {

            localStorage.setItem('@LetterPlay:token', response.data.access_token);
        }
        
        return response.data;
    } catch (error) {
        console.error("Erro no Login", error);
        throw error;
    }
};
