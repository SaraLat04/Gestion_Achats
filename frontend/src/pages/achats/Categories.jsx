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
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getCategories, createCategorie, updateCategorie, deleteCategorie } from '../../api/categorie';

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
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erreur lors du chargement des catégories',
        severity: 'error'
      });
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

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCategorie) {
        await updateCategorie(selectedCategorie.id, formData);
        setNotification({
          open: true,
          message: 'Catégorie modifiée avec succès',
          severity: 'success'
        });
      } else {
        await createCategorie(formData);
        setNotification({
          open: true,
          message: 'Catégorie ajoutée avec succès',
          severity: 'success'
        });
      }
      handleCloseModal();
      loadCategories();
    } catch (error) {
      let errorMessage = 'Une erreur est survenue';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        if (errors.code) {
          errorMessage = 'Ce code de catégorie existe déjà';
        } else if (errors.nom) {
          errorMessage = 'Le nom de la catégorie est invalide';
        }
      }
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      console.error('Erreur lors de la sauvegarde de la catégorie:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategorie(selectedCategorie.id);
      setNotification({
        open: true,
        message: 'Catégorie supprimée avec succès',
        severity: 'success'
      });
      setOpenDeleteDialog(false);
      setSelectedCategorie(null);
      loadCategories();
    } catch (error) {
      let errorMessage = 'Une erreur est survenue lors de la suppression';
      if (error.response?.status === 422) {
        errorMessage = 'Impossible de supprimer cette catégorie car elle contient des produits';
      }
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      console.error('Erreur lors de la suppression de la catégorie:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h1">Gestion des Catégories</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenModal()}
            >
              Ajouter une catégorie
            </Button>
          </Box>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Total des catégories
                </Typography>
                <Typography variant="h4" color="secondary">
                  {categories.length}
                </Typography>
              </Card>
            </Grid>
          </Grid>

          <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Code</strong></TableCell>
                    <TableCell><strong>Nom</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Nombre de produits</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((categorie) => (
                    <TableRow
                      key={categorie.id}
                      hover
                      sx={{
                        transition: '0.2s',
                        '&:hover': { backgroundColor: '#f9f9f9' },
                      }}
                    >
                      <TableCell>{categorie.code}</TableCell>
                      <TableCell>{categorie.nom}</TableCell>
                      <TableCell>{categorie.description || '-'}</TableCell>
                      <TableCell>{categorie.produits_count || 0}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenModal(categorie)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
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
          </Paper>

          {/* Modal d'ajout/modification */}
          <Dialog
            open={openModal}
            onClose={handleCloseModal}
            PaperProps={{ sx: { borderRadius: 4, p: 2 } }}
          >
            <DialogTitle>
              <Typography variant="h2">
                {selectedCategorie ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              </Typography>
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
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button 
                onClick={handleCloseModal}
                variant="outlined"
                color="primary"
              >
                Annuler
              </Button>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                color="primary"
              >
                {selectedCategorie ? 'Modifier' : 'Ajouter'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de suppression */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            PaperProps={{ sx: { borderRadius: 4 } }}
          >
            <DialogTitle>
              <Typography variant="h6" color="error">
                Confirmer la suppression
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Typography>
                Êtes-vous sûr de vouloir supprimer cette catégorie ?
              </Typography>
              {selectedCategorie?.produits_count > 0 && (
                <Typography color="error" sx={{ mt: 1 }}>
                  Attention : Cette catégorie contient {selectedCategorie.produits_count} produit(s).
                  La suppression n'est pas possible tant que des produits y sont associés.
                </Typography>
              )}
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
                color="error"
                variant="contained"
                disabled={selectedCategorie?.produits_count > 0}
              >
                Supprimer
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            variant="filled"
            elevation={6}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default Categories;
