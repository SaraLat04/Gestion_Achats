import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // Si des rôles sont spécifiés et que l'utilisateur n'a pas le rôle requis
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Rediriger vers la page d'accueil avec un message d'erreur
        return <Navigate to="/" state={{ error: "Vous n'avez pas les permissions nécessaires" }} replace />;
    }

    // Si tout est OK, afficher le contenu protégé
    return children;
};

export default ProtectedRoute; 