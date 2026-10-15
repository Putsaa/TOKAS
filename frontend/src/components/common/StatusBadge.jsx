import React from 'react';
import { Box, Typography } from '@mui/material';
import tokens from '../../theme/tokens';

/**
 * StatusBadge Component
 * Semantic status indicator badge with high-contrast text and clean background
 * variants: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 */
const StatusBadge = ({
  status,
  variant,
  label,
  size = 'medium',
  showDot = false,
  sx = {},
}) => {
  // Determine variant automatically if status string is provided
  let determinedVariant = variant || 'neutral';
  let displayLabel = label;

  if (!variant && status !== undefined) {
    const s = String(status).toLowerCase();
    if (s === 'aktif' || s === 'active' || s === 'true' || s === 'selesai' || s === 'success' || s === 'aman') {
      determinedVariant = 'success';
      displayLabel = displayLabel || (s === 'true' ? 'Aktif' : status);
    } else if (s === 'menipis' || s === 'warning' || s === 'pending' || s === 'rendah') {
      determinedVariant = 'warning';
      displayLabel = displayLabel || status;
    } else if (s === 'tidak aktif' || s === 'inactive' || s === 'false' || s === 'habis' || s === 'batal' || s === 'kritis' || s === 'error') {
      determinedVariant = 'danger';
      displayLabel = displayLabel || (s === 'false' ? 'Nonaktif' : status);
    } else {
      determinedVariant = 'neutral';
      displayLabel = displayLabel || status;
    }
  }

  const variantStyles = {
    success: {
      bg: tokens.colors.success[50],
      text: tokens.colors.success[700],
      border: tokens.colors.success[100],
      dot: tokens.colors.success[500],
    },
    warning: {
      bg: tokens.colors.warning[50],
      text: tokens.colors.warning[700],
      border: tokens.colors.warning[100],
      dot: tokens.colors.warning[500],
    },
    danger: {
      bg: tokens.colors.danger[50],
      text: tokens.colors.danger[700],
      border: tokens.colors.danger[100],
      dot: tokens.colors.danger[500],
    },
    info: {
      bg: tokens.colors.info[50],
      text: tokens.colors.info[700],
      border: tokens.colors.info[100],
      dot: tokens.colors.info[500],
    },
    neutral: {
      bg: tokens.colors.neutral[100],
      text: tokens.colors.neutral[700],
      border: tokens.colors.neutral[200],
      dot: tokens.colors.neutral[400],
    },
  };

  const style = variantStyles[determinedVariant] || variantStyles.neutral;
  const isSmall = size === 'small';

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: isSmall ? 1 : 1.25,
        py: isSmall ? 0.2 : 0.35,
        borderRadius: '6px',
        bgcolor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...sx,
      }}
    >
      {showDot && (
        <Box
          component="span"
          sx={{
            width: isSmall ? 5 : 6,
            height: isSmall ? 5 : 6,
            borderRadius: '50%',
            bgcolor: style.dot,
            flexShrink: 0,
          }}
        />
      )}
      <Typography
        component="span"
        sx={{
          fontSize: 'inherit',
          fontWeight: 'inherit',
          color: 'inherit',
        }}
      >
        {displayLabel}
      </Typography>
    </Box>
  );
};

export default StatusBadge;
