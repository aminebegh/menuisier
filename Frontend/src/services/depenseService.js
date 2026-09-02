import api from './api';

export const getDepenses = (params) => api.get('/depenses', { params });
export const createDepense = (data) => api.post('/depenses', data);
