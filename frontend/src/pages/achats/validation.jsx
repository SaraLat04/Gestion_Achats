import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Print as PrintIcon, Description as PdfIcon, Description, Close, Download as DownloadIcon } from '@mui/icons-material';
import { getAllDemandes, sendToDean,sendToSecretaireGeneral, finaliserDemande, rejectDemande } from '../../api/demande';

import { getProduitsByDemande } from '../../api/produitDemande' ; // adapte le chemin selon ton projet

import logo from '../../components/logo/fstg_logo.png';
import header from '/src/components/logo/header.PNG';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ThemeProvider, createTheme, CssBaseline, Container, Paper } from '@mui/material';

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
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          padding: '16px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: backgroundColor,
          fontWeight: 600,
          color: secondaryColor,
        },
        root: {
          borderBottom: `1px solid ${backgroundColor}`,
        },
      },
    },
  },
});

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

const headCells = [
  { id: 'request_no', align: 'left', disablePadding: false, label: 'Numéro de demande' },
  { id: 'user_name', align: 'left', disablePadding: true, label: 'Nom du demandeur' },
  { id: 'departement', align: 'left', disablePadding: true, label: 'Département' },
  { id: 'description', align: 'left', disablePadding: false, label: 'Description' },
  { id: 'actions', align: 'left', disablePadding: false, label: 'Actions' }
];

function RequestTableHead({ order, orderBy }) {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

RequestTableHead.propTypes = {
  order: PropTypes.any,
  orderBy: PropTypes.string
};

export default function RequestTable() {
  const [rows, setRows] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [openPdf, setOpenPdf] = useState(false);
  const [treatedRequests, setTreatedRequests] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
const [confirmAction, setConfirmAction] = useState(null);
const [produits, setProduits] = useState([]);
  const [descriptionDialog, setDescriptionDialog] = useState({ open: false, content: '', title: '' });
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
 // { action: 'valider' | 'rejeter', id: number }

  const order = 'asc';
  const orderBy = 'id';

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userRole = storedUser?.role;

  const fetchData = async () => {
    try {
      const data = await getAllDemandes();
      setRows(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes :', error);
    }
  };

const handleViewProduitsPDF = async (demandeId, nomU, nomDep) => {
  try {
    const produitsData = await getProduitsByDemande(demandeId); 
      const demandeInfo = rows.find(row => row.id === demandeId);
    setProduits(produitsData);
      
    const doc = new jsPDF();

      // Ajouter le header.png en haut du document
      doc.addImage(header, 'PNG', 10, 10, 190, 40);

    // --- Titre ---
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 62, 80); // Couleur bleu foncé
      doc.text("DEMANDE D'ACHAT", 105, 65, { align: 'center' });

    // --- Informations sur la demande ---
    doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
    const infos = [
        `Numéro de demande : ${demandeId}`,
        `Demandeur : ${nomU || 'Non spécifié'}`,
        `Département : ${nomDep || 'Non spécifié'}`
    ];
    infos.forEach((line, i) => {
        doc.text(line, 14, 75 + i * 8);
    });

      // --- Description ---
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Description :", 14, 115);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const descriptionLines = doc.splitTextToSize(demandeInfo?.description || 'Aucune description fournie', 180);
      doc.text(descriptionLines, 20, 125);

      // --- Justification ---
      const descHeight = descriptionLines.length * 7;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Justification :", 14, 125 + descHeight + 10);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const justificationLines = doc.splitTextToSize(demandeInfo?.justification || 'Aucune justification fournie', 180);
      doc.text(justificationLines, 20, 125 + descHeight + 20);

    // --- Table des produits ---
      const startY = 125 + descHeight + 20 + (justificationLines.length * 7) + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Liste des Produits :", 14, startY - 5);

    const productRows = produitsData.map((prod, i) => [
      i + 1,
      prod.nom,
      prod.quantite,
        prod.unite || 'U'
    ]);

    autoTable(doc, {
        head: [['#', 'Désignation', 'Quantité', 'Unité']],
      body: productRows,
        startY: startY,
      theme: 'grid',
        headStyles: {
          fillColor: [179, 107, 57], // Couleur bronze/cuivre
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 12
        },
        styles: {
          fontSize: 11,
          cellPadding: 5,
          lineColor: [44, 62, 80],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
      columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 120 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' }
        }
      });

      // --- Section Signature ---
      const lastTableY = doc.lastAutoTable.finalY || startY + (productRows.length * 10);
      const signatureY = lastTableY + 20;

      // Ligne de signature simple
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text("Signature :", 30, signatureY);
      doc.line(30, signatureY + 5, 90, signatureY + 5);

      // --- Pied de page ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text("Document généré automatiquement", 105, pageHeight - 10, { align: 'center' });

    // --- Générer l'URL du PDF et ouvrir la fenêtre ---
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
      const demandeInfo = rows.find(row => row.id === demandeId);
      
      const doc = new jsPDF();

      // Ajouter le header.png en haut du document
      doc.addImage(header, 'PNG', 10, 10, 190, 40);

      // --- Titre ---
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(44, 62, 80);
      doc.text("DEMANDE D'ACHAT", 105, 65, { align: 'center' });

      // --- Informations sur la demande ---
      doc.setFontSize(12);
      doc.setTextColor(44, 62, 80);
      const infos = [
        `Numéro de demande : ${demandeId}`,
        `Demandeur : ${nomU || 'Non spécifié'}`,
        `Département : ${nomDep || 'Non spécifié'}`
      ];
      infos.forEach((line, i) => {
        doc.text(line, 14, 75 + i * 8);
      });

      // --- Description ---
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Description :", 14, 115);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const descriptionLines = doc.splitTextToSize(demandeInfo?.description || 'Aucune description fournie', 180);
      doc.text(descriptionLines, 20, 125);

      // --- Justification ---
      const descHeight = descriptionLines.length * 7;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Justification :", 14, 125 + descHeight + 10);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const justificationLines = doc.splitTextToSize(demandeInfo?.justification || 'Aucune justification fournie', 180);
      doc.text(justificationLines, 20, 125 + descHeight + 20);

      // --- Table des produits ---
      const startY = 125 + descHeight + 20 + (justificationLines.length * 7) + 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Liste des Produits :", 14, startY - 5);

      const productRows = produitsData.map((prod, i) => [
        i + 1,
        prod.nom,
        prod.quantite,
        prod.unite || 'U'
      ]);

      autoTable(doc, {
        head: [['#', 'Désignation', 'Quantité', 'Unité']],
        body: productRows,
        startY: startY,
        theme: 'grid',
        headStyles: {
          fillColor: [179, 107, 57],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 12
        },
        styles: {
          fontSize: 11,
          cellPadding: 5,
          lineColor: [44, 62, 80],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 120 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' }
        }
      });

      // --- Section Signature ---
      const lastTableY = doc.lastAutoTable.finalY || startY + (productRows.length * 10);
      const signatureY = lastTableY + 20;

      // Ligne de signature simple
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text("Signature :", 30, signatureY);
      doc.line(30, signatureY + 5, 90, signatureY + 5);

      // --- Pied de page ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text("Document généré automatiquement", 105, pageHeight - 10, { align: 'center' });

      // --- Télécharger le PDF ---
      doc.save(`demande_achat_${demandeId}.pdf`);

    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
      setSnackbar({ open: true, message: "Erreur lors de la génération du PDF", severity: "error" });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    const storedRows = JSON.parse(localStorage.getItem('rows'));
    if (storedRows) {
      setRows(storedRows);
    } else {
      fetchData(); // Si localStorage est vide, récupérer depuis l'API
    }
  }, []);
  

  const viewPDF = async (row) => {
    // 1. Initialiser le document PDF
    const doc = new jsPDF();
  
    // 2. Charger la police arabe (à placer dans public/fonts/)
  
  
    // 3. Partie française (gauche)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text("ROYAUME DU MAROC", 14, 20);
    doc.text("Université Cadi Ayyad", 14, 27);
    doc.text("Faculté des Sciences et Techniques", 14, 34);
    doc.text("Gueliz - Marrakech", 14, 41);
    doc.text("Service des Achats", 14, 48);
  
    // 4. Partie arabe (droite)
    doc.setFont('Amiri', 'normal');
    doc.setFontSize(12);
    
    // Textes arabes avec positions
    const arabicTexts = [
      { text: 'المملكة المغربية', y: 20 }, // Royaume du Maroc
      { text: 'جامعة القاضي عياض', y: 27 }, // Université Cadi Ayyad
      { text: 'كلية العلوم والتقنيات', y: 34 }, // Faculté des Sciences et Techniques
      { text: 'كيليز - مراكش', y: 41 }, // Gueliz - Marrakech
      { text: 'مصلحة المشتريات', y: 48 } // Service des Achats
    ];
  
    arabicTexts.forEach(item => {
      doc.text(item.text, 195, item.y, { align: 'right' });
    });
  
    // 5. Ligne de séparation
    doc.setDrawColor(0);
    doc.line(10, 55, 200, 55);
  
    // 6. Titre principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text("DEMANDE D'ACHAT", 105, 65, { align: 'center' });
  
    // 7. Section Description
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Description :", 14, 80);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(row.description || 'Aucune description fournie', 180);
    doc.text(descriptionLines, 20, 90);
  
    // 8. Section Justification
    const descHeight = descriptionLines.length * 7;
    doc.setFont('helvetica', 'bold');
    doc.text("Justification :", 14, 90 + descHeight + 10);
    doc.setFont('helvetica', 'normal');
    const justificationLines = doc.splitTextToSize(row.justification || 'Aucune justification fournie', 180);
    doc.text(justificationLines, 20, 90 + descHeight + 20);
  
    // 9. Section Produits
    const startY = 90 + descHeight + 20 + (justificationLines.length * 7) + 15;
    const products = row.produits || [];
  
    if (products.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text("Liste des Produits :", 14, startY - 5);
  
      // Préparation des données pour le tableau
      const productsData = products.map((prod, index) => [
        index + 1,
        prod.nom || 'Non spécifié',
        prod.quantite || 0,
        prod.unite || 'U'
      ]);
  
      // Création du tableau
      doc.autoTable({
        startY: startY,
        head: [['N°', 'Désignation', 'Quantité', 'Unité']],
        body: productsData,
        margin: { left: 14 },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 120 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 }
        }
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text("Aucun produit listé dans cette demande.", 14, startY + 10);
    }
  
    // 10. Générer le PDF
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setOpenPdf(true);
  };

  const handleClosePdf = () => {
    setOpenPdf(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
  };

  const handleValider = async (id) => {
    try {
      if (!userRole) {
        console.error("Utilisateur non trouvé !");
        return;
      }
  
      let response;
  
      if (userRole === 'chef_depa') {
        response = await sendToDean(id);
      } else if (userRole === 'doyen') {
        response = await sendToSecretaireGeneral(id);
      } else if (userRole === 'secrétaire général') {
        response = await finaliserDemande(id); // Valider la demande sans la supprimer
      } else {
        console.error("Rôle non supporté");
        return;
      }
  
      setSnackbar({ open: true, message: 'Demande validée avec succès', severity: 'success' });
  
      // Mettre à jour l'état local des demandes
      const updatedRows = rows.map(row => 
        row.id === id ? { ...row, statut: 'validée' } : row
      );
      setRows(updatedRows);
  
      // Mettre à jour localStorage après modification
      localStorage.setItem('rows', JSON.stringify(updatedRows));
  
    } catch (error) {
      console.error("Erreur lors de la validation :", error);
      setSnackbar({ open: true, message: `Erreur : ${error.message || 'Erreur inconnue'}`, severity: 'error' });
    }
  };
    
  
  const handleRejeter = async (id) => {
    try {
      await rejectDemande(id);
  
      // Mettre à jour l'état local pour que la demande rejetée reste dans le tableau
      setRows(prevRows =>
        prevRows.map(row => 
          row.id === id ? { ...row, statut: 'refusé' } : row
        )
      );
  
      setSnackbar({ open: true, message: 'Demande rejetée avec succès', severity: 'info' });
    } catch (error) {
      console.error('Erreur lors du rejet de la demande :', error);
      setSnackbar({ open: true, message: `Erreur : ${error.message || 'Erreur inconnue'}`, severity: 'error' });
    }
  };
  
  // const handleRejeter = async (id) => {
  //   try {
  //     await rejectDemande(id);
  //     setSnackbar({ open: true, message: 'Demande rejetée avec succès', severity: 'info' });
  //     fetchData(); // Pour recharger la liste avec le nouveau statut
  //   } catch (error) {
  //     console.error('Erreur lors du rejet de la demande :', error);
  //     setSnackbar({ open: true, message: `Erreur : ${error.message || 'Erreur inconnue'}`, severity: 'error' });
  //   }
  // };
  
  

  const renderActions = (row) => {
    const { statut, id } = row;
  
    if (statut === 'refusé') {
      return <Typography color="error" sx={{ fontWeight: 'bold' }}>Rejetée</Typography>;
    }
  
    if (userRole === 'chef_depa') {
      if (statut === 'en attente') {
        return (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={() => openConfirmDialog('valider', id)}>
              Valider
            </Button>
            <Button variant="contained" color="error" onClick={() => openConfirmDialog('rejeter', id)}>
              Rejeter
            </Button>
          </Stack>
        );
      } else {
        return <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Envoyée au doyen</Typography>;
      }
    } else if (userRole === 'doyen') {
      if (statut === 'envoyée au doyen') {
        return (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={() => openConfirmDialog('valider', id)}>
              Valider
            </Button>
            <Button variant="contained" color="error" onClick={() => openConfirmDialog('rejeter', id)}>
              Rejeter
            </Button>
          </Stack>
        );
      } else {
        return <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Envoyée au secrétaire général</Typography>;
      }
    } else if (userRole === 'secrétaire général') {
      if (statut === 'envoyée au secre') {
        return (
          <Stack direction="row" spacing={1}>
            <Button variant="contained" color="success" onClick={() => openConfirmDialog('valider', id)}>
              Valider
            </Button>
            <Button variant="contained" color="error" onClick={() => openConfirmDialog('rejeter', id)}>
              Rejeter
            </Button>
          </Stack>
        );
      } else {
        return <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Traitée</Typography>;
      }
    }
  
    return <Typography color="textSecondary">-</Typography>;
  };
  
  
  const openConfirmDialog = (action, id) => {
    setConfirmAction({ action, id });
    setConfirmDialogOpen(true);
  };
  
  
  const toggleDescription = (id) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenDescription = (description, id) => {
    setDescriptionDialog({
      open: true,
      content: description,
      title: `Description de la demande #${id}`
    });
  };

  const handleCloseDescription = () => {
    setDescriptionDialog({ open: false, content: '', title: '' });
  };

  const renderDescription = (description, id) => {
    const maxLength = 10;
    
    if (!description) return 'Aucune description';
    
    return (
      <Box>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {description.length > maxLength 
            ? `${description.substring(0, maxLength)}...` 
            : description}
        </Typography>
        {description.length > maxLength && (
          <Link
            component="button"
            variant="body2"
            onClick={() => handleOpenDescription(description, id)}
            sx={{
              color: primaryColor,
              textDecoration: 'none',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '100%',
                height: '1px',
                bottom: 0,
                left: 0,
                backgroundColor: primaryColor,
                transform: 'scaleX(0)',
                transformOrigin: 'bottom right',
                transition: 'transform 0.3s ease-out'
              },
              '&:hover:after': {
                transform: 'scaleX(1)',
                transformOrigin: 'bottom left'
              }
            }}
          >
            Lire la suite
          </Link>
        )}
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" gutterBottom>
            Validation des Demandes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez et validez les demandes d'achat
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <TableContainer>
            <Table aria-labelledby="tableTitle">
              <RequestTableHead order={order} orderBy={orderBy} />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      key={row.id}
                      tabIndex={-1}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': {
                          backgroundColor: `${backgroundColor}80`,
                          transition: 'background-color 0.3s ease'
                        }
                      }}
                    >
                      <TableCell component="th" id={labelId} scope="row">
                        <Link
                          color="primary"
                          sx={{
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {row.id}
                        </Link>
                      </TableCell>
                      <TableCell>{row.utilisateur?.nom || 'Inconnu'} {row.utilisateur?.prenom || ''}</TableCell>
                      <TableCell>{row.departement}</TableCell>
                      <TableCell>{renderDescription(row.description, row.id)}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewProduitsPDF(row.id, row.utilisateur?.nom, row.departement)}
                            startIcon={<PdfIcon />}
                            sx={{
                              borderColor: primaryColor,
                              color: primaryColor,
                              '&:hover': {
                                borderColor: primaryColor,
                                backgroundColor: `${primaryColor}10`
                              }
                            }}
                          >
                            Voir la Demande
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handlePrint(row.id, row.utilisateur?.nom, row.departement)}
                            startIcon={<DownloadIcon />}
                            sx={{
                              background: `linear-gradient(45deg, ${primaryColor} 30%, ${primaryColor}CC 90%)`,
                              '&:hover': {
                                background: `linear-gradient(45deg, ${primaryColor}CC 30%, ${primaryColor} 90%)`,
                              }
                            }}
                          >
                            Télécharger
                          </Button>
                        </Stack>
                        {renderActions(row)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog
          open={openPdf}
          onClose={handleClosePdf}
          fullWidth
          maxWidth="md"
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 2
            }
          }}
        >
          <DialogTitle sx={{ color: secondaryColor, fontWeight: 600 }}>
            Prévisualisation du PDF
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

        <Dialog
          open={confirmDialogOpen}
          onClose={() => setConfirmDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 2
            }
          }}
        >
          <DialogTitle sx={{ color: secondaryColor, fontWeight: 600 }}>
            Confirmation
          </DialogTitle>
          <DialogContent>
            <Typography>
              {confirmAction?.action === 'valider'
                ? "Êtes-vous sûr de vouloir valider cette demande ?"
                : "Êtes-vous sûr de vouloir rejeter cette demande ?"}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (confirmAction?.action === 'valider') {
                    handleValider(confirmAction.id);
                  } else if (confirmAction?.action === 'rejeter') {
                    handleRejeter(confirmAction.id);
                  }
                  setConfirmDialogOpen(false);
                }}
                sx={{
                  background: `linear-gradient(45deg, ${primaryColor} 30%, ${primaryColor}CC 90%)`,
                  '&:hover': {
                    background: `linear-gradient(45deg, ${primaryColor}CC 30%, ${primaryColor} 90%)`,
                  }
                }}
              >
                Confirmer
              </Button>
              <Button
                variant="outlined"
                onClick={() => setConfirmDialogOpen(false)}
                sx={{
                  borderColor: secondaryColor,
                  color: secondaryColor,
                  '&:hover': {
                    borderColor: secondaryColor,
                    backgroundColor: `${secondaryColor}10`
                  }
                }}
              >
                Annuler
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>

        <Dialog
          open={descriptionDialog.open}
          onClose={handleCloseDescription}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 3,
              background: 'linear-gradient(to bottom, #ffffff, #f8f9fa)'
            }
          }}
        >
          <DialogTitle sx={{ 
            color: secondaryColor, 
            fontWeight: 600,
            borderBottom: `1px solid ${backgroundColor}`,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Description sx={{ color: primaryColor }} />
            {descriptionDialog.title}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.8,
              color: secondaryColor,
              fontSize: '1.1rem'
            }}>
              {descriptionDialog.content}
            </Typography>
          </DialogContent>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'flex-end',
            borderTop: `1px solid ${backgroundColor}`
          }}>
            <Button
              onClick={handleCloseDescription}
              variant="contained"
              startIcon={<Close />}
              sx={{
                background: `linear-gradient(45deg, ${primaryColor} 30%, ${primaryColor}CC 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${primaryColor}CC 30%, ${primaryColor} 90%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Fermer
            </Button>
          </Box>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}