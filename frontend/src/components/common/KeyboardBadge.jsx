import React from 'react';
import { Box, Typography } from '@mui/material';
import tokens from '../../theme/tokens';

const KeyboardBadge = ({ shortcut, label, sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        ...sx,
      }}
    >
      <Box
        component="kbd"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 0.75,
          py: 0.2,
          minWidth: 20,
          height: 18,
          borderRadius: '4px',
          bgcolor: tokens.colors.neutral[100],
          border: `1px solid ${tokens.colors.neutral[300]}`,
          borderBottomWidth: '2px',
          color: tokens.colors.neutral[700],
          fontSize: '0.675rem',
          fontFamily: 'inherit',
          fontWeight: 700,
          boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
        }}
      >
        {shortcut}
      </Box>
      {label && (
        <Typography
          variant="caption"
          sx={{
            color: tokens.colors.neutral[500],
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default KeyboardBadge;
