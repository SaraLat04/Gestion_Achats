// HeaderContent/index.jsx
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project imports
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {/* Espace vide pour pousser les éléments à droite */}
      <Box sx={{ flexGrow: 1 }} />

      <Notification />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
