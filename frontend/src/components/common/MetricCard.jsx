import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import tokens from '../../theme/tokens';

const MetricCard = ({
  title,
  value,
  subvalue,
  icon,
  iconBg = tokens.colors.brand[50],
  iconColor = tokens.colors.brand[500],
  trend,
  trendType = 'positive', // 'positive' | 'negative' | 'neutral'
  trendLabel,
  onClick,
  sx = {},
}) => {
  const isPositive = trendType === 'positive';
  const isNegative = trendType === 'negative';

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.25,
        borderRadius: '12px',
        bgcolor: '#ffffff',
        border: `1px solid ${tokens.colors.neutral[200]}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: tokens.transitions.normal,
        '&:hover': onClick
          ? {
              borderColor: tokens.colors.brand[200],
              transform: 'translateY(-2px)',
              boxShadow: tokens.shadows.cardHover,
            }
          : undefined,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: tokens.colors.neutral[500],
              fontWeight: 600,
              fontSize: '0.78rem',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              display: 'block',
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: tokens.colors.neutral[900],
              fontSize: { xs: '1.25rem', sm: '1.4rem' },
              lineHeight: 1.2,
              fontFeatureSettings: '"tnum"',
            }}
          >
            {value}
          </Typography>
          {subvalue && (
            <Typography
              variant="caption"
              sx={{ color: tokens.colors.neutral[400], fontSize: '0.74rem', mt: 0.25, display: 'block' }}
            >
              {subvalue}
            </Typography>
          )}
        </Box>

        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      {(trend !== undefined || trendLabel) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 'auto', pt: 1, borderTop: `1px solid ${tokens.colors.neutral[100]}` }}>
          {trend && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                py: 0.15,
                borderRadius: '4px',
                bgcolor: isPositive ? tokens.colors.success[50] : isNegative ? tokens.colors.danger[50] : tokens.colors.neutral[100],
                color: isPositive ? tokens.colors.success[700] : isNegative ? tokens.colors.danger[700] : tokens.colors.neutral[600],
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {isPositive && <ArrowUpwardRoundedIcon sx={{ fontSize: 13 }} />}
              {isNegative && <ArrowDownwardRoundedIcon sx={{ fontSize: 13 }} />}
              {trend}
            </Box>
          )}
          {trendLabel && (
            <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontSize: '0.74rem' }}>
              {trendLabel}
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
};

export default MetricCard;
