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
import { getAllDemandes, sendToDean } from '../../api/demande';
import jsPDF from 'jspdf';
import logo from '../../components/logo/fstg_logo.png'; 
import autoTable from 'jspdf-autotable';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

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

  const order = 'asc';
  const orderBy = 'id';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllDemandes();
        setRows(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes :', error);
      }
    };
    fetchData();
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

  const handleValidate = async (row) => {
    try {
      await sendToDean(row.id);
      alert(`Demande ${row.id} envoyée au doyen !`);
      // Mise à jour de treatedRequests
      setTreatedRequests((prev) => [...new Set([...prev, row.id])]);
      console.log('Treated after validation:', treatedRequests);
    } catch (error) {
      console.error('Erreur lors de l\'envoi au doyen :', error);
      alert('Erreur lors de l\'envoi de la demande');
    }
  };

  const handleReject = (row) => {
    alert(`Demande ${row.id} rejetée !`);
    // Mise à jour de treatedRequests
    setTreatedRequests((prev) => [...new Set([...prev, row.id])]);
    console.log('Treated after rejection:', treatedRequests);
  };

  return (
    <Box>
      <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
        <Table aria-labelledby="tableTitle">
          <RequestTableHead order={order} orderBy={orderBy} />
          <TableBody>
            {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;
              const isTreated = treatedRequests.includes(row.id);
              return (
                <TableRow hover key={row.id} tabIndex={-1}>
                  <TableCell component="th" id={labelId} scope="row">
                    <Link color="secondary">{row.id}</Link>
                  </TableCell>
                  <TableCell>{row.utilisateur?.nom || 'Inconnu'}</TableCell>
                  <TableCell>{row.departement}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => viewPDF(row)}
                      startIcon={<PdfIcon />}
                    >
                      Voir le PDF
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{ marginLeft: 1 }}
                      onClick={() => window.print()}
                      startIcon={<PrintIcon />}
                    >
                      Imprimer
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ marginLeft: 1 }}
                      onClick={() => handleValidate(row)}
                      
                    >
                      Valider
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      sx={{ marginLeft: 1 }}
                      onClick={() => handleReject(row)}
                     
                    >
                      Rejeter
                    </Button>
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
    </Box>
  );
}
