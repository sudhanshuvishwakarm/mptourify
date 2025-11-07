'use client'
import { Paper } from '@mui/material';

export default function Card({ children, elevation = 0, sx = {}, ...props }) {
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}