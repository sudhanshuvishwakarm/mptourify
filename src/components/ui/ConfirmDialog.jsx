'use client'
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import Button from './Button';

export default function ConfirmDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  icon
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      {icon && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              bgcolor: `${confirmColor}.lighter`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      )}
      <DialogTitle sx={{ textAlign: 'center' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography align="center" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={onClose} fullWidth>
          {cancelText}
        </Button>
        <Button color={confirmColor} onClick={onConfirm} fullWidth>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}