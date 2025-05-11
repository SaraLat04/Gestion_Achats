import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getCategories, createCategorie, updateCategorie, deleteCategorie } from '../../api/categorie';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleOpenModal = (categorie = null) => {
    if (categorie) {
      setSelectedCategorie(categorie);
      setFormData({
        nom: categorie.nom,
        code: categorie.code,
        description: categorie.description || '',
      });
    } else {
      setSelectedCategorie(null);
      setFormData({
        nom: '',
        code: '',
        description: '',
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCategorie(null);
    setFormData({
      nom: '',
      code: '',
      description: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategorie) {
        await updateCategorie(selectedCategorie.id, formData);
      } else {
        await createCategorie(formData);
      }
      handleCloseModal();
      loadCategories();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la catégorie:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategorie(selectedCategorie.id);
      setOpenDeleteDialog(false);
      setSelectedCategorie(null);
      loadCategories();
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestion des Catégories</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Ajouter une catégorie
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total des catégories
            </Typography>
            <Typography variant="h4">{categories.length}</Typography>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Nombre de produits</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((categorie) => (
              <TableRow key={categorie.id}>
                <TableCell>{categorie.code}</TableCell>
                <TableCell>{categorie.nom}</TableCell>
                <TableCell>{categorie.description || '-'}</TableCell>
                <TableCell>{categorie.produits_count || 0}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenModal(categorie)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedCategorie(categorie);
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

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {selectedCategorie ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
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
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCategorie ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cette catégorie ?
          {selectedCategorie?.produits_count > 0 && (
            <Typography color="error" sx={{ mt: 1 }}>
              Attention : Cette catégorie contient {selectedCategorie.produits_count} produit(s).
              La suppression n'est pas possible tant que des produits y sont associés.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={selectedCategorie?.produits_count > 0}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories; 