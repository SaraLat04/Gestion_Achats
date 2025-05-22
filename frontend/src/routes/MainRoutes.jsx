import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PrivateRouteByRole from './PrivateRouteByRole.jsx';
import { AuthContext } from 'contexts/AuthContext';

// pages
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const MagasinierDashboard = Loadable(lazy(() => import('pages/MagasinierDashboard')));
const ChefDepartementDashboard = Loadable(lazy(() => import('pages/ChefDepartementDashboard')));
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

const CreerDemande = Loadable(lazy(() => import('pages/achats/CreerDemande')));
const SuivreDemandes = Loadable(lazy(() => import('pages/achats/SuivreDemandes')));
const Validation = Loadable(lazy(() => import('pages/achats/Validation')));
const Produits = Loadable(lazy(() => import('pages/achats/Produits')));
const GestionStock = Loadable(lazy(() => import('pages/achats/GestionStock')));
const MouvementsStock = Loadable(lazy(() => import('pages/achats/MouvementsStock')));
const AlertesStock = Loadable(lazy(() => import('pages/achats/AlertesStock')));
const Inventaires = Loadable(lazy(() => import('pages/achats/Inventaires')));
const Categories = Loadable(lazy(() => import('pages/achats/Categories')));

const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));
const Unauthorized = Loadable(lazy(() => import('../pages/Errors/Unauthorized.jsx')));
const ProfesseurDashboard = Loadable(lazy(() => import('pages/ProfesseurDashboard')));
const DoyenDashboard = Loadable(lazy(() => import('pages/DoyenDashboard')));
const SecretaireGeneralDashboard = Loadable(lazy(() => import('pages/SecretaireGeneralDashboard')));

// ==============================|| MAIN ROUTING ||============================== //

// Composant pour gérer la redirection basée sur le rôle
const RoleBasedRedirect = () => {
    const { user } = useContext(AuthContext);
    
    if (user?.role === 'magasinier') {
        return <Navigate to="/magasinier/dashboard" replace />;
    }
    
    if (user?.role === 'professeur') {
        return <Navigate to="/professeur/dashboard" replace />;
    }

    if (user?.role === 'chef_depa') {
        return <Navigate to="/chef-departement/dashboard" replace />;
    }

    if (user?.role === 'doyen') {
        return <Navigate to="/doyen/dashboard" replace />;
    }

    if (user?.role === 'secrétaire général') {
        return <Navigate to="/secretaire-general/dashboard" replace />;
    }
    
    return <Navigate to="/dashboard/default" replace />;
};

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      index: true,
      element: <RoleBasedRedirect />
    },
    // Dashboard du magasinier (protégé)
    {
      path: 'magasinier',
      children: [
        {
          path: 'dashboard',
          element: (
            <PrivateRouteByRole allowedRoles={['magasinier']}>
              <MagasinierDashboard />
            </PrivateRouteByRole>
          )
        }
      ]
    },
    // Dashboard du professeur (protégé)
    {
      path: 'professeur',
      children: [
        {
          path: 'dashboard',
          element: (
            <PrivateRouteByRole allowedRoles={['professeur']}>
              <ProfesseurDashboard />
            </PrivateRouteByRole>
          )
        }
      ]
    },
    // Dashboard du chef de département (protégé)
    {
      path: 'chef-departement',
      children: [
        {
          path: 'dashboard',
          element: (
            <PrivateRouteByRole allowedRoles={['chef_depa']}>
              <ChefDepartementDashboard />
            </PrivateRouteByRole>
          )
        }
      ]
    },
    // Dashboard du doyen (protégé)
    {
      path: 'doyen',
      children: [
        {
          path: 'dashboard',
          element: (
            <PrivateRouteByRole allowedRoles={['doyen']}>
              <DoyenDashboard />
            </PrivateRouteByRole>
          )
        }
      ]
    },
    // Dashboard du secrétaire général (protégé)
    {
      path: 'secretaire-general',
      children: [
        {
          path: 'dashboard',
          element: (
            <PrivateRouteByRole allowedRoles={['secrétaire général']}>
              <SecretaireGeneralDashboard />
            </PrivateRouteByRole>
          )
        }
      ]
    },
    // Dashboard par défaut pour les autres rôles
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    // ==============================|| ACHATS ROUTES ||============================== //
    {
      path: 'creer-demande',
      element: (
        <PrivateRouteByRole allowedRoles={['professeur']}>
          <CreerDemande />
        </PrivateRouteByRole>
      )
    },
    {
      path: 'suivre-demandes',
      element: (
        <PrivateRouteByRole allowedRoles={['professeur']}>
          <SuivreDemandes />
        </PrivateRouteByRole>
      )
    },
    {
      path: 'validation',
      element: (
        <PrivateRouteByRole allowedRoles={['chef_depa','secrétaire général' , 'doyen']}>
          <Validation />
        </PrivateRouteByRole>
      )
    },
    // ==============================|| MAGASINIER ROUTES ||============================== //
    {
      path: 'produits',
      element: (
        <PrivateRouteByRole allowedRoles={['magasinier']}>
          <Produits />
        </PrivateRouteByRole>
      )
    },
    {
      path: 'categories',
      element: (
        <PrivateRouteByRole allowedRoles={['magasinier']}>
          <Categories />
        </PrivateRouteByRole>
      )
    },
    {
      path: 'gestion-stock',
      element: (
        <PrivateRouteByRole allowedRoles={['magasinier']}>
          <GestionStock />
        </PrivateRouteByRole>
      )
    },
    {
      path: 'mouvements-stock',
      element: (
        <PrivateRouteByRole allowedRoles={['magasinier']}>
          <MouvementsStock />
        </PrivateRouteByRole>
      )
    },
    {
      path: 'alertes-stock',
      element: (
        <PrivateRouteByRole allowedRoles={['magasinier']}>
          <AlertesStock />
        </PrivateRouteByRole>
      )
    },
    {
      path: 'inventaires',
      element: (
        <PrivateRouteByRole allowedRoles={['magasinier']}>
          <Inventaires />
        </PrivateRouteByRole>
      )
    },
    // Unauthorized
    {
      path: 'unauthorized',
      element: <Unauthorized />
    },
    // Route de fallback pour les URLs non trouvées
    {
      path: '*',
      element: <Navigate to="/unauthorized" replace />
    }
  ]
};

export default MainRoutes;
