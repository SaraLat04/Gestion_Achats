import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
  Box,
  Chip,
  TablePagination,
  Button,
  Alert,
  MenuItem,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { useSnackbar } from 'notistack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getProduits } from '../../api/produit';

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
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 600,
          minWidth: 120,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 16,
        },
      },
    },
  },
});

// Liste prédéfinie des unités
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

const Inventaires = () => {
  const [produits, setProduits] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtres, setFiltres] = useState({
    recherche: '',
    unite: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const data = await getProduits();
      setProduits(data);
    } catch (error) {
      enqueueSnackbar('Erreur lors du chargement des produits', { variant: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatutStock = (quantite) => {
    if (quantite <= 0) return { label: 'Stock épuisé', color: 'error' };
    if (quantite <= 5) return { label: 'Stock faible', color: 'warning' };
    return { label: 'Stock suffisant', color: 'success' };
  };

  const produitsFiltres = produits.filter(produit => {
    const matchRecherche = !filtres.recherche || 
      produit.nom.toLowerCase().includes(filtres.recherche.toLowerCase()) ||
      produit.code.toLowerCase().includes(filtres.recherche.toLowerCase());
    const matchUnite = !filtres.unite || produit.unite === filtres.unite;
    return matchRecherche && matchUnite;
  });

  const exportToCSV = () => {
    const headers = ['Code', 'Produit', 'Quantité', 'Unité', 'Statut'];
    const csvData = produitsFiltres.map(p => {
      const statut = getStatutStock(p.quantite);
      return [
        p.code,
        p.nom,
        p.quantite,
        p.unite,
        statut.label
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire_stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculer les statistiques
  const statistiques = produits.reduce((acc, produit) => {
    acc.totalProduits++;
    acc.totalQuantite += Number(produit.quantite);
    if (produit.quantite <= 0) acc.produitsEpuises++;
    if (produit.quantite <= 5) acc.produitsFaibles++;
    return acc;
  }, { totalProduits: 0, totalQuantite: 0, produitsEpuises: 0, produitsFaibles: 0 });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" gutterBottom>
            Inventaire du Stock
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez et suivez l'état de votre stock
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  background: `linear-gradient(45deg, ${primaryColor} 30%, ${primaryColor}CC 90%)`,
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Produits
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {statistiques.totalProduits}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  background: `linear-gradient(45deg, ${secondaryColor} 30%, ${secondaryColor}CC 90%)`,
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
                      Quantité Totale
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                      {statistiques.totalQuantite.toLocaleString('fr-FR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  background: `linear-gradient(45deg, ${accentColor} 30%, ${accentColor}CC 90%)`,
                  color: 'white'
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Stock Faible
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {statistiques.produitsFaibles}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h2" sx={{ color: secondaryColor }}>
                    Liste des Produits
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={exportToCSV}
                  >
                    Exporter Excel
                  </Button>
                </Box>

                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Rechercher un produit"
                        name="recherche"
                        value={filtres.recherche}
                        onChange={handleChange}
                        placeholder="Nom ou code du produit"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Unité"
                        name="unite"
                        value={filtres.unite}
                        onChange={handleChange}
                        variant="outlined"
                      >
                        <MenuItem value="">Toutes les unités</MenuItem>
                        {UNITES.map(unite => (
                          <MenuItem key={unite} value={unite}>
                            {unite}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>

                {produitsFiltres.length === 0 ? (
                  <Alert severity="info">Aucun produit trouvé</Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                          <TableCell><strong>Code</strong></TableCell>
                          <TableCell><strong>Produit</strong></TableCell>
                          <TableCell><strong>Quantité</strong></TableCell>
                          <TableCell><strong>Unité</strong></TableCell>
                          <TableCell><strong>Statut</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {produitsFiltres
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((produit) => {
                            const statut = getStatutStock(produit.quantite);
                            return (
                              <TableRow 
                                key={produit.id}
                                hover
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: 'action.hover',
                                    transition: 'background-color 0.3s ease'
                                  }
                                }}
                              >
                                <TableCell>{produit.code}</TableCell>
                                <TableCell>{produit.nom}</TableCell>
                                <TableCell>{produit.quantite}</TableCell>
                                <TableCell>{produit.unite}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={statut.label} 
                                    color={statut.color}
                                    sx={{ 
                                      fontWeight: 'bold',
                                      minWidth: 120
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                        })}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={produitsFiltres.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      labelRowsPerPage="Lignes par page"
                    />
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default Inventaires; 