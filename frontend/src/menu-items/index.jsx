// menu-items/index.jsx

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
