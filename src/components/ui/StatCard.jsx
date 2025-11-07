'use client'
import { Box, Typography } from '@mui/material';
import Card from './Card';

export default function StatCard({ label, value, icon, color = '#2196f3' }) {
  return (
    <Card>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            mx: 2,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Card>
  );
}
