import axios from './axios';

export const getMouvementsStock = async () => {
  try {
    const response = await axios.get('/mouvements-stock');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des mouvements de stock:', error);
    throw error;
  }
};

export const createMouvementStock = async (data) => {
  try {
    const response = await axios.post('/mouvements-stock', data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du mouvement de stock:', error);
    throw error;
  }
};

export const getStockProduit = async (produitId) => {
  try {
    const response = await axios.get(`/produits/${produitId}/stock`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du stock du produit:', error);
    throw error;
  }
}; 