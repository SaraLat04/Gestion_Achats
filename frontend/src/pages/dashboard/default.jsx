import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { Card, CardContent, Stack, Divider } from '@mui/material';
import { TrendingUp, CheckCircle, Pending, Cancel } from '@mui/icons-material';

// ==============================|| DASHBOARD - CARDS AMELIORÉES ||============================== //

export default function DashboardDefault() {
  const [statistiques, setStatistiques] = useState({
    totalDemandes: 0,
    demandesValide: 0,
    demandesEnAttente: 0,
    demandesRefuse: 0,
  });

  useEffect(() => {
    axios.get('http://localhost:8000/api/statistiques-demandes', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then((response) => {
      setStatistiques(response.data);
    })
    .catch((error) => {
      console.error('Erreur lors de la récupération des statistiques :', error);
    });
  }, []);

  // Palette de couleurs sophistiquée
  const colors = {
    primaryDark: '#4E342E',    // Marron profond
    primary: '#795548',       // Marron classique
    primaryLight: '#A1887F',  // Marron clair
    light: '#D7CCC8',        // Marron très clair
    background: '#EFEBE9',   // Fond clair
    success: '#689F38',      // Vert naturel
    warning: '#F57C00',      // Orange chaud
    error: '#D32F2F',       // Rouge intense
    textPrimary: '#3E2723',  // Texte foncé
    textSecondary: '#5D4037' // Texte secondaire
  };

  // Style commun des cartes
  const cardStyle = {
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(62, 39, 35, 0.1)',
    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 12px 28px rgba(62, 39, 35, 0.2)'
    },
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  // Style du contenu des cartes
  const cardContentStyle = {
    padding: '24px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <Box sx={{ 
      p: 4, 
      backgroundColor: colors.background,
      minHeight: '100vh'
    }}>
      {/* En-tête élégant */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 8,
        px: 2
      }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 600,
          color: colors.primaryDark,
          mb: 1,
          letterSpacing: '0.5px'
        }}>
          Tableau de Bord des Achats
        </Typography>
        <Typography variant="subtitle1" sx={{ 
          color: colors.primaryLight,
          maxWidth: 600,
          mx: 'auto',
          fontSize: '1.1rem'
        }}>
          Statistiques complètes des demandes d'achat
        </Typography>
      </Box>

      {/* Grille de cartes améliorées */}
      <Grid container spacing={4} justifyContent="center">
        {/* Carte 1 - Total des Demandes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            ...cardStyle,
            borderTop: `6px solid ${colors.primary}`,
            background: 'white'
          }}>
            <CardContent sx={cardContentStyle}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{
                  p: 2,
                  backgroundColor: `${colors.primary}20`,
                  borderRadius: '12px',
                  color: colors.primary
                }}>
                  <TrendingUp fontSize="large" />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Total des Demandes
                </Typography>
              </Stack>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: colors.textPrimary,
                  mb: 1
                }}>
                  {statistiques.totalDemandes}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: colors.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TrendingUp sx={{ color: colors.primary, fontSize: '1rem' }} />
                  <span style={{ color: colors.primary }}>59.3%</span> ce mois
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: colors.light }} />
              
              <Typography variant="caption" sx={{ 
                color: colors.primaryLight
              }}>
                Toutes demandes confondues
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte 2 - Demandes Validées */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            ...cardStyle,
            borderTop: `6px solid ${colors.success}`,
            background: 'white'
          }}>
            <CardContent sx={cardContentStyle}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{
                  p: 2,
                  backgroundColor: `${colors.success}20`,
                  borderRadius: '12px',
                  color: colors.success
                }}>
                  <CheckCircle fontSize="large" />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Demandes Validées
                </Typography>
              </Stack>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: colors.textPrimary,
                  mb: 1
                }}>
                  {statistiques.demandesValide}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: colors.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TrendingUp sx={{ color: colors.success, fontSize: '1rem' }} />
                  <span style={{ color: colors.success }}>70.5%</span> ce mois
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: colors.light }} />
              
              <Typography variant="caption" sx={{ 
                color: colors.primaryLight
              }}>
                Demandes approuvées
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte 3 - Demandes en Attente */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            ...cardStyle,
            borderTop: `6px solid ${colors.warning}`,
            background: 'white'
          }}>
            <CardContent sx={cardContentStyle}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{
                  p: 2,
                  backgroundColor: `${colors.warning}20`,
                  borderRadius: '12px',
                  color: colors.warning
                }}>
                  <Pending fontSize="large" />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Demandes en Attente
                </Typography>
              </Stack>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: colors.textPrimary,
                  mb: 1
                }}>
                  {statistiques.demandesEnAttente}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: colors.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TrendingUp sx={{ color: colors.warning, fontSize: '1rem' }} />
                  <span style={{ color: colors.warning }}>27.4%</span> en attente
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: colors.light }} />
              
              <Typography variant="caption" sx={{ 
                color: colors.primaryLight
              }}>
                En cours de traitement
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte 4 - Demandes Refusées */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            ...cardStyle,
            borderTop: `6px solid ${colors.error}`,
            background: 'white'
          }}>
            <CardContent sx={cardContentStyle}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{
                  p: 2,
                  backgroundColor: `${colors.error}20`,
                  borderRadius: '12px',
                  color: colors.error
                }}>
                  <Cancel fontSize="large" />
                </Box>
                <Typography variant="subtitle1" sx={{ 
                  color: colors.textSecondary,
                  fontWeight: 500
                }}>
                  Demandes Refusées
                </Typography>
              </Stack>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  color: colors.textPrimary,
                  mb: 1
                }}>
                  {statistiques.demandesRefuse}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: colors.primaryLight,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <TrendingUp sx={{ color: colors.error, fontSize: '1rem' }} />
                  <span style={{ color: colors.error }}>27.4%</span> ce mois
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: colors.light }} />
              
              <Typography variant="caption" sx={{ 
                color: colors.primaryLight
              }}>
                Demandes non approuvées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}