import axios from 'axios';

// 如果是在开发环境下，我们通常通过 Vite 代理访问 API
// 如果是在生产环境下，且前端和后端部署在同一个域名下，我们可以使用相对路径
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? (window.location.origin.includes('localhost') ? 'http://localhost:3001' : '') 
  : ''; // 开发环境下使用相对路径，由 Vite 代理处理

axios.interceptors.request.use(
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

export default axios;
