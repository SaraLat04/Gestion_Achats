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
  Typography,
  Box,
  Chip,
  TablePagination,
  Button,
  Alert,
  MenuItem
} from '@mui/material';
import { useSnackbar } from 'notistack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getProduits } from '../../api/produit';

// Liste prédéfinie des unités
const UNITES = [
  'Pièce',
  'Kg',
  'Litre',
  'Mètre',
  'Carton',
  'Boîte',
  'Paquet',
  'Unité',
  'Lot'
];

const Inventaires = () => {
  const [produits, setProduits] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtres, setFiltres] = useState({
    recherche: '',
    unite: ''
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const data = await getProduits();
      setProduits(data);
    } catch (error) {
      enqueueSnackbar('Erreur lors du chargement des produits', { variant: 'error' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltres(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatutStock = (quantite) => {
    if (quantite <= 0) return { label: 'Stock épuisé', color: 'error' };
    if (quantite <= 5) return { label: 'Stock faible', color: 'warning' };
    return { label: 'Stock suffisant', color: 'success' };
  };

  const produitsFiltres = produits.filter(produit => {
    const matchRecherche = !filtres.recherche || 
      produit.nom.toLowerCase().includes(filtres.recherche.toLowerCase()) ||
      produit.code.toLowerCase().includes(filtres.recherche.toLowerCase());
    const matchUnite = !filtres.unite || produit.unite === filtres.unite;
    return matchRecherche && matchUnite;
  });

  const exportToCSV = () => {
    const headers = ['Code', 'Produit', 'Quantité', 'Unité', 'Statut'];
    const csvData = produitsFiltres.map(p => {
      const statut = getStatutStock(p.quantite);
      return [
        p.code,
        p.nom,
        p.quantite,
        p.unite,
        statut.label
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventaire_stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculer les statistiques
  const statistiques = produits.reduce((acc, produit) => {
    acc.totalProduits++;
    acc.totalQuantite += Number(produit.quantite);
    if (produit.quantite <= 0) acc.produitsEpuises++;
    if (produit.quantite <= 5) acc.produitsFaibles++;
    return acc;
  }, { totalProduits: 0, totalQuantite: 0, produitsEpuises: 0, produitsFaibles: 0 });

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Produits
                  </Typography>
                  <Typography variant="h4">
                    {statistiques.totalProduits}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Quantité Totale
                  </Typography>
                  <Typography variant="h4">
                    {statistiques.totalQuantite.toLocaleString('fr-FR')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Produits Épuisés
                  </Typography>
                  <Typography variant="h4" color="error">
                    {statistiques.produitsEpuises}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Stock Faible
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {statistiques.produitsFaibles}
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
                  Inventaire du Stock
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
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Rechercher un produit"
                      name="recherche"
                      value={filtres.recherche}
                      onChange={handleChange}
                      placeholder="Nom ou code du produit"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Unité"
                      name="unite"
                      value={filtres.unite}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Toutes les unités</MenuItem>
                      {UNITES.map(unite => (
                        <MenuItem key={unite} value={unite}>
                          {unite}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>

              {produitsFiltres.length === 0 ? (
                <Alert severity="info">Aucun produit trouvé</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Produit</TableCell>
                        <TableCell>Quantité</TableCell>
                        <TableCell>Unité</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {produitsFiltres
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((produit) => {
                          const statut = getStatutStock(produit.quantite);
                          return (
                            <TableRow key={produit.id}>
                              <TableCell>{produit.code}</TableCell>
                              <TableCell>{produit.nom}</TableCell>
                              <TableCell>{produit.quantite}</TableCell>
                              <TableCell>{produit.unite}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={statut.label} 
                                  color={statut.color}
                                />
                              </TableCell>
                            </TableRow>
                          );
                      })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={produitsFiltres.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Lignes par page"
                  />
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Inventaires; 