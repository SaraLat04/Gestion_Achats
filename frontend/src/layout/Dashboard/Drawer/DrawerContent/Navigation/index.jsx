// material-ui
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// react
import { useContext } from 'react';

// project import
import NavGroup from './NavGroup';
import { generateMenuItems } from 'menu-items'; // <= appel de la fonction
import { AuthContext } from 'contexts/AuthContext'; // <= contexte pour récupérer user

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

export default function Navigation() {
  const { user } = useContext(AuthContext); // Récupère l'utilisateur connecté
  const menuItems = generateMenuItems(user); // Génère dynamiquement les menus selon le rôle

  const navGroups = menuItems.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
