import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  MenuItem,
  Modal,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getProduits, createProduit, updateProduit, deleteProduit } from '../../api/produit';
import { getCategories } from '../../api/categorie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    marque: '',
    categorie_id: '',
    quantite: '',
    unite: '',
    prix: '',
    image: null,
  });

  useEffect(() => {
    loadProduits();
    loadCategories();
  }, []);

  const loadProduits = async () => {
    try {
      const data = await getProduits();
      setProduits(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleOpenModal = (produit = null) => {
    if (produit) {
      setSelectedProduit(produit);
      setFormData({
        code: produit.code,
        nom: produit.nom,
        marque: produit.marque,
        categorie_id: produit.categorie_id,
        quantite: produit.quantite,
        unite: produit.unite,
        prix: produit.prix,
        image: null,
      });
    } else {
      setSelectedProduit(null);
      setFormData({
        code: '',
        nom: '',
        marque: '',
        categorie_id: '',
        quantite: '',
        unite: '',
        prix: '',
        image: null,
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduit(null);
    setFormData({
      code: '',
      nom: '',
      marque: '',
      categorie_id: '',
      quantite: '',
      unite: '',
      prix: '',
      image: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedProduit) {
        await updateProduit(selectedProduit.id, formData);
      } else {
        await createProduit(formData);
      }
      handleCloseModal();
      loadProduits();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduit(selectedProduit.id);
      setOpenDeleteDialog(false);
      setSelectedProduit(null);
      loadProduits();
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestion des Produits</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Ajouter un produit
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Marque</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produits.map((produit) => (
              <TableRow key={produit.id}>
                <TableCell>
                  <Avatar
                    src={produit.image ? `${API_URL}/storage/${produit.image}` : '/default-product.png'}
                    alt={produit.nom}
                    sx={{ width: 56, height: 56 }}
                  />
                </TableCell>
                <TableCell>{produit.code}</TableCell>
                <TableCell>{produit.nom}</TableCell>
                <TableCell>{produit.marque}</TableCell>
                <TableCell>
                  {categories.find((cat) => cat.id === produit.categorie_id)?.nom}
                </TableCell>
                <TableCell>{produit.quantite} {produit.unite}</TableCell>
                <TableCell>{produit.prix} €</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(produit)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedProduit(produit);
                      setOpenDeleteDialog(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {selectedProduit ? 'Modifier le produit' : 'Ajouter un produit'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={
                      formData.image instanceof File
                        ? URL.createObjectURL(formData.image)
                        : selectedProduit?.image
                        ? `${API_URL}/storage/${selectedProduit.image}`
                        : '/default-product.png'
                    }
                    alt="Image du produit"
                    sx={{ width: 100, height: 100, mb: 2 }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="contained" component="span">
                      Choisir une image
                    </Button>
                  </label>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Marque"
                  name="marque"
                  value={formData.marque}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Catégorie"
                  name="categorie_id"
                  value={formData.categorie_id}
                  onChange={handleInputChange}
                  required
                >
                  {categories.map((categorie) => (
                    <MenuItem key={categorie.id} value={categorie.id}>
                      {categorie.nom}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Quantité"
                  name="quantite"
                  type="number"
                  value={formData.quantite}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unité"
                  name="unite"
                  value={formData.unite}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Prix"
                  name="prix"
                  type="number"
                  value={formData.prix}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button onClick={handleCloseModal}>Annuler</Button>
                  <Button type="submit" variant="contained">
                    {selectedProduit ? 'Modifier' : 'Ajouter'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce produit ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Produits; 