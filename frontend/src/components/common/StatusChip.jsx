import React from 'react';
import { Chip } from '@mui/material';

const StatusChip = ({ status }) => {
  const isAktif = status === 'Aktif' || status === true || status === 1;
  return (
    <Chip 
      label={isAktif ? 'Aktif' : 'Tidak Aktif'} 
      color={isAktif ? 'success' : 'error'} 
      size="small" 
    />
  );
};

export default StatusChip;
