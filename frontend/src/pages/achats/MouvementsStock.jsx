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
  MenuItem,
  Button,
  Typography,
  Box,
  Chip,
  TablePagination,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getProduits } from '../../api/produit';
import { getMouvementsStock } from '../../api/stock';

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
        },
      },
    },
  },
});

const MouvementsStock = () => {
  const [mouvements, setMouvements] = useState([]);
  const [produits, setProduits] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtres, setFiltres] = useState({
    date: '',
    type: '',
    produitId: ''
  });
  const [statistiques, setStatistiques] = useState({
    totalEntrees: 0,
    totalSorties: 0,
    dernierMouvement: null
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProduits();
    fetchMouvements();
  }, []);

  useEffect(() => {
    calculerStatistiques();
  }, [mouvements]);

  const fetchProduits = async () => {
    try {
      const data = await getProduits();
      setProduits(data);
    } catch (error) {
      enqueueSnackbar('Erreur lors du chargement des produits', { variant: 'error' });
    }
  };

  const fetchMouvements = async () => {
    try {
      const data = await getMouvementsStock();
      setMouvements(data);
    } catch (error) {
      enqueueSnackbar('Erreur lors du chargement des mouvements', { variant: 'error' });
    }
  };

  const calculerStatistiques = () => {
    if (mouvements.length === 0) {
      setStatistiques({
        totalEntrees: 0,
        totalSorties: 0,
        dernierMouvement: null
      });
      return;
    }

    const stats = mouvements.reduce((acc, mvt) => {
      const quantite = Number(mvt.quantite);
      if (mvt.type === 'entree') {
        acc.totalEntrees = Number(acc.totalEntrees) + quantite;
      } else {
        acc.totalSorties = Number(acc.totalSorties) + quantite;
      }
      return acc;
    }, { totalEntrees: 0, totalSorties: 0 });

    setStatistiques({
      totalEntrees: Math.round(stats.totalEntrees * 100) / 100,
      totalSorties: Math.round(stats.totalSorties * 100) / 100,
      dernierMouvement: mouvements[0]
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (event) => {
    setFiltres(prev => ({
      ...prev,
      date: event.target.value
    }));
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'entree':
        return { label: 'Entrée', color: 'success' };
      case 'sortie':
        return { label: 'Sortie', color: 'error' };
      default:
        return { label: 'Inconnu', color: 'default' };
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const mouvementsFiltres = mouvements.filter(mouvement => {
    const matchDate = !filtres.date || new Date(mouvement.date).toLocaleDateString() === new Date(filtres.date).toLocaleDateString();
    const matchType = !filtres.type || mouvement.type === filtres.type;
    const matchProduit = !filtres.produitId || mouvement.produit_id === parseInt(filtres.produitId);
    
    return matchDate && matchType && matchProduit;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Produit', 'Type', 'Quantité', 'Raison'];
    const csvData = mouvementsFiltres.map(m => [
      new Date(m.date).toLocaleDateString(),
      m.produit.nom,
      m.type === 'entree' ? 'Entrée' : 'Sortie',
      m.quantite,
      m.motif
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mouvements_stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" gutterBottom>
            Mouvements de Stock
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez et suivez tous les mouvements de stock de vos produits
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
                      Total Entrées
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {statistiques.totalEntrees.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  background: `linear-gradient(45deg, ${secondaryColor} 30%, ${secondaryColor}CC 90%)`,
                  color: '#FFFFFF'
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: '#FFFFFF' }}>
                      Total Sorties
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                      {statistiques.totalSorties.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
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
                      Dernier mouvement
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {statistiques.dernierMouvement ? 
                        `${new Date(statistiques.dernierMouvement.date).toLocaleDateString()} - ${statistiques.dernierMouvement.produit.nom}` 
                        : 'Aucun mouvement'}
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
                    Historique des mouvements
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
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Date"
                        name="date"
                        value={filtres.date}
                        onChange={handleDateChange}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Type de mouvement"
                        name="type"
                        value={filtres.type}
                        onChange={handleChange}
                        variant="outlined"
                      >
                        <MenuItem value="">Tous</MenuItem>
                        <MenuItem value="entree">Entrée</MenuItem>
                        <MenuItem value="sortie">Sortie</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Produit"
                        name="produitId"
                        value={filtres.produitId}
                        onChange={handleChange}
                        variant="outlined"
                      >
                        <MenuItem value="">Tous</MenuItem>
                        {produits.map((produit) => (
                          <MenuItem key={produit.id} value={produit.id}>
                            {produit.nom}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>
                </Paper>

                <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Produit</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Quantité</strong></TableCell>
                        <TableCell><strong>Raison</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mouvementsFiltres
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((mouvement) => {
                          const type = getTypeLabel(mouvement.type);
                          return (
                            <TableRow 
                              key={mouvement.id}
                              hover
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: 'action.hover',
                                  transition: 'background-color 0.3s ease'
                                }
                              }}
                            >
                              <TableCell>{new Date(mouvement.date).toLocaleDateString()}</TableCell>
                              <TableCell>{mouvement.produit.nom}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={type.label} 
                                  color={type.color}
                                  sx={{ 
                                    fontWeight: 'bold',
                                    minWidth: 100
                                  }}
                                />
                              </TableCell>
                              <TableCell>{mouvement.quantite}</TableCell>
                              <TableCell>{mouvement.motif}</TableCell>
                            </TableRow>
                          );
                      })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={mouvementsFiltres.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Lignes par page"
                  />
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default MouvementsStock; 