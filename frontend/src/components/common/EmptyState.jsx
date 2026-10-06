import React from 'react';
import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

const EmptyState = ({ message = 'Data tidak ditemukan' }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={5}>
      <InboxIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default EmptyState;
