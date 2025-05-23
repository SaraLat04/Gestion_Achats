import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logoFst from 'assets/images/LogoFst.png';

// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import { ThemeProvider, createTheme, CssBaseline, Container, Box } from '@mui/material';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import { AuthContext } from 'contexts/AuthContext';

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
    h3: {
      fontSize: "1.75rem",
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: primaryColor,
            },
            '&.Mui-focused fieldset': {
              borderColor: primaryColor,
            },
          },
        },
      },
    },
  },
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.data.user) {
        localStorage.setItem('token', response.data.token || '');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        login(response.data.user);
        
        // Redirection basée sur le rôle
        const role = response.data.user.role;
        if (role === 'magasinier') {
          navigate('/magasinier/dashboard');
        } else if (role === 'professeur') {
          navigate('/professeur/dashboard');
        } else if (role === 'chef_depa') {
          navigate('/chef-departement/dashboard');
        } else if (role === 'doyen') {
          navigate('/doyen/dashboard');
        } else if (role === 'secrétaire général') {
          navigate('/secretaire-general/dashboard');
        } else {
          navigate('/dashboard/default');
        }
      }
    } catch (err) {
      console.error('Login failed:', err.response?.data || err.message);
      if (err.response?.status === 422) {
        setError('Email ou mot de passe incorrect');
      } else if (err.response?.status === 404) {
        setError('Utilisateur non trouvé');
      } else {
        setError('Une erreur est survenue lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthWrapper>
        <Container maxWidth="sm">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            minHeight: '100vh',
            py: 8
          }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>

              <Typography 
                variant="h1" 
                gutterBottom
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  color: secondaryColor,
                  mb: 1
                }}
              >
                Connexion
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  opacity: 0.8,
                  maxWidth: '400px',
                  mx: 'auto'
                }}
              >
                Bienvenue sur la plateforme de gestion des achats
              </Typography>
            </Box>

            <Box sx={{ width: '100%', maxWidth: '400px' }}>
              <form onSubmit={handleLogin}>
                <Stack spacing={3}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="Mot de passe"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    variant="outlined"
                  />
                  {error && (
                    <Alert 
                      severity="error"
                      sx={{
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                          color: accentColor
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      mt: 2,
                      height: 48,
                      background: `linear-gradient(45deg, ${primaryColor} 30%, ${primaryColor}CC 90%)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${primaryColor}CC 30%, ${primaryColor} 90%)`,
                      }
                    }}
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                  <Typography 
                    component={Link} 
                    to="/register" 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'center',
                      textDecoration: 'none',
                      color: primaryColor,
                      mt: 2,
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Vous n'avez pas de compte ?
                  </Typography>
                </Stack>
              </form>
            </Box>
          </Box>
        </Container>
      </AuthWrapper>
    </ThemeProvider>
  );
}
