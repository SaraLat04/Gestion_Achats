import axios from './axios';

// Récupérer tous les mouvements de stock
export const getMouvementsStock = async () => {
    try {
        const response = await axios.get('/mouvements-stock');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Erreur lors de la récupération des mouvements de stock' };
    }
};

// Créer un nouveau mouvement de stock
export const createMouvementStock = async (data) => {
    try {
        const response = await axios.post('/mouvements-stock', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Erreur lors de la création du mouvement de stock' };
    }
};

// Récupérer le stock d'un produit spécifique
export const getStockProduit = async (produitId) => {
    try {
        const response = await axios.get(`/mouvements-stock/produit/${produitId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Erreur lors de la récupération du stock du produit' };
    }
}; 