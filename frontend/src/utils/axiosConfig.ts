import axios from 'axios';

// Set default base URL for all axios requests
// In production, Nginx or Express serves static files, so '/api' is relative to current domain
axios.defaults.baseURL = '/api';

export default axios;
