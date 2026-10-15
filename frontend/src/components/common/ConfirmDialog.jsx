import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import tokens from '../../theme/tokens';

const ConfirmDialog = ({
  open,
  title = 'Konfirmasi Tindakan',
  content = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  onConfirm,
  onCancel,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  isDanger = false,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '14px',
          p: 1,
          border: `1px solid ${tokens.colors.neutral[200]}`,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {isDanger && (
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                bgcolor: tokens.colors.danger[50],
                color: tokens.colors.danger[600],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
          )}
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: tokens.colors.neutral[900] }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2.5, py: 1.5 }}>
        <DialogContentText sx={{ color: tokens.colors.neutral[600], fontSize: '0.85rem' }}>
          {content}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2, pt: 1, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          sx={{
            borderColor: tokens.colors.neutral[300],
            color: tokens.colors.neutral[700],
            fontWeight: 600,
            fontSize: '0.8125rem',
            px: 2,
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            bgcolor: isDanger ? tokens.colors.danger[600] : tokens.colors.brand[500],
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.8125rem',
            px: 2.5,
            '&:hover': {
              bgcolor: isDanger ? tokens.colors.danger[700] : tokens.colors.brand[600],
            },
          }}
        >
          {loading ? 'Memproses...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
