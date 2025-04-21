// assets
import {
  FileAddOutlined,
  OrderedListOutlined,
  CheckCircleOutlined,
  AppstoreOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FileAddOutlined,
  OrderedListOutlined,
  CheckCircleOutlined,
  AppstoreOutlined
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
      id: 'produits',
      title: 'Produits',
      type: 'item',
      url: '/produits',
      icon: icons.AppstoreOutlined,
      allowedRoles: ['mgasinier']
    }
  ]
};


export default achats;