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
import { getAllDemandes, sendToSecretaireGeneral, rejectDemande } from '../api/demande';
import { getProduitsByDemande } from '../api/produitDemande';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../components/logo/fstg_logo.png';
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

const DoyenDashboard = () => {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [allDemandes, setAllDemandes] = useState([]);
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
        envoyeesSecretaire: 0,
        finalisees: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllDemandes();
                setAllDemandes(data);
                
                // Filtrer seulement les demandes en attente de validation par le doyen
                const filteredData = data.filter(demande => demande.statut === 'envoyée au doyen');
                setRows(filteredData);

                // Calcul des statistiques
                const newStats = {
                    total: data.length,
                    enAttente: data.filter(d => d.statut === 'envoyée au doyen').length,
                    envoyeesSecretaire: data.filter(d => d.statut === 'envoyée au secre' || d.statut === 'traitée').length,
                    finalisees: data.filter(d => d.statut === 'traitée').length
                };

                setStats(newStats);

                // Préparer les données pour le graphique d'évolution
                const demandesParJour = data.reduce((acc, demande) => {
                    const date = new Date(demande.date_demande);
                    const jourMoisAnnee = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    
                    if (!acc[jourMoisAnnee]) {
                        acc[jourMoisAnnee] = {
                            date: jourMoisAnnee,
                            total: 0,
                            enAttente: 0,
                            envoyeesSecretaire: 0,
                            finalisees: 0
                        };
                    }
                    
                    acc[jourMoisAnnee].total++;
                    
                    if (demande.statut === 'envoyée au doyen') {
                        acc[jourMoisAnnee].enAttente++;
                    } else if (demande.statut === 'envoyée au secre' || demande.statut === 'traitée' || (demande.statut === 'refusé' && demande.valide_par === 'secrétaire général')) {
                        acc[jourMoisAnnee].envoyeesSecretaire++;
                    } else if (demande.statut === 'traitée') {
                        acc[jourMoisAnnee].finalisees++;
                    }
                    
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
                    envoyeesSecretaire: demandesParJour[date]?.envoyeesSecretaire || 0,
                    finalisees: demandesParJour[date]?.finalisees || 0
                }));

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
            await sendToSecretaireGeneral(id);
            setSnackbar({ open: true, message: 'Demande validée et envoyée au secrétariat général', severity: 'success' });
            const updatedRows = rows.filter(row => row.id !== id);
            setRows(updatedRows);
            
            // Mettre à jour les statistiques
            setStats(prev => ({
                ...prev,
                enAttente: prev.enAttente - 1,
                envoyeesSecretaire: prev.envoyeesSecretaire + 1
            }));
        } catch (error) {
            console.error("Erreur lors de la validation :", error);
            setSnackbar({ open: true, message: `Erreur : ${error.message || 'Erreur inconnue'}`, severity: 'error' });
        }
    };

    const handleRejeter = async (id) => {
        try {
            await rejectDemande(id);
            setSnackbar({ open: true, message: 'Demande rejetée avec succès', severity: 'info' });
            const updatedRows = rows.filter(row => row.id !== id);
            setRows(updatedRows);
            
            // Mettre à jour les statistiques
            setStats(prev => ({
                ...prev,
                enAttente: prev.enAttente - 1,
                finalisees: prev.finalisees + 1
            }));
        } catch (error) {
            console.error('Erreur lors du rejet de la demande :', error);
            setSnackbar({ open: true, message: `Erreur : ${error.message || 'Erreur inconnue'}`, severity: 'error' });
        }
    };

    const openConfirmDialog = (action, id) => {
        setConfirmAction({ action, id });
        setConfirmDialogOpen(true);
    };

    // Données pour les graphiques
    const chartData = {
        statutData: [
            { name: 'En attente', value: stats.enAttente, color: theme.palette.warning.main },
            { name: 'Envoyées au secrétariat', value: stats.envoyeesSecretaire, color: theme.palette.info.main },
            { name: 'Finalisées', value: stats.finalisees, color: theme.palette.success.main }
        ]
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
                                Tableau de Bord - Doyen
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
                                    subtitle="Toutes les demandes"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="En Attente"
                                    value={stats.enAttente}
                                    icon={<PendingIcon />}
                                    color={COLORS.warning}
                                    subtitle="À valider"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Envoyées Secrétariat"
                                    value={stats.envoyeesSecretaire}
                                    icon={<BusinessIcon />}
                                    color={COLORS.info}
                                    subtitle="Validées par le doyen"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <StatCard
                                    title="Finalisées"
                                    value={stats.finalisees}
                                    icon={<CheckCircleIcon />}
                                    color={COLORS.success}
                                    subtitle="Traitements terminés"
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
                                        Évolution des Demandes (7 derniers jours)
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
                                                            envoyeesSecretaire: 'Envoyées au Secrétariat',
                                                            finalisees: 'Finalisées'
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
                                                            envoyeesSecretaire: 'Envoyées au Secrétariat',
                                                            finalisees: 'Finalisées'
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
                                                    dataKey="envoyeesSecretaire" 
                                                    name="Envoyées au Secrétariat"
                                                    stroke={COLORS.info} 
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="finalisees" 
                                                    name="Finalisées"
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
                                        ? "Êtes-vous sûr de vouloir valider cette demande et l'envoyer au secrétariat général ?"
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

export default DoyenDashboard;