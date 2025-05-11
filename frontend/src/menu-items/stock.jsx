// assets
import {
  InboxOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  AlertOutlined,
  BarChartOutlined
} from '@ant-design/icons';

// icons
const icons = {
  InboxOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  AlertOutlined,
  BarChartOutlined
};

// ==============================|| MENU ITEMS - STOCK ||============================== //

const stock = {
  id: 'stock',
  title: 'Gestion de Stock',
  type: 'group',
  children: [
    {
      id: 'entree-stock',
      title: 'Entrée en Stock',
      type: 'item',
      url: '/entree-stock',
      icon: icons.InboxOutlined,
      allowedRoles: ['magasinier']
    },
    {
      id: 'sortie-stock',
      title: 'Sortie de Stock',
      type: 'item',
      url: '/sortie-stock',
      icon: icons.AppstoreOutlined,
      allowedRoles: ['magasinier']
    },
    {
      id: 'historique-stock',
      title: 'Historique des Mouvements',
      type: 'item',
      url: '/historique-stock',
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
      id: 'statistiques-stock',
      title: 'Statistiques',
      type: 'item',
      url: '/statistiques-stock',
      icon: icons.BarChartOutlined,
      allowedRoles: ['magasinier']
    }
  ]
};

export default stock; 