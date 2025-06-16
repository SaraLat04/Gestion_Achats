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
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { getProduits } from '../../api/produit';
import { getMouvementsStock, createMouvementStock } from '../../api/stock';

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
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

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
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    loadProduits();
    loadMouvements();
  }, []);

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

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const loadProduits = async () => {
    try {
      const data = await getProduits();
      setProduits(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erreur lors du chargement des produits',
        severity: 'error'
      });
      console.error('Erreur lors du chargement des produits:', error);
    }
  };

  const loadMouvements = async () => {
    try {
      const data = await getMouvementsStock();
      setMouvements(data);
    } catch (error) {
      setNotification({
        open: true,
        message: 'Erreur lors du chargement des mouvements',
        severity: 'error'
      });
      console.error('Erreur lors du chargement des mouvements:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification des champs requis
    const requiredFields = {
      produit_id: 'Produit',
      type: 'Type de mouvement',
      quantite: 'Quantité',
      date: 'Date',
      motif: 'Raison'
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([field]) => !formData[field])
      .map(([_, label]) => label);

    if (emptyFields.length > 0) {
      setNotification({
        open: true,
        message: `Veuillez remplir tous les champs requis : ${emptyFields.join(', ')}`,
        severity: 'warning'
      });
      return;
    }

    // Vérification de la quantité pour les sorties
    if (formData.type === 'sortie') {
      const produit = produits.find(p => p.id === parseInt(formData.produit_id));
      if (produit && parseInt(formData.quantite) > produit.quantite) {
        setNotification({
          open: true,
          message: `La quantité en stock (${produit.quantite}) est insuffisante pour cette sortie`,
          severity: 'error'
        });
        return;
      }
    }

    try {
      await createMouvementStock(formData);
      setNotification({
        open: true,
        message: 'Mouvement de stock enregistré avec succès',
        severity: 'success'
      });
      handleCloseModal();
      loadMouvements();
      loadProduits();
    } catch (error) {
      let errorMessage = 'Une erreur est survenue lors de l\'enregistrement du mouvement';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      console.error('Erreur lors de la création du mouvement:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
            <Typography variant="h1">Gestion des Stocks</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              Nouveau Mouvement
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Produit</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Quantité</strong></TableCell>
                        <TableCell><strong>Raison</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mouvements.map((mouvement) => (
                        <TableRow key={mouvement.id} hover>
                          <TableCell>{new Date(mouvement.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {produits.find((p) => p.id === mouvement.produit_id)?.nom}
                          </TableCell>
                          <TableCell>
                            <Typography
                              color={mouvement.type === 'entree' ? 'success.main' : 'error.main'}
                              fontWeight="bold"
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
              </Paper>
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
                borderRadius: 4,
              }}
            >
              <Typography variant="h2" sx={{ mb: 3 }}>
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
                        variant="outlined"
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
                        variant="outlined"
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
                      variant="outlined"
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
                      variant="outlined"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Raison"
                      name="motif"
                      value={formData.motif}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={2}
                      variant="outlined"
                      placeholder="Ex: Réapprovisionnement, Utilisation interne, Don, etc."
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
                        Enregistrer
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Modal>
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

export default GestionStock; 