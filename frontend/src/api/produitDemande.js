export const getProduitsByDemande = async (demandeId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/produits/by-demande/${demandeId}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des produits');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur API :', error);
    return [];
  }
};
