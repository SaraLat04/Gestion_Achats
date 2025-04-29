import dashboard from './dashboard';
import pages from './page';
import achats from './achats';

export function generateMenuItems(user) {
  const userRole = user?.role?.toLowerCase();

  const filteredAchats = {
    ...achats,
    children: achats.children.filter(item =>
      item.allowedRoles?.map(role => role.toLowerCase()).includes(userRole)
    )
  };

  return {
    items: [dashboard, pages, filteredAchats]
  };
}

// Ajout à la fin :
const user = JSON.parse(localStorage.getItem('user'));
const menuItems = generateMenuItems(user);

export default menuItems;