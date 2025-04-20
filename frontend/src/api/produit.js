// src/api/produit.js
import axios from './axios';

export const getProduits = async () => {
  const response = await axios.get('/produits');
  return response.data;
};

export const createProduit = async (data) => {
  const response = await axios.post('/produits', data);
  return response.data;
};
