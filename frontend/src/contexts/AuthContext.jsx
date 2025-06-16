// contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Fonction pour vérifier si le token est valide
  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/verify-token`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!storedUser || !token) {
        logout();
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        const isTokenValid = await verifyToken(token);

        if (!isTokenValid) {
          console.log('Token invalide ou expiré');
          logout();
        } else {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la session:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Si l'authentification est en cours de vérification, on peut retourner un état de chargement
  if (isLoading) {
    return (
      <AuthContext.Provider value={{ isLoading }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
