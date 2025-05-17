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
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme, CssBaseline, Container, Paper } from '@mui/material';
import { modifierDemande } from '../../api/demande';

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

// project imports
import Dot from 'components/@extended/Dot';
import { getDemandes } from '../../api/demande';
import { supprimerDemande } from '../../api/demande'; // n'oublie pas d'importer
import React, { useEffect, useState } from 'react';

function createData(request_no, user_name, request_type, status, submit_date) {
  return { request_no, user_name, request_type, status, submit_date };
}

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: 'request_no',
    align: 'left',
    disablePadding: false,
    label: 'Numéro de demande'
  },
  {
    id: 'description',
    align: 'left',
    disablePadding: true,
    label: 'Description'
  },
  {
    id: 'justification',
    align: 'left',
    disablePadding: false,
    label: 'Justification'
  },
  {
    id: 'status',
    align: 'left',
    disablePadding: false,
    label: 'Statut'
  },
  {
    id: 'submit_date',
    align: 'left',
    disablePadding: false,
    label: 'Date de soumission'
  },
  {
    id: 'actions',
    align: 'center',
    disablePadding: false,
    label: 'Actions'
  }
];

// ==============================|| ORDER TABLE - HEADER ||============================== //

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

// ==============================|| STATUT DES DEMANDES ||============================== //

function RequestStatus({ status }) {
  let color, label;

  switch (status.toLowerCase()) {  // en minuscules pour éviter les problèmes de casse
    case 'en attente':
      color = 'warning';
      label = 'En attente';
      break;
    case 'envoyée au doyen':
      color = 'info';
      label = 'Envoyée au doyen';
      break;
    case 'envoyée au secre':
      color = 'info';
      label = 'Envoyée au secrétaire général';
      break;
    case 'envoyée au responsable financier':
      color = 'info';
      label = 'Envoyée au responsable financier';
      break;
    case 'traitée':
      color = 'success';
      label = 'Traitée';
      break;
    case 'refusé':
      color = 'error'; // souvent 'error' est utilisé pour un statut négatif
      label = 'Refusé';
      break;
    default:
      color = 'default';
      label = 'Inconnu';
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Dot color={color} />
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

// ==============================|| TABLEAU DE SUIVI DES DEMANDES ||============================== //

export default function RequestTable() {
  const order = 'asc';
  const orderBy = 'request_no';
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [demandeToDelete, setDemandeToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [demandeToUpdate, setDemandeToUpdate] = useState(null);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const data = await getDemandes();
        console.log('Données récupérées du backend :', data);

        // Adapter les données ici si nécessaire
        const formattedRows = data.map((demande) => ({
          request_no: demande.id,
          description: demande.description ?? '',
          justification: demande.justification ?? '',
          status: demande.statut ?? 'en attente', // <-- ici on récupère statut
          submit_date: demande.date_demande?.split(' ')[0] ?? 'N/A'
        }));
        
        setRows(formattedRows);
      } catch (error) {
        console.error('Erreur lors du chargement des demandes :', error);
      }
    };

    fetchDemandes();
  }, []);

  const handleUpdate = (row) => {
    setDemandeToUpdate(row);
    setOpenUpdateDialog(true);
  };

  const handleDelete = async () => {
    if (!demandeToDelete) return;

    try {
      await supprimerDemande(demandeToDelete.request_no);
      setRows((prevRows) => prevRows.filter((r) => r.request_no !== demandeToDelete.request_no));
      setSnackbar({ open: true, message: 'Demande supprimée avec succès.', severity: 'success' });
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
      setSnackbar({ open: true, message: 'Échec de la suppression.', severity: 'error' });
    } finally {
      setOpenDialog(false);
      setDemandeToDelete(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h1" gutterBottom>
            Suivi des Demandes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez et suivez l'état de vos demandes
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
                      tabIndex={-1}
                      key={row.request_no}
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
                          {row.request_no}
                        </Link>
                      </TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.justification}</TableCell>
                      <TableCell><RequestStatus status={row.status} /></TableCell>
                      <TableCell>{row.submit_date}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            color="error" 
                            aria-label="Supprimer la demande" 
                            onClick={() => setDemandeToDelete(row)}
                            sx={{
                              '&:hover': {
                                backgroundColor: `${accentColor}10`
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 2
            }
          }}
        >
          <DialogTitle sx={{ color: secondaryColor, fontWeight: 600 }}>
            Confirmer la suppression
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer la demande n° {demandeToDelete?.request_no} ?
              Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)} 
              color="primary"
              variant="outlined"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error" 
              variant="contained"
              sx={{
                background: `linear-gradient(45deg, ${accentColor} 30%, ${accentColor}CC 90%)`,
                '&:hover': {
                  background: `linear-gradient(45deg, ${accentColor}CC 30%, ${accentColor} 90%)`,
                }
              }}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />

        <Dialog 
          open={openUpdateDialog} 
          onClose={() => setOpenUpdateDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 2
            }
          }}
        >
          <DialogTitle sx={{ color: secondaryColor, fontWeight: 600 }}>
            Modifier la demande
          </DialogTitle>
          <DialogContent>
            <form id="update-demande-form" encType="multipart/form-data">
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <input
                  type="text"
                  placeholder="Description"
                  defaultValue={demandeToUpdate?.description}
                  onChange={(e) =>
                    setDemandeToUpdate((prev) => ({ ...prev, description: e.target.value }))
                  }
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${backgroundColor}`,
                    fontSize: '1rem',
                    width: '100%'
                  }}
                />
                <textarea
                  placeholder="Justification"
                  defaultValue={demandeToUpdate?.justification}
                  onChange={(e) =>
                    setDemandeToUpdate((prev) => ({ ...prev, justification: e.target.value }))
                  }
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${backgroundColor}`,
                    fontSize: '1rem',
                    width: '100%',
                    minHeight: '100px'
                  }}
                />
                <input
                  type="file"
                  onChange={(e) =>
                    setDemandeToUpdate((prev) => ({ ...prev, piece_jointe: e.target.files[0] }))
                  }
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${backgroundColor}`,
                    fontSize: '1rem',
                    width: '100%'
                  }}
                />
              </Box>
            </form>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenUpdateDialog(false)}
              variant="outlined"
              color="primary"
            >
              Annuler
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={async () => {
                try {
                  await modifierDemande(demandeToUpdate.request_no, demandeToUpdate);
                  setSnackbar({ open: true, message: 'Demande modifiée avec succès.', severity: 'success' });
                  setOpenUpdateDialog(false);
                  const updatedData = await getDemandes();
                  const formattedRows = updatedData.map((demande) => ({
                    request_no: demande.id,
                    description: demande.description ?? '',
                    justification: demande.justification ?? '',
                    status: demande.statut ?? 'en attente',
                    submit_date: demande.date_demande?.split(' ')[0] ?? 'N/A',
                    piece_jointe: demande.piece_jointe ?? null
                  }));
                  setRows(formattedRows);
                } catch (error) {
                  console.error('Erreur lors de la modification :', error);
                  setSnackbar({ open: true, message: 'Échec de la modification.', severity: 'error' });
                }
              }}
            >
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
}

RequestTableHead.propTypes = { order: PropTypes.any, orderBy: PropTypes.string };

RequestStatus.propTypes = { status: PropTypes.string };
