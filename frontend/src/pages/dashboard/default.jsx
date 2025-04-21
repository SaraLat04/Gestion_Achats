import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import axios from 'axios';  // Ajoute cette ligne en haut de ton fichier

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  // État pour stocker les données dynamiques
  const [statistiques, setStatistiques] = useState({
    totalDemandes: 0,
    demandesValide: 0,
    demandesEnAttente: 0,
    demandesRefuse: 0,
  });

  // Effet pour récupérer les données dynamiques (exemple d'API)
  useEffect(() => {
    // Fetch the statistics from the API
    axios.get('http://localhost:8000/api/statistiques-demandes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token for authorization
      },
    })
    .then((response) => {
      setStatistiques(response.data);
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des statistiques :', error);
    });
  }, []);


  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Tableau de Bord des Achats</Typography>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total des Demandes d'Achat" 
          count={statistiques.totalDemandes}  // Donnée dynamique
          percentage={59.3} 
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total des Validations" 
          count={statistiques.demandesValide}  // Donnée dynamique
          percentage={70.5} 
          extra="8,900"  // Exemple, à remplacer par données dynamiques
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Demande en Attente" 
          count={statistiques.demandesEnAttente}  // Donnée dynamique
          percentage={27.4} 
          isLoss 
          color="warning" 
          extra="943"  // Exemple, à remplacer par données dynamiques
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total des Achats Validés" 
          count={statistiques.demandesRefuse}  // Donnée dynamique
          percentage={27.4} 
          isLoss 
          color="warning" 
          extra="20,395"  // Exemple, à remplacer par données dynamiques
        />
      </Grid>
      
      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
      
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard />
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Aperçu d'Achats</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Statistiques de la Semaine
              </Typography>
              <Typography variant="h3">$7,650</Typography> {/* Remplacer par une variable dynamique */}
            </Stack>
          </Box>
          <MonthlyBarChart /> {/* Remplacer par un graphique qui suit l'évolution des demandes d'achats */}
        </MainCard>
      </Grid>
    </Grid>
  );
}
