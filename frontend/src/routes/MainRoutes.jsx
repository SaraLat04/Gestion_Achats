import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

const CreerDemande = Loadable(lazy(() => import('pages/achats/CreerDemande')));
const SuivreDemandes = Loadable(lazy(() => import('pages/achats/SuivreDemandes')));
const Validation = Loadable(lazy(() => import('pages/achats/Validation')));
const Produits = Loadable(lazy(() => import('pages/achats/Produits')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      index: true, // Redirige la racine vers /login
      element: <Navigate to="/login" replace />,
    },
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
      element: <CreerDemande />
    },
    {
      path: 'suivre-demandes',
      element: <SuivreDemandes />
    },
    {
      path: 'validation',
      element: <Validation />
    },
    {
      path: 'produits',
      element: <Produits />
    }
  ]
};

export default MainRoutes;