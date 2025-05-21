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
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    nom: '',
    email: '',
    prenom: '',
    photo: null,
  });

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    prenom: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

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
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          photo: user.photo || null,
        });

        setFormData({
          nom: user.nom || '',
          email: user.email || '',
          prenom: user.prenom || '',
        });

        setPreviewUrl(user.photo || '');
      } catch (error) {
        console.error('Erreur lors de la récupération du profil :', error);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Vérification que les champs ne sont pas vides
      if (!formData.nom || !formData.prenom || !formData.email) {
        setError('Tous les champs sont obligatoires');
        return;
      }

      // Préparation des données
      const data = {
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim()
      };

      console.log('Données à envoyer:', data);

      const response = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Erreur API:', responseData);
        if (responseData.errors) {
          // Gestion des erreurs de validation Laravel
          const errorMessages = Object.values(responseData.errors).flat();
          setError(errorMessages.join(', '));
        } else {
          setError(responseData.message || 'Erreur lors de la mise à jour');
        }
        return;
      }

      // Mise à jour réussie
      if (responseData.user) {
        const updatedUser = responseData.user;
        
        // Mise à jour des états
        setProfileData({
          nom: updatedUser.nom || '',
          prenom: updatedUser.prenom || '',
          email: updatedUser.email || '',
          photo: updatedUser.photo || null,
        });

        setFormData({
          nom: updatedUser.nom || '',
          email: updatedUser.email || '',
          prenom: updatedUser.prenom || '',
        });

        if (updatedUser.photo) {
          setPreviewUrl(updatedUser.photo);
        }

        // Fermer le modal d'édition et ouvrir le modal de succès
        setOpenEditModal(false);
        setOpenSuccessModal(true);
        setError('');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
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
            borderRadius: 3,
            padding: 3,
            backgroundColor: colors.background,
            boxShadow: `0 4px 15px ${colors.shadow}`,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: colors.primary, fontWeight: 'bold' }}>
          Profil Utilisateur
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <StyledAvatar src={previewUrl || undefined} alt="Photo de profil" />
          </Box>
          <Typography variant="h6" align="center" sx={{ mb: 1, color: colors.secondaryDark }}>
            {profileData.nom} {profileData.prenom}
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 2, color: colors.secondaryDark }}>
            {profileData.email}
          </Typography>
          <Divider />
          {/* Autres infos ici si nécessaire */}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            onClick={() => setOpenViewModal(false)}
            variant="contained"
            sx={{
              backgroundColor: colors.primary,
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: colors.primaryDark,
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
            borderRadius: 3,
            padding: 3,
            backgroundColor: colors.background,
            boxShadow: `0 4px 15px ${colors.shadow}`,
          }
        }}
      >
        <DialogTitle sx={{ color: colors.primary, fontWeight: 'bold' }}>
          Modifier Profil
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <StyledAvatar src={previewUrl || undefined} alt="Photo de profil" />
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mt: 1, color: colors.primary, borderColor: colors.primary }}
                >
                  Choisir une photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={8}>
              <StyledTextField
                label="Nom"
                fullWidth
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                margin="normal"
              />
              <StyledTextField
                label="Prénom"
                fullWidth
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                margin="normal"
              />
              <StyledTextField
                label="Email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                margin="normal"
              />
              {error && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            sx={{ color: colors.secondaryDark }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            sx={{
              backgroundColor: colors.primary,
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: colors.primaryDark,
              },
            }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal succès */}
      <Dialog
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 4,
            textAlign: 'center',
            backgroundColor: colors.background,
            boxShadow: `0 4px 15px ${colors.shadow}`,
          }
        }}
      >
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1, color: colors.secondaryDark }}>
          Profil mis à jour avec succès !
        </Typography>
        <Button
          onClick={() => setOpenSuccessModal(false)}
          variant="contained"
          sx={{
            backgroundColor: colors.primary,
            color: '#fff',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: colors.primaryDark,
            },
          }}
        >
          OK
        </Button>
      </Dialog>
    </>
  );
};

export default ProfileTab;
