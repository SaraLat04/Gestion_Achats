// assets
import {
  FileAddOutlined,
  OrderedListOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  InboxOutlined,
  HistoryOutlined,
  AlertOutlined,
  BarChartOutlined,
  TagsOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FileAddOutlined,
  OrderedListOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  InboxOutlined,
  HistoryOutlined,
  AlertOutlined,
  BarChartOutlined,
  TagsOutlined
};

// ==============================|| MENU ITEMS - ACHATS ||============================== //

const achats = {
  id: 'achats',
  title: 'Achats',
  type: 'group',
  children: [
    {
      id: 'creer-demande',
      title: 'Créer Demande',
      type: 'item',
      url: '/creer-demande',
      icon: icons.FileAddOutlined,
      allowedRoles: ['directeur labo', 'professeur', 'chef_depa']
    },
    {
      id: 'suivre-demandes',
      title: 'Suivre mes Demandes',
      type: 'item',
      url: '/suivre-demandes',
      icon: icons.OrderedListOutlined,
      allowedRoles: ['directeur labo', 'professeur', 'chef_depa']
    },
    {
      id: 'validation',
      title: 'Validation',
      type: 'item',
      url: '/validation',
      icon: icons.CheckCircleOutlined,
      allowedRoles: ['secrétaire général', 'responsable financier', 'doyen']
    },

    {
      id: 'categories',
      title: 'Catégories',
      type: 'item',
      url: '/categories',
      icon: icons.TagsOutlined,
      allowedRoles: ['magasinier']
    },
    {
      id: 'produits',
      title: 'Produits',
      type: 'item',
      url: '/produits',
      icon: icons.AppstoreOutlined,
      allowedRoles: ['magasinier']
    },
    
    {
      id: 'gestion-stock',
      title: 'Gestion de Stock',
      type: 'item',
      url: '/gestion-stock',
      icon: icons.InboxOutlined,
      allowedRoles: ['magasinier']
    },
    {
      id: 'mouvements-stock',
      title: 'Mouvements de Stock',
      type: 'item',
      url: '/mouvements-stock',
      icon: icons.HistoryOutlined,
      allowedRoles: ['magasinier']
    },
    {
      id: 'alertes-stock',
      title: 'Alertes de Stock',
      type: 'item',
      url: '/alertes-stock',
      icon: icons.AlertOutlined,
      allowedRoles: ['magasinier']
    },
    {
      id: 'inventaires',
      title: 'Inventaires',
      type: 'item',
      url: '/inventaires',
      icon: icons.BarChartOutlined,
      allowedRoles: ['magasinier']
    }
  ]
};

export default achats;