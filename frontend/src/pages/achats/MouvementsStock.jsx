import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  Chip,
  TablePagination,
  Stack
} from '@mui/material';
import { useSnackbar } from 'notistack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getProduits } from '../../api/produit';
import { getMouvementsStock } from '../../api/stock';

const MouvementsStock = () => {
  const [mouvements, setMouvements] = useState([]);
  const [produits, setProduits] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtres, setFiltres] = useState({
    date: '',
    type: '',
    produitId: ''
  });
  const [statistiques, setStatistiques] = useState({
    totalEntrees: 0,
    totalSorties: 0,
    dernierMouvement: null
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProduits();
    fetchMouvements();
  }, []);

  useEffect(() => {
    calculerStatistiques();
  }, [mouvements]);

  const fetchProduits = async () => {
    try {
      const data = await getProduits();
      setProduits(data);
    } catch (error) {
      enqueueSnackbar('Erreur lors du chargement des produits', { variant: 'error' });
    }
  };

  const fetchMouvements = async () => {
    try {
      const data = await getMouvementsStock();
      setMouvements(data);
    } catch (error) {
      enqueueSnackbar('Erreur lors du chargement des mouvements', { variant: 'error' });
    }
  };

  const calculerStatistiques = () => {
    if (mouvements.length === 0) {
      setStatistiques({
        totalEntrees: 0,
        totalSorties: 0,
        dernierMouvement: null
      });
      return;
    }

    const stats = mouvements.reduce((acc, mvt) => {
      const quantite = Number(mvt.quantite);
      if (mvt.type === 'entree') {
        acc.totalEntrees = Number(acc.totalEntrees) + quantite;
      } else {
        acc.totalSorties = Number(acc.totalSorties) + quantite;
      }
      return acc;
    }, { totalEntrees: 0, totalSorties: 0 });

    setStatistiques({
      totalEntrees: Math.round(stats.totalEntrees * 100) / 100,
      totalSorties: Math.round(stats.totalSorties * 100) / 100,
      dernierMouvement: mouvements[0]
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (event) => {
    setFiltres(prev => ({
      ...prev,
      date: event.target.value
    }));
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'entree':
        return { label: 'Entrée', color: 'success' };
      case 'sortie':
        return { label: 'Sortie', color: 'error' };
      default:
        return { label: 'Inconnu', color: 'default' };
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const mouvementsFiltres = mouvements.filter(mouvement => {
    const matchDate = !filtres.date || new Date(mouvement.date).toLocaleDateString() === new Date(filtres.date).toLocaleDateString();
    const matchType = !filtres.type || mouvement.type === filtres.type;
    const matchProduit = !filtres.produitId || mouvement.produit_id === parseInt(filtres.produitId);
    
    return matchDate && matchType && matchProduit;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Produit', 'Type', 'Quantité', 'Raison'];
    const csvData = mouvementsFiltres.map(m => [
      new Date(m.date).toLocaleDateString(),
      m.produit.nom,
      m.type === 'entree' ? 'Entrée' : 'Sortie',
      m.quantite,
      m.motif
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mouvements_stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Entrées
                  </Typography>
                  <Typography variant="h4">
                    {statistiques.totalEntrees.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sorties
                  </Typography>
                  <Typography variant="h4">
                    {statistiques.totalSorties.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Dernier mouvement
                  </Typography>
                  <Typography variant="body2">
                    {statistiques.dernierMouvement ? 
                      `${new Date(statistiques.dernierMouvement.date).toLocaleDateString()} - ${statistiques.dernierMouvement.produit.nom}` 
                      : 'Aucun mouvement'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">
                  Historique des mouvements de stock
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={exportToCSV}
                >
                  Exporter Excel
                </Button>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date"
                      name="date"
                      value={filtres.date}
                      onChange={handleDateChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Type de mouvement"
                      name="type"
                      value={filtres.type}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Tous</MenuItem>
                      <MenuItem value="entree">Entrée</MenuItem>
                      <MenuItem value="sortie">Sortie</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      select
                      fullWidth
                      label="Produit"
                      name="produitId"
                      value={filtres.produitId}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Tous</MenuItem>
                      {produits.map((produit) => (
                        <MenuItem key={produit.id} value={produit.id}>
                          {produit.nom}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Produit</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Quantité</TableCell>
                      <TableCell>Raison</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mouvementsFiltres
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((mouvement) => {
                        const type = getTypeLabel(mouvement.type);
                        return (
                          <TableRow key={mouvement.id}>
                            <TableCell>{new Date(mouvement.date).toLocaleDateString()}</TableCell>
                            <TableCell>{mouvement.produit.nom}</TableCell>
                            <TableCell>
                              <Chip label={type.label} color={type.color} />
                            </TableCell>
                            <TableCell>{mouvement.quantite}</TableCell>
                            <TableCell>{mouvement.motif}</TableCell>
                          </TableRow>
                        );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={mouvementsFiltres.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Lignes par page"
                />
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MouvementsStock; 