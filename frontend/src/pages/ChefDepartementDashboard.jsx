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
    CssBaseline,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
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
    Business as BusinessIcon,
    Print as PrintIcon,
    Description as PdfIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { getAllDemandes, sendToDean, rejectDemande } from '../api/demande';
import { getProduitsByDemande } from '../api/produitDemande';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../components/logo/fstg_logo.png';
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
    CartesianGrid,
    PieChart,
    Pie
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

const ChefDepartementDashboard = () => {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [openPdf, setOpenPdf] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [produits, setProduits] = useState([]);
    const [evolutionData, setEvolutionData] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        enAttente: 0,
        envoyeesDoyen: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllDemandes();
                
                console.log('=== DONNÉES BRUTES DE L\'API (avec validations attendues) ===');
                console.log('Données complètes:', data);
                
                // Calcul des statistiques basées sur le champ valide_par
                let envoyeesDoyenCount = 0;
                let enAttenteCount = 0;

                data.forEach(demande => {
                    console.log(`Demande ${demande.id}:`, { statut: demande.statut, valide_par: demande.valide_par });

                    // Compter les demandes validées par le chef en utilisant le champ valide_par
                    if (demande.valide_par === 'chef_depa') {
                        envoyeesDoyenCount++;
                    }

                    // Compter les statuts actuels pour les autres statistiques
                    if (demande.statut === 'en attente') {
                        enAttenteCount++;
                    } else if (demande.statut === 'envoyée au doyen') {
                        envoyeesDoyenCount++;
                    }
                     // Ajoutez d'autres statuts ici si nécessaire pour le graphique

                });

                const newStats = {
                    total: data.length,
                    enAttente: enAttenteCount,
                    envoyeesDoyen: envoyeesDoyenCount,
                };

                console.log('=== STATISTIQUES CALCULÉES (basées sur valide_par pour Envoyées Doyen) ===');
                console.log('Nouvelles statistiques:', newStats);
                
                setStats(newStats);

                // Adaptation de la logique d'évolution pour utiliser valide_par pour la ligne 'envoyeesDoyen'
                const demandesParJour = data.reduce((acc, demande) => {
                    const date = new Date(demande.date_demande);
                    const jourMoisAnnee = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    
                    if (!acc[jourMoisAnnee]) {
                        acc[jourMoisAnnee] = {
                            date: jourMoisAnnee,
                            total: 0,
                            enAttente: 0,
                            envoyeesDoyen: 0,
                        };
                    }
                    
                    acc[jourMoisAnnee].total++;
                    
                    if (demande.valide_par === 'chef_depa') {
                         acc[jourMoisAnnee].envoyeesDoyen++;
                     }

                    if (demande.statut === 'en attente') {
                        acc[jourMoisAnnee].enAttente++;
                    } else if (demande.statut === 'envoyée au doyen') {
                        acc[jourMoisAnnee].envoyeesDoyen++;
                    } // Ajoutez d'autres statuts si nécessaire (traitée, refusé)
                    
                    return acc;
                }, {});

                // Obtenir la date actuelle et celle d'il y a 7 jours
                const currentDate = new Date();
                const lastWeek = new Date(currentDate);
                lastWeek.setDate(currentDate.getDate() - 7);

                // Créer un tableau de toutes les dates entre lastWeek et currentDate
                const allDates = [];
                let currentDatePointer = new Date(lastWeek);
                while (currentDatePointer <= currentDate) {
                    const dateStr = `${String(currentDatePointer.getDate()).padStart(2, '0')}/${String(currentDatePointer.getMonth() + 1).padStart(2, '0')}/${currentDatePointer.getFullYear()}`;
                    allDates.push(dateStr);
                    currentDatePointer.setDate(currentDatePointer.getDate() + 1);
                }

                // Créer le tableau final avec toutes les dates
                const evolutionArray = allDates.map(date => ({
                    date,
                    total: demandesParJour[date]?.total || 0,
                    enAttente: demandesParJour[date]?.enAttente || 0,
                    envoyeesDoyen: demandesParJour[date]?.envoyeesDoyen || 0,
                }));

                console.log('Données d\'évolution:', evolutionArray);
                setEvolutionData(evolutionArray);

            } catch (err) {
                console.error('Erreur lors de la récupération des données:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleViewProduitsPDF = async (demandeId, nomU, nomDep) => {
        try {
            const produitsData = await getProduitsByDemande(demandeId);
            setProduits(produitsData);
            
            const doc = new jsPDF();
            doc.addImage(logo, 'PNG', 10, 10, 40, 20);
            doc.addImage(logo, 'PNG', 160, 10, 40, 20);

            doc.setFontSize(16);
            doc.text(`Demande d'achat #${demandeId}`, 105, 40, { align: 'center' });

            doc.setFontSize(12);
            const infos = [
                `ID de la demande : ${demandeId}`,
                `Demandeur : ${nomU || 'Non spécifié'}`,
                `Département : ${nomDep || 'Non spécifié'}`,
            ];
            infos.forEach((line, i) => {
                doc.text(line, 14, 50 + i * 8);
            });

            const productRows = produitsData.map((prod, i) => [
                i + 1,
                prod.nom,
                prod.quantite,
                prod.description || '',
            ]);

            autoTable(doc, {
                head: [['#', 'Produit', 'Quantité', 'Description']],
                body: productRows,
                startY: 80,
                theme: 'grid',
                headStyles: { fillColor: [179, 107, 57] },
                styles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 80 },
                },
            });

            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            setPdfUrl(url);
            setOpenPdf(true);
        } catch (error) {
            console.error("Erreur lors de la génération du PDF :", error);
            setSnackbar({ open: true, message: "Erreur lors de la génération du PDF", severity: "error" });
        }
    };

    const handlePrint = async (demandeId, nomU, nomDep) => {
        try {
            const produitsData = await getProduitsByDemande(demandeId);
            const doc = new jsPDF();
            
            doc.addImage(logo, 'PNG', 10, 10, 40, 20);
            doc.addImage(logo, 'PNG', 160, 10, 40, 20);

            doc.setFontSize(16);
            doc.text(`Demande d'achat #${demandeId}`, 105, 40, { align: 'center' });

            doc.setFontSize(12);
            const infos = [
                `ID de la demande : ${demandeId}`,
                `Demandeur : ${nomU || 'Non spécifié'}`,
                `Département : ${nomDep || 'Non spécifié'}`,
            ];
            infos.forEach((line, i) => {
                doc.text(line, 14, 50 + i * 8);
            });

            const productRows = produitsData.map((prod, i) => [
                i + 1,
                prod.nom,
                prod.quantite,
                prod.description || '',
            ]);

            autoTable(doc, {
                head: [['#', 'Produit', 'Quantité', 'Description']],
                body: productRows,
                startY: 80,
                theme: 'grid',
                headStyles: { fillColor: [179, 107, 57] },
                styles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 80 },
                },
            });

            doc.save(`Demande_${demandeId}.pdf`);
        } catch (error) {
            console.error("Erreur lors de l'impression :", error);
            setSnackbar({ open: true, message: "Erreur lors de l'impression", severity: "error" });
        }
    };

    const handleValider = async (id) => {
        try {
            await sendToDean(id);
            setSnackbar({ open: true, message: 'Demande validée avec succès', severity: 'success' });
            const updatedRows = rows.map(row => 
                row.id === id ? { ...row, statut: 'envoyée au doyen' } : row
            );
            setRows(updatedRows);
        } catch (error) {
            console.error("Erreur lors de la validation :", error);
            setSnackbar({ open: true, message: `Erreur : ${error.message || 'Erreur inconnue'}`, severity: 'error' });
        }
    };

    const handleRejeter = async (id) => {
        try {
            await rejectDemande(id);
            setSnackbar({ open: true, message: 'Demande rejetée avec succès', severity: 'info' });
            const updatedRows = rows.map(row => 
                row.id === id ? { ...row, statut: 'refusé' } : row
            );
            setRows(updatedRows);
        } catch (error) {
            console.error('Erreur lors du rejet de la demande :', error);
            setSnackbar({ open: true, message: `Erreur : ${error.message || 'Erreur inconnue'}`, severity: 'error' });
        }
    };

    const openConfirmDialog = (action, id) => {
        setConfirmAction({ action, id });
        setConfirmDialogOpen(true);
    };

    const renderActions = (row) => {
        const { statut, id } = row;

        if (statut === 'refusé') {
            return <Typography color="error" sx={{ fontWeight: 'bold' }}>Rejetée</Typography>;
        }

        if (statut === 'en attente') {
            return (
                <Stack direction="row" spacing={1}>
                    <Button 
                        variant="contained" 
                        color="success" 
                        onClick={() => openConfirmDialog('valider', id)}
                        sx={{ minWidth: 100 }}
                    >
                        Valider
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={() => openConfirmDialog('rejeter', id)}
                        sx={{ minWidth: 100 }}
                    >
                        Rejeter
                    </Button>
                </Stack>
            );
        } else if (statut === 'envoyée au doyen') {
            return <Typography sx={{ color: 'success.main', fontWeight: 'bold' }}>Envoyée au doyen</Typography>;
        }

        return <Typography color="textSecondary">-</Typography>;
    };

    // Données pour les graphiques
    const chartData = {
        statutData: [
            { name: 'En attente', value: stats.enAttente, color: theme.palette.warning.main },
            { name: 'Envoyées au doyen', value: stats.envoyeesDoyen, color: theme.palette.success.main }
        ]
    };

    // Fonction pour obtenir la couleur du statut
    const getStatusColor = (statut) => {
        switch (statut) {
            case 'en attente':
                return theme.palette.warning.main;
            case 'envoyée au doyen':
                return theme.palette.success.main;
            case 'traitée':
                return theme.palette.success.main;
            case 'refusé':
                return theme.palette.error.main;
            default:
                return theme.palette.text.secondary;
        }
    };

    // Fonction pour formater la date
    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Date invalide';
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Date invalide';
        }
    };

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
                                Tableau de Bord - Chef de Département
                            </Typography>
                        </motion.div>

                        {/* Statistiques principales */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={4}>
                                <StatCard
                                    title="Total des Demandes"
                                    value={stats.total}
                                    icon={<AssignmentIcon />}
                                    color={theme.palette.primary.main}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <StatCard
                                    title="En Attente de Validation"
                                    value={stats.enAttente}
                                    icon={<PendingIcon />}
                                    color={theme.palette.warning.main}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <StatCard
                                    title="Envoyées au Doyen"
                                    value={stats.envoyeesDoyen}
                                    icon={<CheckCircleIcon />}
                                    color={theme.palette.success.main}
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
                                                    interval={0}
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
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
                                                            enAttente: 'En Attente',
                                                            envoyeesDoyen: 'Envoyées au Doyen',
                                                        };
                                                        return [value, labels[name]];
                                                    }}
                                                    labelFormatter={(label) => `Date: ${label}`}
                                                />
                                                <Legend 
                                                    formatter={(value) => {
                                                        const labels = {
                                                            total: 'Total Demandes',
                                                            enAttente: 'En Attente',
                                                            envoyeesDoyen: 'Envoyées au Doyen',
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
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="enAttente" 
                                                    name="En Attente"
                                                    stroke={COLORS.warning} 
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="envoyeesDoyen" 
                                                    name="Validées par Chef (pour Doyen)"
                                                    stroke={COLORS.success} 
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Dialogs et Snackbar */}
                        <Dialog
                            open={openPdf}
                            onClose={() => setOpenPdf(false)}
                            fullWidth
                            maxWidth="md"
                            PaperProps={{
                                sx: {
                                    borderRadius: 2,
                                    padding: 2
                                }
                            }}
                        >
                            <DialogTitle sx={{ color: COLORS.secondary, fontWeight: 600 }}>
                                Prévisualisation de la demande
                            </DialogTitle>
                            <DialogContent>
                                {pdfUrl && (
                                    <iframe
                                        title="PDF Viewer"
                                        src={pdfUrl}
                                        width="100%"
                                        height="500px"
                                        style={{ border: 'none' }}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={confirmDialogOpen}
                            onClose={() => setConfirmDialogOpen(false)}
                            PaperProps={{
                                sx: {
                                    borderRadius: 2,
                                    padding: 2
                                }
                            }}
                        >
                            <DialogTitle sx={{ color: COLORS.secondary, fontWeight: 600 }}>
                                Confirmation
                            </DialogTitle>
                            <DialogContent>
                                <Typography>
                                    {confirmAction?.action === 'valider'
                                        ? "Êtes-vous sûr de vouloir valider cette demande ?"
                                        : "Êtes-vous sûr de vouloir rejeter cette demande ?"}
                                </Typography>
                                <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setConfirmDialogOpen(false)}
                                        sx={{
                                            borderColor: COLORS.secondary,
                                            color: COLORS.secondary,
                                            '&:hover': {
                                                borderColor: COLORS.secondary,
                                                backgroundColor: `${COLORS.secondary}10`
                                            }
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color={confirmAction?.action === 'valider' ? 'success' : 'error'}
                                        onClick={() => {
                                            if (confirmAction?.action === 'valider') {
                                                handleValider(confirmAction.id);
                                            } else if (confirmAction?.action === 'rejeter') {
                                                handleRejeter(confirmAction.id);
                                            }
                                            setConfirmDialogOpen(false);
                                        }}
                                    >
                                        Confirmer
                                    </Button>
                                </Stack>
                            </DialogContent>
                        </Dialog>

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

export default ChefDepartementDashboard; 