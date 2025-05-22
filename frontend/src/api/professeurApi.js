import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Récupérer les statistiques du dashboard professeur
export const getProfesseurStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/professeur/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
    }
};

// Récupérer les demandes du professeur
export const getDemandesProfesseur = async () => {
    try {
        const response = await axios.get(`${API_URL}/professeur/demandes`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        throw error;
    }
};

// Créer une nouvelle demande
export const createDemande = async (demandeData) => {
    try {
        const response = await axios.post(`${API_URL}/professeur/demandes`, demandeData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création de la demande:', error);
        throw error;
    }
};

// Mettre à jour une demande
export const updateDemande = async (id, demandeData) => {
    try {
        const response = await axios.put(`${API_URL}/professeur/demandes/${id}`, demandeData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la demande:', error);
        throw error;
    }
};

// Supprimer une demande
export const deleteDemande = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/professeur/demandes/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de la demande:', error);
        throw error;
    }
}; 