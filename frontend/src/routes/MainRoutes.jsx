import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import PrivateRouteByRole from './PrivateRouteByRole.jsx';

// pages
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
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

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      index: true,
      element: <Navigate to="/login" replace />
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
    }
  ]
};

export default MainRoutes;
