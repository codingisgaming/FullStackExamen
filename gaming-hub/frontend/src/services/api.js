import axios from 'axios';

// You can override with REACT_APP_API_URL.
// Note: in this repo the backend commonly runs on 5002 (see backend terminal output).
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getCurrentUser: () => api.get('/auth/me'),
    changeUsername: (newUsername) => api.put('/auth/change-username', { newUsername })
};

// Games API calls
export const gamesAPI = {
    getGames: () => api.get('/games'),
    submitScore: (gameData) => api.post('/games/score', gameData),
    getUserGameHistory: (userId) => api.get(`/games/user/${userId}/history`),
    deleteGameScore: (scoreId) => api.delete(`/games/score/${scoreId}`)
};

// Leaderboard API calls
export const leaderboardAPI = {
    getGlobal: () => api.get('/leaderboard/global'),
    getGameLeaderboard: (gameId) => api.get(`/leaderboard/${gameId}`),
    getUserStats: (userId) => api.get(`/leaderboard/user/${userId}`)
};

export default api;