import axios from './axios';

// Configuration d'axios pour inclure le token dans toutes les requêtes
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Récupérer toutes les catégories
export const getCategories = async () => {
  try {
    const response = await axios.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

// Créer une nouvelle catégorie
export const createCategorie = async (categorieData) => {
  try {
    const response = await axios.post('/categories', categorieData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    throw error;
  }
};

// Mettre à jour une catégorie
export const updateCategorie = async (id, categorieData) => {
  try {
    const response = await axios.put(`/categories/${id}`, categorieData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    throw error;
  }
};

// Supprimer une catégorie
export const deleteCategorie = async (id) => {
  try {
    const response = await axios.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    throw error;
  }
}; 