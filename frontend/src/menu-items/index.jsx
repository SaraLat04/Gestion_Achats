// project import
import dashboard from './dashboard';
import pages from './page';
import achats from './achats';

// Récupérer le user depuis le localStorage
const user = JSON.parse(localStorage.getItem('user'));
const userRole = user?.role?.toLowerCase(); // Gestion de la casse

// On filtre les enfants de "achats" selon les rôles autorisés définis dans chaque item
const filteredAchats = {
  ...achats,
  children: achats.children.filter(item =>
    item.allowedRoles?.map(role => role.toLowerCase()).includes(userRole)
  )
};

// Final menu
const menuItems = {
  items: [dashboard, pages, filteredAchats]
};

export default menuItems;
