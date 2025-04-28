import API from './axios';

// Récupérer toutes les demandes de l'utilisateur connecté
export const getDemandes = async () => {
  const response = await API.get('/demandes');
  return response.data;
};

export const getAllDemandes = async () => {
  const response = await API.get('/allDemandes');
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


export const sendToDean = async (requestId) => {
  // Vérifie si requestId est défini et non vide
  if (!requestId) {
    console.error("requestId n'est pas défini ou est invalide");
    throw new Error("requestId est manquant");
  }

  try {
    const response = await API.post(`/demande/${requestId}/envoyer-au-doyen`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'envoi au doyen : ", error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi au doyen');
  }
};

export const rejectDemande = async (id) => {
  const response = await API.post(`/demande/${id}/rejeter`);
  return response.data;
};

export const sendToResponsable = async (requestId) => {
  if (!requestId) throw new Error("requestId est manquant");

  try {
    const response = await API.post(`/demande/${requestId}/envoyer-au-responsable`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'envoi au responsable financier : ", error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'envoi au responsable financier');
  }
};

export const finaliserDemande = async (requestId) => {
  if (!requestId) throw new Error("requestId est manquant");

  try {
    const response = await API.post(`/demande/${requestId}/finaliser`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la finalisation de la demande : ", error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la finalisation de la demande');
  }
};


// Supprimer une demande
export const supprimerDemande = async (id) => {
  const response = await API.delete(`/demande/${id}`);
  return response.data;
};

export const getNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};
