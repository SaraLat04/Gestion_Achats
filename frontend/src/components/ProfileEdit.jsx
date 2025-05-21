import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
    Avatar,
    IconButton,
    Alert,
    Snackbar
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';

const ProfileEdit = () => {
    const [user, setUser] = useState({
        nom: '',
        prenom: '',
        email: '',
        photo: null
    });
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [openSnackbar, setOpenSnackbar] = useState(false);

    useEffect(() => {
        // Récupérer les informations de l'utilisateur connecté
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/profile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setUser(response.data);
                setPreviewUrl(response.data.photo || '');
            } catch (error) {
                console.error('Erreur lors de la récupération du profil:', error);
                setMessage({ type: 'error', text: 'Erreur lors de la récupération du profil' });
                setOpenSnackbar(true);
            }
        };

        fetchUserProfile();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password && password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            setOpenSnackbar(true);
            return;
        }

        const formData = new FormData();
        formData.append('nom', user.nom);
        formData.append('prenom', user.prenom);
        formData.append('email', user.email);
        if (password) {
            formData.append('password', password);
        }
        if (selectedFile) {
            formData.append('photo', selectedFile);
        }

        try {
            const response = await axios.put('/api/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
            setOpenSnackbar(true);
            setPassword('');
            setConfirmPassword('');
            setSelectedFile(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        Modifier le profil
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Box sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={previewUrl}
                                        sx={{ width: 100, height: 100 }}
                                    />
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="photo-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="photo-upload">
                                        <IconButton
                                            color="primary"
                                            component="span"
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                bgcolor: 'background.paper'
                                            }}
                                        >
                                            <PhotoCamera />
                                        </IconButton>
                                    </label>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    value={user.nom}
                                    onChange={(e) => setUser({ ...user, nom: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    value={user.prenom}
                                    onChange={(e) => setUser({ ...user, prenom: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Nouveau mot de passe"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Confirmer le mot de passe"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                >
                                    Mettre à jour le profil
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={message.type}
                    sx={{ width: '100%' }}
                >
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProfileEdit; 