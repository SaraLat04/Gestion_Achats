import Button from '@mui/material/Button';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';

import achatIcon from 'assets/images/icon-achat.png'; // image custom pour achat

export default function NavCard() {
  return (
    <MainCard sx={{ bgcolor: 'primary.lighter', m: 3 }}>
      <Stack alignItems="center" spacing={2.5}>
        <CardMedia component="img" image={achatIcon} sx={{ width: 80 }} />
        <Stack alignItems="center" spacing={0.5}>
          <Typography variant="h6">Gestion des Achats</Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Créez et suivez 
          </Typography>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            vos demandes facilement
          </Typography>
        </Stack>
        <AnimateButton>
          <Button
            component={RouterLink}
            to="/creer-demande"
            variant="contained"
            color="primary"
            size="small"
          >
            Nouvelle Demande
          </Button>
        </AnimateButton>
      </Stack>
    </MainCard>
  );
}
