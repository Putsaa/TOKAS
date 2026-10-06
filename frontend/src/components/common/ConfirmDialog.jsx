import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const ConfirmDialog = ({ open, title, content, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Batal
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
          Konfirmasi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
