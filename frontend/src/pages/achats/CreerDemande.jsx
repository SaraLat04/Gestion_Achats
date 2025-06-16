import React, { useReducer } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Box,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Grid
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useState } from 'react';
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
    h5: {
      fontSize: "1.25rem",
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: primaryColor,
            },
          },
        },
      },
    },
  },
});

const initialState = {
  description: "",
  produits: [],
  produitNom: "",
  produitQte: "",
  justification: "",
  fichier: null
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "ADD_PRODUIT":
      return state.produitNom && state.produitQte
        ? {
            ...state,
            produits: [...state.produits, { nom: state.produitNom, quantite: state.produitQte }],
            produitNom: "",
            produitQte: ""
          }
        : state;
    case "REMOVE_PRODUIT":
      return { ...state, produits: state.produits.filter((_, i) => i !== action.index) };
    case "SET_FILE":
      return { ...state, fichier: action.file };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export default function AddDemande() {
  const [state, dispatch] = useReducer(reducer, initialState);


const [snackbar, setSnackbar] = useState({
  open: false,
  message: '',
  severity: 'success', // 'success' | 'error' | 'info' | 'warning'
});
const showSnackbar = (message, severity = 'success') => {
  setSnackbar({ open: true, message, severity });
};


  const user = JSON.parse(localStorage.getItem('user'));

  // Fonction envoyerDemande
  const envoyerDemande = async () => {
    if (!user) {
      showSnackbar("Utilisateur non connecté !", "error");
      return;
    }
  
    // Validation simple
    if (!state.description || !state.justification || state.produits.length === 0) {
      showSnackbar("Veuillez remplir tous les champs requis.", "warning");
      return;
    }
  
    const formData = new FormData();
    formData.append("user_id", user.id); // Ajout de l'ID de l'utilisateur
    formData.append("nom_demandeur", `${user.nom} ${user.prenom}`);
    formData.append("email_demandeur", user.email);
    formData.append("departement", user.departement); // assure-toi que tu l'enregistres à l'inscription
  
    formData.append("description", state.description);
    formData.append("justification", state.justification);
  
    if (state.fichier) {
      formData.append("piece_jointe", state.fichier);
    }
  
    // Ajouter les produits
    state.produits.forEach((produit, index) => {
      formData.append(`produits[${index}][nom]`, produit.nom);
      formData.append(`produits[${index}][quantite]`, produit.quantite);
    });
  
    try {
      const token = localStorage.getItem("token");
    
      const response = await axios.post("http://localhost:8000/api/demande", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    
      showSnackbar("Demande envoyée avec succès !", "success");
      dispatch({ type: "RESET" });
    } catch (error) {
      if (error.response) {
        console.error("Réponse du serveur :", error.response.data);
      } else if (error.request) {
        console.error("Pas de réponse reçue :", error.request);
      } else {
        console.error("Erreur de configuration :", error.message);
      }
      showSnackbar("Une erreur est survenue lors de l'envoi.", "error");

    }
  };

  // Fonction pour gérer la sélection du fichier
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    dispatch({ type: "SET_FILE", file });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" gutterBottom>
            Créer une Demande
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Remplissez le formulaire ci-dessous pour créer une nouvelle demande
          </Typography>
        </Box>

        <Card elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h2" gutterBottom sx={{ color: secondaryColor }}>
                Informations du Demandeur
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Nom du demandeur"
                    value={user ? `${user.nom} ${user.prenom}` : ''}
                    fullWidth
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Email du demandeur"
                    value={user ? user.email : ''}
                    fullWidth
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Département"
                    value={user ? user.departement : ''}
                    fullWidth
                    disabled
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2" gutterBottom sx={{ color: secondaryColor }}>
                Détails de la Demande
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Description de la demande"
                    value={state.description}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Justification"
                    value={state.justification}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "justification", value: e.target.value })}
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>

            

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2" gutterBottom sx={{ color: secondaryColor }}>
                Produits Demandés
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box flex={1}>
                  <TextField
                    label="Nom du produit"
                    value={state.produitNom}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "produitNom", value: e.target.value })}
                    fullWidth
                    variant="outlined"
                  />
                </Box>
                <Box flex={1}>
                  <TextField
                    label="Quantité"
                    type="number"
                    value={state.produitQte}
                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "produitQte", value: e.target.value })}
                    fullWidth
                    variant="outlined"
                  />
                </Box>
                <IconButton 
                  color="primary" 
                  onClick={() => dispatch({ type: "ADD_PRODUIT" })}
                  sx={{
                    bgcolor: `${primaryColor}10`,
                    '&:hover': {
                      bgcolor: `${primaryColor}20`
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Stack>

              {state.produits.length > 0 && (
                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell><strong>Nom du produit</strong></TableCell>
                        <TableCell><strong>Quantité</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {state.produits.map((produit, index) => (
                        <TableRow 
                          key={index}
                          hover
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'action.hover',
                              transition: 'background-color 0.3s ease'
                            }
                          }}
                        >
                          <TableCell>{produit.nom}</TableCell>
                          <TableCell>{produit.quantite}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="error"
                              onClick={() => dispatch({ type: "REMOVE_PRODUIT", index })}
                              sx={{
                                '&:hover': {
                                  bgcolor: `${accentColor}10`
                                }
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
              )}
            </Box>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                color="primary" 
                onClick={envoyerDemande}
                sx={{ minWidth: 200 }}
              >
                Envoyer
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => dispatch({ type: "RESET" })}
                sx={{ minWidth: 200 }}
              >
                Annuler
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
      <Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <MuiAlert 
    onClose={() => setSnackbar({ ...snackbar, open: false })} 
    severity={snackbar.severity} 
    variant="filled"
    elevation={6}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </MuiAlert>
</Snackbar>

    </ThemeProvider>
  );
}
