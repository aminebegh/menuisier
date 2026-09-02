import api from './api';

export const getCommandes = (params) => api.get('/commandes', { params });
export const getCommande = (id) => api.get(`/commandes/${id}`);
export const createCommande = (data) => api.post('/commandes', data);
export const updateCommande = (id, data) => api.put(`/commandes/${id}`, data);
export const addPaiement = (id, data) => api.post(`/commandes/${id}/paiements`, data);
export const updateStatut = (id, statut) => api.put(`/commandes/${id}/statut`, { statut });
export const deleteCommande = (id) => api.delete(`/commandes/${id}`);
