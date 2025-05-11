// src/api/produit.js
import axios from './axios';

export const getProduits = async () => {
  const response = await axios.get('/produits');
  return response.data;
};

export const getProduit = async (id) => {
  const response = await axios.get(`/produits/${id}`);
  return response.data;
};

export const createProduit = async (data) => {
  const formData = new FormData();
  
  // Ajouter les champs texte
  formData.append('code', data.code);
  formData.append('nom', data.nom);
  formData.append('marque', data.marque);
  formData.append('categorie_id', data.categorie_id);
  formData.append('quantite', data.quantite);
  formData.append('unite', data.unite);
  formData.append('prix', data.prix);
  
  // Ajouter l'image si elle existe
  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await axios.post('/produits', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProduit = async (id, data) => {
  const formData = new FormData();
  
  // Ajouter les champs texte
  formData.append('code', data.code);
  formData.append('nom', data.nom);
  formData.append('marque', data.marque);
  formData.append('categorie_id', data.categorie_id);
  formData.append('quantite', data.quantite);
  formData.append('unite', data.unite);
  formData.append('prix', data.prix);
  
  // Ajouter l'image si elle existe
  if (data.image) {
    formData.append('image', data.image);
  }

  const response = await axios.post(`/produits/${id}?_method=PUT`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProduit = async (id) => {
  const response = await axios.delete(`/produits/${id}`);
  return response.data;
};
