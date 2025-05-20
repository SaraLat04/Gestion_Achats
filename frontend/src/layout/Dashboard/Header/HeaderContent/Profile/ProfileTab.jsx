import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Avatar,
  Divider,
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';

// Couleurs de la charte graphique UCA
const colors = {
  primary: '#B36B39', // Bronze/cuivre
  secondary: '#2C3E50', // Bleu foncé
  background: '#F5F5F5', // Gris clair
  accent: '#E74C3C', // Rouge accent
  primaryLight: '#C48B6A', // Version plus claire du bronze
  primaryDark: '#8B4D2A', // Version plus foncée du bronze
  secondaryLight: '#3D5A73', // Version plus claire du bleu
  secondaryDark: '#1A2530', // Version plus foncée du bleu
  shadow: 'rgba(44, 62, 80, 0.15)', // Ombre basée sur la couleur secondaire
};

// Styles personnalisés
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 130,
  height: 130,
  border: `4px solid ${colors.primary}`,
  boxShadow: `0 4px 20px ${colors.shadow}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 6px 25px ${colors.shadow}`,
    borderColor: colors.secondary,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s ease',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.primary,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: colors.secondary,
        borderWidth: 2,
      },
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: colors.secondary,
  },
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(145deg, white, ${colors.background})`,
  transition: 'all 0.3s ease',
  border: `1px solid ${colors.primaryLight}`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${colors.shadow}`,
    borderColor: colors.primary,
  },
}));

const ProfileTab = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    prenom: '',
    photo: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prenom: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axios.get('http://localhost:8000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data;

        setProfileData({
          name: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          photo: user.photo || null,
        });

        setFormData({
          name: user.nom || '',
          email: user.email || '',
          prenom: user.prenom || '',
        });
      } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(
        'http://localhost:8000/api/profile',
        {
          nom: formData.name,
          prenom: formData.prenom,
          email: formData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfileData((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        prenom: formData.prenom,
      }));

      setOpenEditModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
    }
  };

  const handleListItemClick = (event, index, action) => {
    setSelectedIndex(index);
    if (action === 'view') {
      setOpenViewModal(true);
    } else if (action === 'edit') {
      setOpenEditModal(true);
    }
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton 
          selected={selectedIndex === 0} 
          onClick={(event) => handleListItemClick(event, 0, 'view')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: `${colors.primaryLight}20`,
              '&:hover': {
                backgroundColor: `${colors.primaryLight}30`,
              },
            },
            '&:hover': {
              backgroundColor: `${colors.primaryLight}10`,
            },
          }}
        >
          <ListItemIcon>
            <EyeOutlined style={{ color: colors.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Voir Profil" 
            primaryTypographyProps={{
              sx: { 
                color: colors.secondary,
                fontWeight: selectedIndex === 0 ? 600 : 400,
              }
            }}
          />
        </ListItemButton>

        <ListItemButton 
          selected={selectedIndex === 1} 
          onClick={(event) => handleListItemClick(event, 1, 'edit')}
          sx={{
            '&.Mui-selected': {
              backgroundColor: `${colors.primaryLight}20`,
              '&:hover': {
                backgroundColor: `${colors.primaryLight}30`,
              },
            },
            '&:hover': {
              backgroundColor: `${colors.primaryLight}10`,
            },
          }}
        >
          <ListItemIcon>
            <EditOutlined style={{ color: colors.primary }} />
          </ListItemIcon>
          <ListItemText 
            primary="Modifier Profil" 
            primaryTypographyProps={{
              sx: { 
                color: colors.secondary,
                fontWeight: selectedIndex === 1 ? 600 : 400,
              }
            }}
          />
        </ListItemButton>
      </List>

      {/* Voir Profil Modal */}
      <Dialog
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 3,
            boxShadow: `0 12px 40px ${colors.shadow}`,
            background: `linear-gradient(145deg, white, ${colors.background})`,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.8rem',
            color: colors.secondary,
            textAlign: 'center',
            mb: 1,
            fontFamily: '"Roboto", "Arial", sans-serif',
            borderBottom: `2px solid ${colors.primaryLight}`,
            pb: 2,
          }}
        >
          Profil Utilisateur
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
            <StyledAvatar
              src={profileData.photo || undefined}
              alt={`${profileData.name} ${profileData.prenom}`}
              sx={{ bgcolor: colors.primary, color: 'white' }}
            >
              {!profileData.photo && profileData.name.charAt(0).toUpperCase()}
            </StyledAvatar>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ProfileCard>
                  <Typography variant="subtitle2" color={colors.secondary} gutterBottom>
                    Nom
                  </Typography>
                  <Typography variant="h6" color={colors.primary}>{profileData.name || '-'}</Typography>
                </ProfileCard>
              </Grid>

              <Grid item xs={12}>
                <ProfileCard>
                  <Typography variant="subtitle2" color={colors.secondary} gutterBottom>
                    Prénom
                  </Typography>
                  <Typography variant="h6" color={colors.primary}>{profileData.prenom || '-'}</Typography>
                </ProfileCard>
              </Grid>

              <Grid item xs={12}>
                <ProfileCard>
                  <Typography variant="subtitle2" color={colors.secondary} gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="h6" color={colors.primary}>{profileData.email || '-'}</Typography>
                </ProfileCard>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setOpenViewModal(false)}
            variant="outlined"
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: '30px',
              textTransform: 'none',
              borderWidth: 2,
              borderColor: colors.secondary,
              color: colors.secondary,
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.background,
                color: colors.primary,
                transform: 'translateY(-3px)',
                boxShadow: `0 4px 8px ${colors.shadow}`,
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modifier Profil Modal */}
      <Dialog
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            padding: 3,
            boxShadow: `0 12px 40px ${colors.shadow}`,
            background: `linear-gradient(145deg, white, ${colors.background})`,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.8rem',
            color: colors.secondary,
            textAlign: 'center',
            mb: 1,
            fontFamily: '"Roboto", "Arial", sans-serif',
            borderBottom: `2px solid ${colors.primaryLight}`,
            pb: 2,
          }}
        >
          Modifier Profil
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
            <StyledAvatar
              src={profileData.photo || undefined}
              alt={`${formData.name} ${formData.prenom}`}
              sx={{ bgcolor: colors.primary, color: 'white' }}
            >
              {!profileData.photo && formData.name.charAt(0).toUpperCase()}
            </StyledAvatar>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Nom"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  fullWidth
                  label="Prénom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            variant="outlined"
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: '30px',
              textTransform: 'none',
              borderWidth: 2,
              borderColor: colors.secondary,
              color: colors.secondary,
              '&:hover': {
                borderColor: colors.primary,
                backgroundColor: colors.background,
                color: colors.primary,
                transform: 'translateY(-3px)',
                boxShadow: `0 4px 8px ${colors.shadow}`,
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: '30px',
              textTransform: 'none',
              background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.primaryLight} 90%)`,
              boxShadow: `0 4px 8px ${colors.shadow}`,
              '&:hover': {
                transform: 'translateY(-3px)',
                background: `linear-gradient(45deg, ${colors.primaryLight} 30%, ${colors.primary} 90%)`,
                boxShadow: `0 6px 12px ${colors.shadow}`,
              },
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileTab;
