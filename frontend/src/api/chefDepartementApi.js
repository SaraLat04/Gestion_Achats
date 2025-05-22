import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Fonction pour récupérer les statistiques du dashboard
export const getChefDepartementStats = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/chef-departement/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        throw error;
    }
}; 