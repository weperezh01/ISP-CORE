import axios from 'axios';

const api = axios.create({
    baseURL: 'https://wellnet-rd.com:444/api', // URL base para todas las solicitudes
    timeout: 10000, // Tiempo de espera en milisegundos
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptores para manejar errores globales (opcional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Error en la solicitud:', error.response || error.message);
        return Promise.reject(error);
    }
);

export default api;
