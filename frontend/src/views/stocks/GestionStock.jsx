import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { getProduits } from '../../api/produit';
import { getMouvementsStock, createMouvementStock } from '../../api/stock';

const GestionStock = () => {
  const [produits, setProduits] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    produit_id: '',
    type: 'entree',
    quantite: '',
    date: new Date().toISOString().split('T')[0],
    motif: '',
  });

  useEffect(() => {
    loadProduits();
    loadMouvements();
  }, []);

  const loadProduits = async () => {
    try {
      const data = await getProduits();
      setProduits(data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const loadMouvements = async () => {
    try {
      const data = await getMouvementsStock();
      setMouvements(data);
    } catch (error) {
      console.error('Erreur lors du chargement des mouvements:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      produit_id: '',
      type: 'entree',
      quantite: '',
      date: new Date().toISOString().split('T')[0],
      motif: '',
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
      await createMouvementStock(formData);
      handleCloseModal();
      loadMouvements();
      loadProduits(); // Pour mettre à jour les quantités en stock
    } catch (error) {
      console.error('Erreur lors de la création du mouvement:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Gestion des Stocks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Nouveau Mouvement
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Produit</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Motif</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mouvements.map((mouvement) => (
                  <TableRow key={mouvement.id}>
                    <TableCell>{new Date(mouvement.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {produits.find((p) => p.id === mouvement.produit_id)?.nom}
                    </TableCell>
                    <TableCell>
                      <Typography
                        color={mouvement.type === 'entree' ? 'success.main' : 'error.main'}
                      >
                        {mouvement.type === 'entree' ? 'Entrée' : 'Sortie'}
                      </Typography>
                    </TableCell>
                    <TableCell>{mouvement.quantite}</TableCell>
                    <TableCell>{mouvement.motif}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

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
            Nouveau Mouvement de Stock
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Produit</InputLabel>
                  <Select
                    name="produit_id"
                    value={formData.produit_id}
                    onChange={handleInputChange}
                    required
                  >
                    {produits.map((produit) => (
                      <MenuItem key={produit.id} value={produit.id}>
                        {produit.nom} (Stock actuel: {produit.quantite} {produit.unite})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type de mouvement</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="entree">Entrée</MenuItem>
                    <MenuItem value="sortie">Sortie</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Motif"
                  name="motif"
                  value={formData.motif}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button onClick={handleCloseModal}>Annuler</Button>
                  <Button type="submit" variant="contained">
                    Enregistrer
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default GestionStock; 