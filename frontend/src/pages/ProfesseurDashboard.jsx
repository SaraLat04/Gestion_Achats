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
    Assignment as AssignmentIcon,
    PendingActions as PendingIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
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
import { getProfesseurStats } from '../api/professeurApi';

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

const ProfesseurDashboard = () => {
    const theme = useTheme();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [demandesData, setDemandesData] = useState([]);
    const [statutData, setStatutData] = useState([]);
    const [evolutionData, setEvolutionData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await getProfesseurStats();
                setDashboardData(statsData);

                // Préparer les données pour les graphiques
                if (statsData.demandes) {
                    // Données pour le graphique des demandes par statut
                    const statutCounts = {
                        'En attente': statsData.demandes.filter(d => d.statut === 'en attente').length,
                        'Envoyée au doyen': statsData.demandes.filter(d => d.statut === 'envoyée au doyen').length,
                        'Envoyée au secrétaire': statsData.demandes.filter(d => d.statut === 'envoyée au secre').length,
                        'Traitée': statsData.demandes.filter(d => d.statut === 'traitée').length,
                        'Refusée': statsData.demandes.filter(d => d.statut === 'refusé').length
                    };

                    const statutArray = Object.entries(statutCounts).map(([name, value]) => ({
                        name,
                        value,
                        color: name === 'En attente' ? COLORS.warning :
                               name === 'Envoyée au doyen' ? COLORS.info :
                               name === 'Envoyée au secrétaire' ? COLORS.info :
                               name === 'Traitée' ? COLORS.success :
                               COLORS.error
                    }));

                    // Préparer les données pour le graphique d'évolution
                    const demandesParMois = statsData.demandes.reduce((acc, demande) => {
                        const date = new Date(demande.date_creation);
                        const moisAnnee = `${date.getMonth() + 1}/${date.getFullYear()}`;
                        
                        if (!acc[moisAnnee]) {
                            acc[moisAnnee] = {
                                date: moisAnnee,
                                total: 0,
                                traitees: 0,
                                enCours: 0
                            };
                        }
                        
                        acc[moisAnnee].total++;
                        if (demande.statut === 'traitée' || demande.statut === 'refusé') {
                            acc[moisAnnee].traitees++;
                        } else if (demande.statut !== 'en attente') {
                            acc[moisAnnee].enCours++;
                        }
                        
                        return acc;
                    }, {});

                    const evolutionArray = Object.values(demandesParMois)
                        .sort((a, b) => {
                            const [moisA, anneeA] = a.date.split('/');
                            const [moisB, anneeB] = b.date.split('/');
                            return (anneeA - anneeB) || (moisA - moisB);
                        });

                    setStatutData(statutArray);
                    setEvolutionData(evolutionArray);
                    setDemandesData(statsData.demandes);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                                Tableau de Bord - Mes Demandes
                            </Typography>
                        </motion.div>

                        {/* Statistiques principales */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="Total Demandes"
                                    value={statistiques_generales.total_demandes}
                                    icon={<AssignmentIcon />}
                                    color={COLORS.primary}
                                    subtitle="Toutes vos demandes"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="En Attente"
                                    value={statistiques_generales.demandes_en_attente}
                                    icon={<PendingIcon />}
                                    color={COLORS.warning}
                                    subtitle="Demandes en cours de traitement"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatCard
                                    title="En Cours"
                                    value={statistiques_generales.demandes_en_cours}
                                    icon={<AssignmentIcon />}
                                    color={COLORS.info}
                                    subtitle="Demandes en cours de validation"
                                />
                            </Grid>
                        </Grid>

                        {/* Graphiques */}
                        <Grid container spacing={3}>
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
                                                Statut des Demandes
                                            </Typography>
                                            <Box sx={{ height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart 
                                                        data={statutData}
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
                                                            {statutData.map((entry, index) => (
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
                                                Évolution des Demandes
                                            </Typography>
                                            <Box sx={{ height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart
                                                        data={evolutionData}
                                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(COLORS.secondary, 0.1)} />
                                                        <XAxis 
                                                            dataKey="date" 
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
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="total" 
                                                            name="Total Demandes"
                                                            stroke={COLORS.primary} 
                                                            strokeWidth={2}
                                                            dot={{ r: 4 }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                        <Line 
                                                            type="monotone" 
                                                            dataKey="enCours" 
                                                            name="Demandes en Cours"
                                                            stroke={COLORS.info} 
                                                            strokeWidth={2}
                                                            dot={{ r: 4 }}
                                                            activeDot={{ r: 6 }}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
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

export default ProfesseurDashboard; 