import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';

// project imports
import AuthLayout from 'layout/Auth';
import Loadable from 'components/Loadable';
import { AuthContext } from 'contexts/AuthContext';

// jwt auth
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));

// Composant pour gérer la redirection initiale
const InitialRedirect = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (isAuthenticated && user) {
    switch (user.role) {
      case 'magasinier':
        return <Navigate to="/magasinier/dashboard" replace />;
      case 'professeur':
        return <Navigate to="/professeur/dashboard" replace />;
      case 'chef_depa':
        return <Navigate to="/chef-departement/dashboard" replace />;
      case 'doyen':
        return <Navigate to="/doyen/dashboard" replace />;
      case 'secrétaire général':
        return <Navigate to="/secretaire-general/dashboard" replace />;
      default:
        return <Navigate to="/dashboard/default" replace />;
    }
  }

  return <Navigate to="/login" replace />;
};

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <InitialRedirect />
    },
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: 'login',
          element: <LoginPage />
        },
        {
          path: 'register',
          element: <RegisterPage />
        }
      ]
    }
  ]
};

export default LoginRoutes;
