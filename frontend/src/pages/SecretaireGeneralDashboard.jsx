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
    useTheme,
    alpha,
    ThemeProvider,
    createTheme,
    CssBaseline,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    Snackbar
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    PendingActions as PendingIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getAllDemandes, finaliserDemande, rejectDemande } from '../api/demande';
import {
    PieChart,
    Pie,
    LineChart,
    Line,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';

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
            fontSize: "2rem",
            fontWeight: 600,
            color: COLORS.secondary,
        },
        h2: {
            fontSize: "1.5rem",
            fontWeight: 600,
            color: COLORS.primary,
        },
        body1: {
            fontSize: "1rem",
            color: COLORS.text.primary,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 500,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});

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
    chartCard: {
        height: '100%',
        background: COLORS.background.card,
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        p: 2
    }
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div variants={itemVariants}>
        <Card sx={{
            ...cardStyles.statCard,
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
            border: `1px solid ${alpha(color, 0.2)}`
        }}>
            <CardContent>
                <Box 
                    display="flex" 
                    alignItems="center" 
                    mb={2}
                    sx={{
                        backgroundColor: alpha(color, 0.1),
                        borderRadius: '12px',
                        p: 1.5,
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
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: COLORS.text.secondary,
                            fontSize: '0.875rem'
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    </motion.div>
);

const SecretaireGeneralDashboard = () => {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllDemandes();
                console.log('=== DONNÉES REÇUES DE L\'API ===');
                console.log('Nombre total de demandes:', data.length);
                
                // Afficher tous les statuts uniques pour déboguer
                const statutsUniques = [...new Set(data.map(d => d.statut))];
                console.log('Statuts uniques trouvés:', statutsUniques);
                
                // Afficher un exemple de demande pour vérifier la structure
                if (data.length > 0) {
                    console.log('Exemple de demande:', {
                        id: data[0].id,
                        statut: data[0].statut,
                        dateCreation: data[0].dateCreation
                    });
                }

                // Filtrer les demandes pour le secrétaire général
                // Inclure toutes les demandes qui sont soit en attente, soit traitées, soit rejetées
                const filteredData = data.filter(demande => 
                    demande.statut === 'envoyée au secre' || 
                    demande.statut === 'traitée' || 
                    demande.statut === 'refusé'
                );
                
                console.log('Nombre de demandes filtrées:', filteredData.length);
                console.log('Répartition des statuts dans les données filtrées:', 
                    filteredData.reduce((acc, d) => {
                        acc[d.statut] = (acc[d.statut] || 0) + 1;
                        return acc;
                    }, {})
                );
                
                setRows(filteredData);
                setLoading(false);
            } catch (err) {
                console.error('Erreur lors de la récupération des données:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 300000);
        return () => clearInterval(interval);
    }, []);

    // Statistiques calculées avec logs
    const stats = {
        total: rows.length,
        enAttente: rows.filter(d => d.statut === 'envoyée au secre').length,
        finalisees: rows.filter(d => d.statut === 'traitée').length,
        rejetees: rows.filter(d => d.statut === 'refusé').length
    };

    console.log('=== STATISTIQUES CALCULÉES ===');
    console.log('Total:', stats.total);
    console.log('En attente:', stats.enAttente);
    console.log('Finalisées:', stats.finalisees);
    console.log('Rejetées:', stats.rejetees);

    // Données pour les graphiques
    const chartData = {
        statutData: [
            { name: 'En attente', value: stats.enAttente, color: COLORS.warning },
            { name: 'Finalisées', value: stats.finalisees, color: COLORS.success },
            { name: 'Rejetées', value: stats.rejetees, color: COLORS.error }
        ]
    };

    // Traitement des données pour l'évolution
    const processEvolutionData = () => {
        const validDemandes = rows.filter(demande => {
            const date = new Date(demande.dateCreation);
            return !isNaN(date.getTime());
        });

        const groupedData = validDemandes.reduce((acc, demande) => {
            const date = new Date(demande.dateCreation);
            const moisAnnee = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
            
            if (!acc[moisAnnee]) {
                acc[moisAnnee] = {
                    date: moisAnnee,
                    total: 0,
                    traitees: 0,
                    rejetees: 0
                };
            }
            
            acc[moisAnnee].total++;
            
            if (demande.statut === 'traitée') {
                acc[moisAnnee].traitees++;
            } else if (demande.statut === 'refusé') {
                acc[moisAnnee].rejetees++;
            }
            
            return acc;
        }, {});

        // Obtenir la date actuelle
        const currentDate = new Date();
        const currentMonthYear = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

        // Ajouter la date actuelle si elle n'existe pas
        if (!groupedData[currentMonthYear]) {
            groupedData[currentMonthYear] = {
                date: currentMonthYear,
                total: 0,
                traitees: 0,
                rejetees: 0
            };
        }

        const evolutionArray = Object.values(groupedData)
            .sort((a, b) => {
                const [moisA, anneeA] = a.date.split('/').map(Number);
                const [moisB, anneeB] = b.date.split('/').map(Number);
                return (anneeA - anneeB) || (moisA - moisB);
            });

        // Si pas de données, retourner un tableau avec la date actuelle et le mois précédent
        if (evolutionArray.length === 0) {
            const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            const lastMonthYear = `${String(lastMonth.getMonth() + 1).padStart(2, '0')}/${lastMonth.getFullYear()}`;
            
            return [
                {
                    date: lastMonthYear,
                    total: 0,
                    traitees: 0,
                    rejetees: 0
                },
                {
                    date: currentMonthYear,
                    total: 0,
                    traitees: 0,
                    rejetees: 0
                }
            ];
        }

        return evolutionArray;
    };

    const evolutionArray = processEvolutionData();

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
                        {/* En-tête */}
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
                                Tableau de Bord - Secrétaire Général
                            </Typography>
                        </motion.div>

                        {/* Statistiques principales */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Total Demandes"
                                    value={stats.total}
                                    icon={<AssignmentIcon />}
                                    color={COLORS.primary}
                                    subtitle="Demandes à traiter"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="En Attente"
                                    value={stats.enAttente}
                                    icon={<PendingIcon />}
                                    color={COLORS.warning}
                                    subtitle="Demandes en attente"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Finalisées"
                                    value={stats.finalisees}
                                    icon={<CheckCircleIcon />}
                                    color={COLORS.success}
                                    subtitle="Demandes validées"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Rejetées"
                                    value={stats.rejetees}
                                    icon={<CancelIcon />}
                                    color={COLORS.error}
                                    subtitle="Demandes rejetées"
                                />
                            </Grid>
                        </Grid>

                        {/* Graphiques */}
                        <Grid container spacing={3}>
                            {/* Graphique circulaire */}
                            <Grid item xs={12} md={6}>
                                <Card sx={cardStyles.chartCard}>
                                    <Typography variant="h6" sx={{ mb: 2, color: COLORS.secondary }}>
                                        Répartition des Demandes
                                    </Typography>
                                    <Box sx={{ height: 400 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData.statutData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={80}
                                                    outerRadius={120}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chartData.statutData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Card>
                            </Grid>

                            {/* Graphique d'évolution */}
                            <Grid item xs={12} md={6}>
                                <Card sx={cardStyles.chartCard}>
                                    <Typography variant="h6" sx={{ mb: 2, color: COLORS.secondary }}>
                                        Évolution des Demandes
                                    </Typography>
                                    <Box sx={{ height: 400 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={evolutionArray}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke={alpha(COLORS.secondary, 0.1)} />
                                                <XAxis 
                                                    dataKey="date" 
                                                    tick={{ 
                                                        fill: COLORS.text.secondary,
                                                        fontSize: 12
                                                    }}
                                                    interval="preserveStartEnd"
                                                />
                                                <YAxis 
                                                    tick={{ 
                                                        fill: COLORS.text.secondary,
                                                        fontSize: 12
                                                    }}
                                                    allowDecimals={false}
                                                />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        backgroundColor: COLORS.background.paper,
                                                        border: `1px solid ${alpha(COLORS.secondary, 0.1)}`,
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                    }}
                                                    formatter={(value, name) => {
                                                        const labels = {
                                                            total: 'Total Demandes',
                                                            traitees: 'Demandes Validées',
                                                            rejetees: 'Demandes Rejetées'
                                                        };
                                                        return [value, labels[name]];
                                                    }}
                                                />
                                                <Legend 
                                                    formatter={(value) => {
                                                        const labels = {
                                                            total: 'Total Demandes',
                                                            traitees: 'Demandes Validées',
                                                            rejetees: 'Demandes Rejetées'
                                                        };
                                                        return labels[value] || value;
                                                    }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="total" 
                                                    name="Total Demandes"
                                                    stroke={COLORS.primary} 
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                    connectNulls
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="traitees" 
                                                    name="Demandes Validées"
                                                    stroke={COLORS.success} 
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                    connectNulls
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="rejetees" 
                                                    name="Demandes Rejetées"
                                                    stroke={COLORS.error} 
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                    connectNulls
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>

                        <Snackbar
                            open={snackbar.open}
                            autoHideDuration={3000}
                            onClose={() => setSnackbar({ ...snackbar, open: false })}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        >
                            <Alert
                                onClose={() => setSnackbar({ ...snackbar, open: false })}
                                severity={snackbar.severity}
                                sx={{ width: '100%' }}
                            >
                                {snackbar.message}
                            </Alert>
                        </Snackbar>
                    </motion.div>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default SecretaireGeneralDashboard; 