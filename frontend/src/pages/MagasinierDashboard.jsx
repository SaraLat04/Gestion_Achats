import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Container,
    CircularProgress,
    Alert,
    Chip,
    useTheme,
    alpha,
    ThemeProvider,
    createTheme,
    CssBaseline
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    LocalShipping as LocalShippingIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';
import { getDashboardStats, getAlertesStock } from '../api/magasinierApi';

// Définition des couleurs principales UCA
const COLORS = {
    primary: '#B36B39',    // Couleur bronze/cuivre du logo
    secondary: '#2C3E50',  // Bleu foncé pour le contraste
    success: '#16a34a',    // Vert
    warning: '#E67E22',    // Orange
    error: '#E74C3C',      // Rouge accent
    info: '#3498DB',       // Bleu clair
    background: {
        light: '#F5F5F5',  // Gris clair pour le fond
        paper: '#ffffff',
        card: '#ffffff'
    },
    text: {
        primary: '#2C3E50',
        secondary: '#7F8C8D'
    }
};

// Création du thème UCA
const theme = createTheme({
    palette: {
        primary: {
            main: COLORS.primary,
            contrastText: "#ffffff",
        },
        secondary: {
            main: COLORS.secondary,
            contrastText: "#ffffff",
        },
        background: {
            default: COLORS.background.light,
        },
    },
    typography: {
        fontFamily: '"Roboto", "Arial", sans-serif',
        h1: {
            fontSize: "2.5rem",
            fontWeight: 700,
            color: COLORS.secondary,
        },
        h2: {
            fontSize: "2rem",
            fontWeight: 600,
            color: COLORS.primary,
        },
        h4: {
            fontSize: "1.75rem",
            fontWeight: 600,
            color: COLORS.secondary,
        },
        h6: {
            fontSize: "1.25rem",
            fontWeight: 600,
            color: COLORS.primary,
        },
        body1: {
            fontSize: "1rem",
            color: COLORS.text.primary,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                    }
                }
            }
        },
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
                    background: `linear-gradient(45deg, ${COLORS.primary} 30%, ${COLORS.primary}CC 90%)`,
                    "&:hover": {
                        background: `linear-gradient(45deg, ${COLORS.primary}CC 30%, ${COLORS.primary} 90%)`,
                    },
                },
                containedSecondary: {
                    background: `linear-gradient(45deg, ${COLORS.secondary} 30%, ${COLORS.secondary}CC 90%)`,
                    "&:hover": {
                        background: `linear-gradient(45deg, ${COLORS.secondary}CC 30%, ${COLORS.secondary} 90%)`,
                    },
                },
            }
        }
    }
});

// Styles des cartes
const cardStyles = {
    statCard: {
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        transition: 'all 0.3s ease',
        background: COLORS.background.card,
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
        }
    },
    alertCard: {
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
        }
    }
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <motion.div variants={itemVariants}>
        <Card sx={cardStyles.statCard}>
            <CardContent>
                <Box 
                    display="flex" 
                    alignItems="center" 
                    mb={2}
                    sx={{
                        backgroundColor: alpha(color, 0.1),
                        borderRadius: '8px',
                        p: 1,
                        width: 'fit-content'
                    }}
                >
                    {React.cloneElement(icon, { 
                        style: { 
                            color,
                            fontSize: 28,
                            marginRight: 8
                        } 
                    })}
                    <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                            color: COLORS.text.primary,
                            fontWeight: 600
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Typography 
                    variant="h4" 
                    component="div" 
                    sx={{ 
                        color: COLORS.text.primary,
                        fontWeight: 700,
                        mb: 1
                    }}
                >
                    {value}
                </Typography>
                {subtitle && (
                    <Box display="flex" alignItems="center" mt={1}>
                        {trend && (
                            trend > 0 ? 
                                <TrendingUpIcon sx={{ color: COLORS.success, mr: 1 }} /> :
                                <TrendingDownIcon sx={{ color: COLORS.error, mr: 1 }} />
                        )}
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: COLORS.text.secondary,
                                fontSize: '0.875rem'
                            }}
                        >
                            {subtitle}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

const MagasinierDashboard = () => {
    const theme = useTheme();
    const [dashboardData, setDashboardData] = useState(null);
    const [alertes, setAlertes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockData, setStockData] = useState([]);
    const [categorieData, setCategorieData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, alertesData] = await Promise.all([
                    getDashboardStats(),
                    getAlertesStock()
                ]);
                setDashboardData(statsData);
                setAlertes(alertesData);

                // Préparer les données pour les graphiques
                if (statsData.produits_stock_faible) {
                    // Calculer les niveaux de stock en utilisant tous les produits
                    const tousProduits = statsData.produits_stock_faible;
                    const stockLevels = [
                        { 
                            name: 'Normal', 
                            value: tousProduits.filter(p => p.quantite > 5).length,
                            color: theme.palette.success.main
                        },
                        { 
                            name: 'Faible', 
                            value: tousProduits.filter(p => p.quantite <= 5 && p.quantite > 2).length,
                            color: theme.palette.warning.main
                        },
                        { 
                            name: 'Critique', 
                            value: tousProduits.filter(p => p.quantite <= 2).length,
                            color: theme.palette.error.main
                        }
                    ];

                    // Vérification des données pour le débogage
                    console.log('Niveaux de stock:', {
                        total: tousProduits.length,
                        normal: stockLevels[0].value,
                        faible: stockLevels[1].value,
                        critique: stockLevels[2].value,
                        produits: tousProduits.map(p => ({ nom: p.nom, quantite: p.quantite }))
                    });

                    setStockData(stockLevels);

                    // Données pour le graphique en camembert
                    const categories = {};
                    statsData.produits_stock_faible.forEach(produit => {
                        const cat = produit.categorie.nom;
                        categories[cat] = (categories[cat] || 0) + 1;
                    });
                    const categorieArray = Object.entries(categories).map(([name, value]) => ({
                        name,
                        value
                    }));
                    setCategorieData(categorieArray);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Rafraîchir les données toutes les 5 minutes
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const { statistiques_generales } = dashboardData;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ 
                backgroundColor: COLORS.background.light,
                minHeight: '100vh',
                py: 4
            }}>
                <Container maxWidth="lg">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {/* En-tête animé */}
                        <motion.div variants={itemVariants}>
                            <Typography 
                                variant="h1" 
                                component="h1" 
                                sx={{ 
                                    mb: 4,
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: -8,
                                        left: 0,
                                        width: '60px',
                                        height: '4px',
                                        backgroundColor: COLORS.primary,
                                        borderRadius: '2px'
                                    }
                                }}
                            >
                                Tableau de Bord - Magasinier
                            </Typography>
                        </motion.div>

                        {/* Statistiques principales */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Produits"
                                    value={statistiques_generales.total_produits}
                                    icon={<InventoryIcon />}
                                    color={COLORS.primary}
                                    subtitle="Produits en inventaire"
                                    trend={5}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Valeur Stock"
                                    value={`${statistiques_generales.valeur_stock.toLocaleString()} DH`}
                                    icon={<LocalShippingIcon />}
                                    color={COLORS.success}
                                    subtitle="Valeur totale"
                                    trend={-2}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Stock Faible"
                                    value={alertes.stock_faible.length}
                                    icon={<WarningIcon />}
                                    color={COLORS.warning}
                                    subtitle="≤ 5 unités"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Stock Critique"
                                    value={alertes.stock_critique.length}
                                    icon={<WarningIcon />}
                                    color={COLORS.error}
                                    subtitle="≤ 2 unités"
                                />
                            </Grid>
                        </Grid>

                        {/* Graphiques */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={6}>
                                <motion.div variants={itemVariants}>
                                    <Card sx={{ 
                                        ...cardStyles.statCard,
                                        height: '100%'
                                    }}>
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{ 
                                                    color: COLORS.text.primary,
                                                    fontWeight: 600,
                                                    mb: 3
                                                }}
                                            >
                                                Niveaux de Stock
                                            </Typography>
                                            <Box sx={{ height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart 
                                                        data={stockData}
                                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <XAxis 
                                                            dataKey="name" 
                                                            tick={{ 
                                                                fill: COLORS.text.secondary,
                                                                fontSize: 12
                                                            }}
                                                        />
                                                        <YAxis 
                                                            tick={{ 
                                                                fill: COLORS.text.secondary,
                                                                fontSize: 12
                                                            }}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ 
                                                                backgroundColor: COLORS.background.paper,
                                                                border: `1px solid ${alpha(COLORS.secondary, 0.1)}`,
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                            }}
                                                        />
                                                        <Legend />
                                                        <Bar 
                                                            dataKey="value" 
                                                            animationDuration={2000}
                                                            radius={[4, 4, 0, 0]}
                                                        >
                                                            {stockData.map((entry, index) => (
                                                                <Cell 
                                                                    key={`cell-${index}`} 
                                                                    fill={entry.color}
                                                                />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <motion.div variants={itemVariants}>
                                    <Card sx={{ 
                                        ...cardStyles.statCard,
                                        height: '100%'
                                    }}>
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{ 
                                                    color: COLORS.text.primary,
                                                    fontWeight: 600,
                                                    mb: 3
                                                }}
                                            >
                                                Répartition par Catégorie
                                            </Typography>
                                            <Box sx={{ height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={categorieData}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            animationDuration={2000}
                                                        >
                                                            {categorieData.map((entry, index) => (
                                                                <Cell 
                                                                    key={`cell-${index}`} 
                                                                    fill={Object.values(COLORS)[index % 6]}
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip 
                                                            contentStyle={{ 
                                                                backgroundColor: COLORS.background.paper,
                                                                border: `1px solid ${alpha(COLORS.secondary, 0.1)}`,
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                            }}
                                                        />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        </Grid>

                        {/* Section des alertes importantes */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <motion.div variants={itemVariants}>
                                    <Card 
                                        sx={{ 
                                            ...cardStyles.alertCard,
                                            bgcolor: alpha(COLORS.warning, 0.1)
                                        }}
                                    >
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{ 
                                                    color: COLORS.warning,
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <WarningIcon />
                                                Produits en Stock Critique
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: COLORS.text.secondary,
                                                    mb: 2
                                                }}
                                            >
                                                Ces produits nécessitent une attention immédiate. Veuillez procéder à leur réapprovisionnement.
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                {alertes.stock_critique.map((produit, index) => (
                                                    <motion.div
                                                        key={produit.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Chip
                                                            label={`${produit.nom} (${produit.quantite} ${produit.unite})`}
                                                            sx={{ 
                                                                m: 0.5,
                                                                backgroundColor: alpha(COLORS.warning, 0.2),
                                                                color: COLORS.warning,
                                                                fontWeight: 500,
                                                                '&:hover': {
                                                                    backgroundColor: alpha(COLORS.warning, 0.3)
                                                                }
                                                            }}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <motion.div variants={itemVariants}>
                                    <Card 
                                        sx={{ 
                                            ...cardStyles.alertCard,
                                            bgcolor: alpha(COLORS.error, 0.1)
                                        }}
                                    >
                                        <CardContent>
                                            <Typography 
                                                variant="h6" 
                                                gutterBottom
                                                sx={{ 
                                                    color: COLORS.error,
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <WarningIcon />
                                                Produits Épuisés
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: COLORS.text.secondary,
                                                    mb: 2
                                                }}
                                            >
                                                Ces produits sont complètement épuisés. Une commande urgente est nécessaire.
                                            </Typography>
                                            <Box sx={{ mt: 2 }}>
                                                {alertes.stock_epuise.map((produit, index) => (
                                                    <motion.div
                                                        key={produit.id}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Chip
                                                            label={`${produit.nom} (${produit.unite})`}
                                                            sx={{ 
                                                                m: 0.5,
                                                                backgroundColor: alpha(COLORS.error, 0.2),
                                                                color: COLORS.error,
                                                                fontWeight: 500,
                                                                '&:hover': {
                                                                    backgroundColor: alpha(COLORS.error, 0.3)
                                                                }
                                                            }}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </motion.div>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default MagasinierDashboard; 