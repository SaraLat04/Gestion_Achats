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
} from '@mui/material';

const ProfileTab = () => {
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
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

  // Couleurs marron et dérivés
  const brownMain = '#8B4513'; // SaddleBrown
  const brownLight = '#D2B48C'; // Tan
  const brownLighter = '#F5DEB3'; // Wheat
  const brownDark = '#5C3317'; // Darker Brown
  const brownShadow = 'rgba(139, 69, 19, 0.3)'; // Transparent brown shadow

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          mt: 5,
          flexWrap: 'wrap',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setOpenViewModal(true)}
          sx={{
            px: 5,
            py: 1.8,
            fontWeight: '700',
            borderRadius: '40px',
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: `0 4px 12px ${brownShadow}`,
            borderColor: brownMain,
            color: brownMain,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: brownLight,
              boxShadow: `0 6px 20px ${brownShadow}`,
              borderColor: brownDark,
              color: brownDark,
            },
          }}
        >
          Voir Profil
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenEditModal(true)}
          sx={{
            px: 5,
            py: 1.8,
            fontWeight: '700',
            borderRadius: '40px',
            textTransform: 'none',
            fontSize: '1rem',
            backgroundColor: brownMain,
            boxShadow: `0 6px 18px ${brownShadow}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: brownDark,
              boxShadow: `0 8px 24px ${brownShadow}`,
            },
          }}
        >
          Modifier Profil
        </Button>
      </Box>

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
            boxShadow: `0 12px 40px ${brownShadow}`,
            backgroundColor: brownLighter,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: '700',
            fontSize: '1.8rem',
            color: brownDark,
            textAlign: 'center',
            mb: 1,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          Profil Utilisateur
        </DialogTitle>
        <Divider sx={{ mb: 3, borderColor: brownLight }} />
        <DialogContent dividers>
          <Grid container direction="column" alignItems="center" spacing={3}>
            {profileData.photo ? (
              <Grid item>
                <Avatar
                  src={profileData.photo}
                  alt="Photo Profil"
                  sx={{
                    width: 130,
                    height: 130,
                    boxShadow: `0 6px 20px ${brownShadow}`,
                    border: `3px solid ${brownMain}`,
                  }}
                />
              </Grid>
            ) : (
              <Grid item>
                <Avatar
                  sx={{
                    width: 130,
                    height: 130,
                    bgcolor: brownLight,
                    color: brownDark,
                    fontSize: '3rem',
                    boxShadow: `0 6px 20px ${brownShadow}`,
                    border: `3px solid ${brownMain}`,
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                  }}
                >
                  {profileData.name.charAt(0).toUpperCase()}
                </Avatar>
              </Grid>
            )}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Typography variant="h6" fontWeight="600" color={brownDark} gutterBottom>
                Nom :
              </Typography>
              <Typography variant="body1" sx={{ ml: 2, color: '#4E342E' }}>
                {profileData.name || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ width: '100%' }}>
              <Typography variant="h6" fontWeight="600" color={brownDark} gutterBottom>
                Prénom :
              </Typography>
              <Typography variant="body1" sx={{ ml: 2, color: '#4E342E' }}>
                {profileData.prenom || '-'}
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ width: '100%' }}>
              <Typography variant="h6" fontWeight="600" color={brownDark} gutterBottom>
                Email :
              </Typography>
              <Typography variant="body1" sx={{ ml: 2, color: '#4E342E' }}>
                {profileData.email || '-'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setOpenViewModal(false)}
            variant="outlined"
            color="primary"
            sx={{
              px: 4,
              py: 1.2,
              fontWeight: '600',
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: `0 3px 12px ${brownShadow}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: brownLight,
                boxShadow: `0 6px 24px ${brownShadow}`,
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
            boxShadow: `0 12px 40px ${brownShadow}`,
            backgroundColor: brownLighter,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: '700',
            fontSize: '1.8rem',
            color: brownDark,
            textAlign: 'center',
            mb: 1,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          Modifier Profil
        </DialogTitle>
        <Divider sx={{ mb: 3, borderColor: brownLight }} />
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                variant="outlined"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{
                  '& label.Mui-focused': { color: brownMain },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: brownMain,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                variant="outlined"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                sx={{
                  '& label.Mui-focused': { color: brownMain },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: brownMain,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{
                  '& label.Mui-focused': { color: brownMain },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: brownMain,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setOpenEditModal(false)}
            variant="outlined"
            color="primary"
            sx={{
              px: 4,
              py: 1.2,
              fontWeight: '600',
              borderRadius: 3,
              textTransform: 'none',
              boxShadow: `0 3px 12px ${brownShadow}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: brownLight,
                boxShadow: `0 6px 24px ${brownShadow}`,
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
              fontWeight: '600',
              borderRadius: 3,
              textTransform: 'none',
              backgroundColor: brownMain,
              boxShadow: `0 6px 18px ${brownShadow}`,
              '&:hover': {
                backgroundColor: brownDark,
                boxShadow: `0 8px 24px ${brownShadow}`,
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
