'use client'
import { Button as MuiButton } from '@mui/material';

export default function Button({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium',
  startIcon,
  endIcon,
  ...props 
}) {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        textTransform: 'none',
        borderRadius: 2,
        fontWeight: 600,
        px: 3,
        py: 1.5,
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
}