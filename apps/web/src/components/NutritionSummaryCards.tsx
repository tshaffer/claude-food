import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface Props {
  calories: number;
  protein: number;
  fiber: number;
}

export default function NutritionSummaryCards({ calories, protein, fiber }: Props) {
  const cards = [
    { label: 'Calories', value: Math.round(calories).toLocaleString(), unit: 'kcal', color: '#3B82F6' },
    { label: 'Protein',  value: `${Math.round(protein * 10) / 10} g`,  unit: '',     color: '#10B981' },
    { label: 'Fiber',    value: `${Math.round(fiber   * 10) / 10} g`,  unit: '',     color: '#F59E0B' },
  ];
  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {cards.map(c => (
        <Paper key={c.label} variant="outlined" sx={{ flex: 1, p: '12px 16px' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {c.label}
          </Typography>
          <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: c.color, lineHeight: 1.2 }}>
            {c.value}
          </Typography>
          {c.unit && (
            <Typography variant="caption" color="text.disabled">{c.unit}</Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
}
