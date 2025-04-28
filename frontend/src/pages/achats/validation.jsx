import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Print as PrintIcon, Description as PdfIcon } from '@mui/icons-material';
import { getAllDemandes, sendToDean, sendToResponsable, finaliserDemande, rejectDemande } from '../../api/demande';
import jsPDF from 'jspdf';
import logo from '../../components/logo/fstg_logo.png';
import autoTable from 'jspdf-autotable';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

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
const [confirmAction, setConfirmAction] = useState(null); // { action: 'valider' | 'rejeter', id: number }

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
  

  const viewPDF = (row) => {
    const doc = new jsPDF();

    const img = new Image();
    img.src = logo;
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.text('Fiche de demande', 105, 25, null, null, 'center');

      doc.setFontSize(12);
      doc.text(`Numéro de demande : ${row.id}`, 14, 50);
      doc.text(`Nom du demandeur : ${row.utilisateur?.nom || 'Inconnu'}`, 14, 60);
      doc.text(`Département : ${row.departement}`, 14, 70);
      doc.text('Description :', 14, 80);
      doc.text(`${row.description}`, 14, 90, { maxWidth: 180 });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setOpenPdf(true);
    };
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
  
      if (userRole === 'secrétaire général') {
        response = await sendToDean(id);
      } else if (userRole === 'doyen') {
        response = await sendToResponsable(id);
      } else if (userRole === 'responsable financier') {
        response = await finaliserDemande(id);
      } else {
        console.error("Rôle non supporté");
        return;
      }
  
      setSnackbar({ open: true, message: 'Demande validée avec succès', severity: 'success' });
  
      // ✅ Recharge propre des données stockées après validation
      const updatedRows = JSON.parse(localStorage.getItem('rows')) || [];
      setRows(updatedRows);
  
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
  
    if (userRole === 'secrétaire général') {
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
        return <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Envoyée au responsable financier</Typography>;
      }
    } else if (userRole === 'responsable financier') {
      if (statut === 'envoyée au responsable financier') {
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
  
  
  const handlePrint = (row) => {
    const doc = new jsPDF();
  
    const img = new Image();
    img.src = logo;
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(18);
      doc.text('Fiche de demande', 105, 25, null, null, 'center');
  
      doc.setFontSize(12);
      doc.text(`Numéro de demande : ${row.id}`, 14, 50);
      doc.text(`Nom du demandeur : ${row.utilisateur?.nom || 'Inconnu'}`, 14, 60);
      doc.text(`Département : ${row.departement}`, 14, 70);
      doc.text('Description :', 14, 80);
      doc.text(`${row.description}`, 14, 90, { maxWidth: 180 });
  
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
  
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Imprimer la demande</title>
            </head>
            <body style="margin:0">
              <iframe src="${pdfUrl}" style="width:100%;height:100vh;border:none;" onload="this.contentWindow.print();"></iframe>
            </body>
          </html>
        `);
      }
    };
  };
  
  return (
    <Box>
      <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
        <Table aria-labelledby="tableTitle">
          <RequestTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow hover key={row.id} tabIndex={-1}>
                  <TableCell component="th" id={labelId} scope="row">
                    <Link color="secondary">{row.id}</Link>
                  </TableCell>
                  <TableCell>{row.utilisateur?.nom || 'Inconnu'} {row.utilisateur?.prenom || ''}</TableCell>
                  <TableCell>{row.departement}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Button variant="outlined" size="small" onClick={() => viewPDF(row)} startIcon={<PdfIcon />}>
                        Voir la Demande
                      </Button>
                      <Button
  variant="contained"
  size="small"
  onClick={() => handlePrint(row)}  // avant c'était window.print()
  startIcon={<PrintIcon />}
>
  Imprimer
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

      <Dialog open={openPdf} onClose={handleClosePdf} fullWidth maxWidth="md">
        <DialogTitle>Prévisualisation du PDF</DialogTitle>
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
  <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
    {snackbar.message}
  </Alert>
</Snackbar>
<Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
  <DialogTitle>Confirmation</DialogTitle>
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
      >
        Confirmer
      </Button>
      <Button variant="outlined" onClick={() => setConfirmDialogOpen(false)}>
        Annuler
      </Button>
    </Stack>
  </DialogContent>
</Dialog>

    </Box>
  );
}