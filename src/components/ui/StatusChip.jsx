'use client'
import { Chip } from '@mui/material';

export default function StatusChip({ status, label, ...props }) {
  const colorMap = {
    active: 'success',
    inactive: 'error',
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    admin: 'primary',
    rtc: 'success',
  };

  return (
    <Chip
      label={label || status}
      color={colorMap[status] || 'default'}
      size="small"
      sx={{ 
        fontWeight: 600,
        textTransform: 'capitalize',
        borderRadius: 2,
        ...props.sx 
      }}
      {...props}
    />
  );
}