import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Chip,
    Alert,
    CircularProgress,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Container,
    Grid
} from '@mui/material';
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
          minWidth: 100,
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

const AlerteStock = () => {
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduits = async () => {
            try {
                const data = await getProduits();
                setProduits(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProduits();
    }, []);

    const produitsAlerte = produits.filter(produit => produit.quantite <= 5);

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress sx={{ color: primaryColor }} />
                    </Box>
                </Container>
            </ThemeProvider>
        );
    }

    if (error) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                </Container>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h1" gutterBottom>
                        Alertes de Stock
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Surveillez les niveaux de stock de vos produits
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Alert 
                                    severity="info" 
                                    sx={{ 
                                        mb: 3,
                                        '& .MuiAlert-icon': {
                                            color: secondaryColor
                                        }
                                    }}
                                >
                                    Les produits dont la quantité est inférieure ou égale à 5 unités sont considérés comme étant en alerte de stock.
                                </Alert>
                                
                                {produitsAlerte.length === 0 ? (
                                    <Alert 
                                        severity="success" 
                                        sx={{ 
                                            mt: 2,
                                            '& .MuiAlert-icon': {
                                                color: primaryColor
                                            }
                                        }}
                                    >
                                        Aucune alerte de stock pour le moment
                                    </Alert>
                                ) : (
                                    <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'background.default' }}>
                                                    <TableCell><strong>Code</strong></TableCell>
                                                    <TableCell><strong>Produit</strong></TableCell>
                                                    <TableCell><strong>Stock Actuel</strong></TableCell>
                                                    <TableCell><strong>Unite</strong></TableCell>
                                                    <TableCell><strong>Statut</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {produitsAlerte.map((produit) => (
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
                                                                label={produit.quantite === 0 ? "Stock épuisé" : "Stock faible"} 
                                                                color={produit.quantite === 0 ? "error" : "warning"}
                                                                sx={{ 
                                                                    fontWeight: 'bold',
                                                                    minWidth: 120
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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

export default AlerteStock; 