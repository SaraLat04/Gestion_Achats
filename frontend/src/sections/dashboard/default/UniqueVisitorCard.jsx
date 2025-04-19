import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import IncomeAreaChart from './IncomeAreaChart';

// ==============================|| DEFAULT - UNIQUE VISITOR ||============================== //

export default function AchatChartCard() {
  const [view, setView] = useState('monthly'); // 'monthly' or 'quarterly'

  return (
    <>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid>
          <Typography variant="h5">Suivi des Demandes</Typography>
        </Grid>
        <Grid>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Button
              size="small"
              onClick={() => setView('monthly')}
              color={view === 'monthly' ? 'primary' : 'secondary'}
              variant={view === 'monthly' ? 'outlined' : 'text'}
            >
              Mois
            </Button>
            <Button
              size="small"
              onClick={() => setView('quarterly')}
              color={view === 'quarterly' ? 'primary' : 'secondary'}
              variant={view === 'quarterly' ? 'outlined' : 'text'}
            >
              Trimestre
            </Button>
          </Stack>
        </Grid>
      </Grid>
      <MainCard content={false} sx={{ mt: 1.5 }}>
        <Box sx={{ pt: 1, pr: 2 }}>
          <IncomeAreaChart view={view} />
        </Box>
      </MainCard>
    </>
  );
}
