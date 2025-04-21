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
      icon: icons.FileAddOutlined
    },
    {
      id: 'suivre-demandes',
      title: 'Suivre mes Demandes',
      type: 'item',
      url: '/suivre-demandes',
      icon: icons.OrderedListOutlined
    },
    {
      id: 'validation',
      title: 'Validation',
      type: 'item',
      url: '/validation',
      icon: icons.CheckCircleOutlined
    },
    {
      id: 'produits',
      title: 'Produits',
      type: 'item',
      url: '/produits',
      icon: icons.AppstoreOutlined
    }
  ]
};

export default achats;