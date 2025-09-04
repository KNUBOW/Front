import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // vite.config.js에서 /api → target 으로 프록시
    timeout: 10000, // 10초 타임아웃 설정
    withCredentials: true, // 쿠키를 포함한 요청을 위해 설정
});

api.interceptors.request.use((config) => {
    const csrf = getCookie("csrf_access_token");
    if (csrf) {
        config.headers['X-CSRF-TOKEN'] = csrf;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        return Promise.reject(err);
    }
);

export default api;