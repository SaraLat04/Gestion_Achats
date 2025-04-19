// material-ui
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import SaleReportCard from 'sections/dashboard/default/SaleReportCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';

// assets
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';

import avatar1 from 'assets/images/users/avatar-1.png';
import avatar2 from 'assets/images/users/avatar-2.png';
import avatar3 from 'assets/images/users/avatar-3.png';
import avatar4 from 'assets/images/users/avatar-4.png';

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      {/* row 1 */}
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Tableau de Bord des Achats</Typography>
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total des Demandes d'Achat" 
          count="422"  
          percentage={59.3} 
 
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total des Validations" 
          count="78"  
          percentage={70.5} 
          extra="8,900" 
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Demande en Attente" 
          count="18"  
          percentage={27.4} 
          isLoss 
          color="warning" 
          extra="943"  
        />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <AnalyticEcommerce 
          title="Total des Achats Validés" 
          count="35"  
          percentage={27.4} 
          isLoss 
          color="warning" 
          extra="20,395"  
        />
      </Grid>
      
      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
      
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard />
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Typography variant="h5">Aperçu d'Achats</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                Statistiques de la Semaine
              </Typography>
              <Typography variant="h3">$7,650</Typography> {/* Remplacer par une variable dynamique */}
            </Stack>
          </Box>
          <MonthlyBarChart /> {/* Remplacer par un graphique qui suit l'évolution des demandes d'achats */}
        </MainCard>
      </Grid>
    </Grid>
  );
}
