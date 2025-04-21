import React from 'react';
import { Typography } from '@mui/material';

const Unauthorized = () => {
  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h3">403 - Accès refusé</Typography>
      <Typography variant="body1">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</Typography>
    </div>
  );
};

export default Unauthorized;
