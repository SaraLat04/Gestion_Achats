import API from './axios';

// Récupérer toutes les demandes de l'utilisateur connecté
export const getDemandes = async () => {
  const response = await API.get('/demandes');
  return response.data;
};
// Créer une demande
export const creerDemande = async (data) => {
  const formData = new FormData();
  formData.append('description', data.description);
  formData.append('justification', data.justification);

  if (data.piece_jointe) {
    formData.append('piece_jointe', data.piece_jointe);
  }

  data.produits.forEach((produit, index) => {
    formData.append(`produits[${index}][nom]`, produit.nom);
    formData.append(`produits[${index}][quantite]`, produit.quantite);
  });

  const response = await API.post('/demande', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Modifier une demande
export const modifierDemande = async (id, data) => {
  const formData = new FormData();
  if (data.description) formData.append('description', data.description);
  if (data.justification) formData.append('justification', data.justification);
  if (data.piece_jointe) formData.append('piece_jointe', data.piece_jointe);

  if (data.produits) {
    data.produits.forEach((produit, index) => {
      formData.append(`produits[${index}][nom]`, produit.nom);
      formData.append(`produits[${index}][quantite]`, produit.quantite);
    });
  }

  const response = await API.post(`/demande/${id}?_method=PUT`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Supprimer une demande
export const supprimerDemande = async (id) => {
  const response = await API.delete(`/demande/${id}`);
  return response.data;
};
