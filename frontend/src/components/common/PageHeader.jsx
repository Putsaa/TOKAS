import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, action }) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h4" component="h1" gutterBottom={false}>
        {title}
      </Typography>
      {action && (
        <Box>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default PageHeader;
