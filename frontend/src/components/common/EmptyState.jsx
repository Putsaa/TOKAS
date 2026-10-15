import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import tokens from '../../theme/tokens';

const EmptyState = ({
  icon,
  title = 'Data Tidak Ditemukan',
  message = 'Belum ada data yang tersedia untuk kriteria ini.',
  actionLabel,
  onAction,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 5, md: 7 },
        px: 3,
        textAlign: 'center',
        bgcolor: '#ffffff',
        borderRadius: '12px',
        border: `1px dashed ${tokens.colors.neutral[300]}`,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: tokens.colors.neutral[100],
          color: tokens.colors.neutral[400],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {icon || <InboxOutlinedIcon sx={{ fontSize: 28 }} />}
      </Box>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: tokens.colors.neutral[900],
          fontSize: '0.95rem',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: tokens.colors.neutral[500],
          fontSize: '0.825rem',
          maxWidth: 380,
          mb: actionLabel ? 2.5 : 0,
        }}
      >
        {message}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{
            px: 2.5,
            py: 0.8,
            fontSize: '0.8125rem',
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
