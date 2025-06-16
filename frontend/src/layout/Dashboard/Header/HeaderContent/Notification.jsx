import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate pour la redirection
import Chip from '@mui/material/Chip';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

import { getNotifications } from '../../../../api/demande'; // Assure-toi que le chemin est correct
import { getAlerteStock } from '../../../../api/produit'; // en plus de getNotifications

import { getUserById } from '../../../../api/utilisateur';

export default function Notification() {
  const navigate = useNavigate(); // Hook pour la redirection
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  const [read, setRead] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState('');
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };


const enrichWithProfName = async (notifList) => {
  const enriched = await Promise.all(
    notifList.map(async (notif) => {
      let nom_prof = 'Inconnu';
      try {
        const response = await getUserById(notif.utilisateur_id); // ta fonction API
        nom_prof = response?.nom && response?.prenom ? `${response.nom} ${response.prenom}` : 'Inconnu';
      } catch (e) {
        console.error('Erreur récupération utilisateur', e);
      }
      return { ...notif, nom_prof };
    })
  );
  return enriched;
};


useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) return;

      setUserRole(storedUser.role);

      let notifs = [];

      if (storedUser.role === 'magasinier') {
        const produitsFaibles = await getAlerteStock();
        console.log('Produits faibles', produitsFaibles);

        notifs = produitsFaibles.map((produit) => ({
  id: produit.id,
  titre: 'Stock faible',
  message: `Le produit "${produit.nom}" a une quantité faible (${produit.quantite})`,
  date: new Date().toISOString(),
  type: 'stock',
  produit: { nom: produit.nom, quantite: produit.quantite }, // ajoute ce bloc
}));

      } else {
        const demandes = await getNotifications();
const enrichies = await enrichWithProfName(demandes);
console.log('Utilisateur connecté :', storedUser);
console.log('Demandes enrichies :', enrichies);

// Filtrage uniquement si c'est un chef de département
if (storedUser.role === 'chef de département' || storedUser.role === 'chef_depa') {

  // Filtrer par département
  const filtered = enrichies.filter((notif) => notif.departement === storedUser.departement);
  notifs = filtered.map((notif) => ({
    id: notif.id,
    titre: 'Nouvelle demande',
    message: `${notif.nom_prof} a soumis une demande`,
    date: notif.created_at,
    description: notif.description,
    departement: notif.departement,
    statut: notif.statut,
    nom_prof: notif.nom_prof
  }));
} else {
  notifs = enrichies.map((notif) => ({
    id: notif.id,
    titre: 'Nouvelle demande',
    message: `${notif.nom_prof} a soumis une demande`,
    date: notif.created_at,
    description: notif.description,
    departement: notif.departement,
    statut: notif.statut,
    nom_prof: notif.nom_prof
  }));
}


      }

      setNotifications(notifs);
      setRead(notifs.length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications :', error);
    }
  };

  fetchNotifications();
}, []);



  // Fonction pour rediriger vers la page de validation
  // Fonction pour rediriger selon le rôle et le type de notification
const handleNotificationClick = (notifId) => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const userRole = storedUser?.role;

  // Redirection spécifique selon le rôle
  if (userRole === 'magasinier') {
    navigate('/alertes-stock/');
  } else if (userRole === 'professeur') {
    navigate('/suivre-demandes/');
  } else {
    // Par défaut pour les autres rôles (chef_depa, doyen, etc.)
    navigate('/validation/');
  }

  // Optionnel : marquer comme lu (ex: setRead(prev => prev - 1) ou setRead(0))
};

  



const formatStatut = (statut) => {
  switch (statut) {
    case 'en attente':
      return 'En attente';
    case 'validé':
      return 'Validée';
    case 'refusé':
      return 'Rejetée';
    case 'envoyée au doyen':
      return 'Envoyée au doyen';
    case 'envoyée au secre':
      return 'Envoyée au secrétaire général';
    case 'envoyée au responsable financier':
      return 'Envoyée au responsable financier';
    case 'traitée':
      return 'Traitée';
    default:
      return 'Statut inconnu';
  }
};

const getStatutChipColor = (statut) => {
  switch (statut) {
    case 'en attente':
      return { label: 'En attente', color: 'warning' };
    case 'validé':
      return { label: 'Validée', color: 'success' };
    case 'refusé':
      return { label: 'Rejetée', color: 'error' };
    case 'envoyée au doyen':
      return { label: 'Au doyen', color: 'info' };
    case 'envoyée au secre':
      return { label: 'Au secrétaire général', color: 'info' };
    case 'envoyée au responsable financier':
      return { label: 'Au responsable financier', color: 'info' };
    case 'traitée':
      return { label: 'Traitée', color: 'success' };
    default:
      return { label: 'Inconnu', color: 'default' };
  }
};

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
  color="secondary"
  variant="light"
  sx={(theme) => ({
    color: 'text.primary',
    bgcolor: open ? 'grey.100' : 'transparent',
    ...theme.applyStyles('dark', { bgcolor: open ? 'background.default' : 'transparent' })
  })}
  aria-label="open profile"
  ref={anchorRef}
  aria-controls={open ? 'profile-grow' : undefined}
  aria-haspopup="true"
  onClick={handleToggle}
>
  <Badge badgeContent={read} color={userRole === 'magasinier' ? 'error' : 'primary'}>
    <BellOutlined />
  </Badge>
</IconButton>

      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notifications"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {read > 0 && (
                        <Tooltip title="Marquer toutes comme lues">
                          <IconButton color="success" size="small" onClick={() => setRead(0)}>
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        px: 2,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': avatarSX,
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.map((notif, index) => (
  <ListItem
    key={notif.id}
    component={ListItemButton}
    divider
    selected={read > 0}
    onClick={() => handleNotificationClick(notif.id)}
    secondaryAction={
      <Typography variant="caption" noWrap>
        {notif.date_demande ? new Date(notif.date_demande).toLocaleDateString() : new Date(notif.date).toLocaleDateString()}
      </Typography>
    }
  >
    <ListItemAvatar>
      <Avatar
  sx={{
    color: notif.type === 'stock' ? 'error.main' : 'info.main',
    bgcolor: notif.type === 'stock' ? 'error.lighter' : 'info.lighter'
  }}
>
  <BellOutlined />
</Avatar>

    </ListItemAvatar>
    <ListItemText
  primary={
    notif.type === 'stock' ? (
      <Typography variant="h6">
        Stock faible : <Typography component="span" variant="subtitle1">{notif.produit.nom}</Typography>
      </Typography>
    ) : userRole === 'professeur' ? (
      <>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
  Statut de la demande : <Typography component="span" variant="subtitle1">{notif.description?.substring(0, 25)}...</Typography>
</Typography>
<Chip
  label={getStatutChipColor(notif.statut).label}
  color={getStatutChipColor(notif.statut).color}
  size="small"
  variant="outlined"
/>


      </>
    ) : (
      <>
        <Typography variant="h6">
          Nouvelle demande du département : <Typography component="span" variant="subtitle1">{notif.departement}</Typography>
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Demandeur : {notif.nom_prof}
        </Typography>
      </>
    )
  }
  secondary={
    notif.type === 'stock'
      ? `Quantité: ${notif.produit.quantite}`
      : userRole === 'professeur'
        ? null // Ne pas afficher de description
        : `Description: ${notif.description?.substring(0, 10)}...`
  }
/>

  </ListItem>
))}


                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}