import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { getProduits } from '../../api/produit';

const AlerteStock = () => {
    const [produits, setProduits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduits = async () => {
            try {
                const data = await getProduits();
                setProduits(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProduits();
    }, []);

    const produitsAlerte = produits.filter(produit => produit.quantite <= 5);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Alertes de Stock
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    Les produits dont la quantité est inférieure ou égale à 5 unités sont considérés comme étant en alerte de stock.
                </Alert>
                
                {produitsAlerte.length === 0 ? (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Aucune alerte de stock pour le moment
                    </Alert>
                ) : (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Code</TableCell>
                                    <TableCell>Produit</TableCell>
                                    <TableCell>Stock Actuel</TableCell>
                                    <TableCell>Unite</TableCell>
                                    <TableCell>Statut</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {produitsAlerte.map((produit) => (
                                    <TableRow key={produit.id}>
                                        <TableCell>{produit.code}</TableCell>
                                        <TableCell>{produit.nom}</TableCell>
                                        <TableCell>{produit.quantite}</TableCell>
                                        <TableCell>{produit.unite}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={produit.quantite === 0 ? "Stock épuisé" : "Stock faible"} 
                                                color={produit.quantite === 0 ? "error" : "warning"}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    );
};

export default AlerteStock; 