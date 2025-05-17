import { Link } from 'react-router-dom';
import logoFst from 'assets/images/LogoFst.png';

// material-ui
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme, CssBaseline, Container, Box } from '@mui/material';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import FirebaseRegister from 'sections/auth/AuthRegister';

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

export default function Register() {
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
                Inscription
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
                Créez votre compte pour accéder à la plateforme
              </Typography>
            </Box>

            <Box sx={{ width: '100%', maxWidth: '400px' }}>
              <FirebaseRegister />
              <Typography 
                component={Link} 
                to="/login" 
                variant="body1" 
                sx={{ 
                  textAlign: 'center',
                  textDecoration: 'none',
                  color: primaryColor,
                  mt: 2,
                  display: 'block',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Vous avez déjà un compte ?
              </Typography>
            </Box>
          </Box>
        </Container>
      </AuthWrapper>
    </ThemeProvider>
  );
}