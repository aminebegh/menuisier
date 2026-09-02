import api from './api';

export const getDashboard = () => api.get('/dashboard');
export const getBilan = (params) => api.get('/bilan', { params });
