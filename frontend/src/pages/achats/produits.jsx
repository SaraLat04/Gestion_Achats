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
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { getProduits, createProduit, updateProduit, deleteProduit } from '../../api/produit';
import { getCategories } from '../../api/categorie';

// Définition des couleurs principales
const primaryColor = "#B36B39" // Couleur bronze/cuivre du logo
const secondaryColor = "#2C3E50" // Bleu foncé pour le contraste
const backgroundColor = "#F5F5F5" // Gris clair pour le fond
const accentColor = "#E74C3C" // Rouge pour l'accent

// Création du thème
const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      contrastText: "#ffffff",
    },
    secondary: {
      main: secondaryColor,
      contrastText: "#ffffff",
    },
    background: {
      default: backgroundColor,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      color: secondaryColor,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      color: primaryColor,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      color: secondaryColor,
    },
    body1: {
      fontSize: "1rem",
      color: "#333",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          textTransform: "none",
          padding: "10px 20px",
          transition: "all 0.3s ease",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          },
        },
        containedPrimary: {
          background: `linear-gradient(45deg, ${primaryColor} 30%, ${primaryColor}CC 90%)`,
          "&:hover": {
            background: `linear-gradient(45deg, ${primaryColor}CC 30%, ${primaryColor} 90%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(45deg, ${secondaryColor} 30%, ${secondaryColor}CC 90%)`,
          "&:hover": {
            background: `linear-gradient(45deg, ${secondaryColor}CC 30%, ${secondaryColor} 90%)`,
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const STORAGE_URL = `${API_URL}/storage/produits`;

const UNITES = [
  'Pièce',
  'Kg',
  'Litre',
  'Mètre',
  'Carton',
  'Boîte',
  'Paquet',
  'Unité',
  'Lot'
];

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [selectedCategorie, setSelectedCategorie] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filtrer les produits
  const produitsFiltres = produits.filter((produit) => {
    const matchCategorie = selectedCategorie === '' || produit.categorie_id === parseInt(selectedCategorie);
    const matchSearch = searchTerm === '' || 
      produit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produit.marque.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategorie && matchSearch;
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h1">Gestion des Produits</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              Ajouter un produit
            </Button>
          </Box>

          {/* Filtres */}
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Rechercher un produit"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, code ou marque..."
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Filtrer par catégorie"
                  value={selectedCategorie}
                  onChange={(e) => setSelectedCategorie(e.target.value)}
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>Toutes les catégories</em>
                  </MenuItem>
                  {categories.map((categorie) => (
                    <MenuItem key={categorie.id} value={categorie.id}>
                      {categorie.nom}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Statistiques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Total des produits
                </Typography>
                <Typography variant="h4" color="secondary">
                  {produitsFiltres.length}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Produits en stock
                </Typography>
                <Typography variant="h4" color="secondary">
                  {produitsFiltres.filter(p => p.quantite > 0).length}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Produits en rupture
                </Typography>
                <Typography variant="h4" color="error">
                  {produitsFiltres.filter(p => p.quantite === 0).length}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <TableContainer>
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
                  {produitsFiltres.map((produit) => (
                    <TableRow key={produit.id} hover>
                      <TableCell>
                        <Avatar
                          src={produit.image ? `${STORAGE_URL}/${produit.image.replace('produits/', '')}` : '/default-product.png'}
                          alt={produit.nom}
                          sx={{ width: 56, height: 56 }}
                          onError={(e) => {
                            e.target.src = '/default-product.png';
                          }}
                        />
                      </TableCell>
                      <TableCell>{produit.code}</TableCell>
                      <TableCell>{produit.nom}</TableCell>
                      <TableCell>{produit.marque}</TableCell>
                      <TableCell>
                        {categories.find((cat) => cat.id === produit.categorie_id)?.nom}
                      </TableCell>
                      <TableCell>{produit.quantite} {produit.unite}</TableCell>
                      <TableCell>{Number(produit.prix).toLocaleString('fr-FR', { style: 'currency', currency: 'MAD' })}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleOpenModal(produit)}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedProduit(produit);
                            setOpenDeleteDialog(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Modal d'ajout/modification */}
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
                borderRadius: 4,
              }}
            >
              <Typography variant="h2" sx={{ mb: 3 }}>
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
                            ? `${STORAGE_URL}/${selectedProduit.image}`
                            : '/default-product.png'
                        }
                        alt="Image du produit"
                        sx={{ width: 100, height: 100, mb: 2 }}
                        onError={(e) => {
                          e.target.src = '/default-product.png';
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button variant="contained" component="span" color="primary">
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
                      variant="outlined"
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
                      variant="outlined"
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
                      variant="outlined"
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
                      variant="outlined"
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
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      select
                      label="Unité"
                      name="unite"
                      value={formData.unite}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    >
                      {UNITES.map((unite) => (
                        <MenuItem key={unite} value={unite}>
                          {unite}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Prix (DH)"
                      name="prix"
                      type="number"
                      value={formData.prix}
                      onChange={handleInputChange}
                      InputProps={{
                        endAdornment: <span>DH</span>
                      }}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button 
                        onClick={handleCloseModal}
                        variant="outlined"
                        color="primary"
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        variant="contained"
                        color="primary"
                      >
                        {selectedProduit ? 'Modifier' : 'Ajouter'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Modal>

          {/* Dialog de confirmation de suppression */}
          <Dialog 
            open={openDeleteDialog} 
            onClose={() => setOpenDeleteDialog(false)}
            PaperProps={{
              sx: { borderRadius: 4 }
            }}
          >
            <DialogTitle>
              <Typography variant="h6" color="error">
                Confirmer la suppression
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography>
                Êtes-vous sûr de vouloir supprimer ce produit ?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenDeleteDialog(false)}
                variant="outlined"
                color="primary"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleDelete} 
                variant="contained"
                color="error"
              >
                Supprimer
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Produits; 