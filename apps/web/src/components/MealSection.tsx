import React from 'react';
import { Box, Paper, Typography, Table, TableHead, TableBody,
         TableRow, TableCell, Button, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MealGroup } from '@claude-food/domain';
import { useAppDispatch } from '../store/hooks.js';
import { openModal } from '../store/uiSlice.js';
import { deleteLogEntry } from '../store/logEntriesSlice.js';

interface Props {
  group: MealGroup;
  onAddToMeal: (meal: string) => void;
}

export default function MealSection({ group, onAddToMeal }: Props) {
  const dispatch = useAppDispatch();
  const totalsLabel = `${Math.round(group.calories)} cal · ${Math.round(group.protein * 10) / 10}g protein · ${Math.round(group.fiber * 10) / 10}g fiber`;

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      {/* Meal header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                 px: 1.5, py: 0.875, bgcolor: '#F1F5F9', borderBottom: '1px solid',
                 borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{group.meal}</Typography>
          <Typography variant="caption" color="text.secondary">{totalsLabel}</Typography>
        </Box>
        <Button size="small" sx={{ fontSize: '0.6875rem', py: 0, minWidth: 0 }}
          onClick={() => onAddToMeal(group.meal)}>
          + Add
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Food</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Protein</TableCell>
            <TableCell align="right">Fiber</TableCell>
            <TableCell align="right" sx={{ width: 80 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {group.entries.map(entry => (
            <TableRow key={entry.id} hover>
              <TableCell sx={{ fontWeight: 500 }}>{entry.foodName}</TableCell>
              <TableCell color="text.secondary">
                {entry.actualAmount} {entry.unitType}
              </TableCell>
              <TableCell align="right">{Math.round(entry.calories)}</TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>
                {Math.round(entry.protein * 10) / 10}g
              </TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>
                {Math.round(entry.fiber * 10) / 10}g
              </TableCell>
              <TableCell align="right" sx={{ p: '2px 8px' }}>
                <IconButton size="small"
                  onClick={() => dispatch(openModal({ type: 'editLogEntry', entryId: entry.id }))}>
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton size="small" color="error"
                  onClick={() => dispatch(deleteLogEntry(entry.id))}>
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
