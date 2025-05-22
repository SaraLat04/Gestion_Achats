import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/magasinier/dashboard`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getAlertesStock = async () => {
    try {
        const response = await axios.get(`${API_URL}/magasinier/alertes-stock`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getHistoriqueStock = async () => {
    try {
        const response = await axios.get(`${API_URL}/magasinier/historique-stock`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}; 