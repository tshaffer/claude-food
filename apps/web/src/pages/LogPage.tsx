import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableBody, TableRow,
         TableCell, TextField, MenuItem, Select, Paper, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { selectSelectedUserId, selectEnrichedEntries } from '../store/selectors.js';
import { openModal } from '../store/uiSlice.js';
import { deleteLogEntry } from '../store/logEntriesSlice.js';
import { formatShortDate } from '@claude-food/shared';

export default function LogPage() {
  const dispatch       = useAppDispatch();
  const selectedUserId = useAppSelector(selectSelectedUserId);
  const allEntries     = useAppSelector(selectEnrichedEntries);

  const [dateFilter, setDateFilter]   = useState('');
  const [mealFilter, setMealFilter]   = useState('');
  const [searchText, setSearchText]   = useState('');

  if (!selectedUserId) {
    return <Box sx={{ p: 3 }}><Alert severity="info">Select a user to view the log.</Alert></Box>;
  }

  const meals = [...new Set(allEntries.map(e => e.meal))].sort();

  const filtered = allEntries.filter(e => {
    if (dateFilter && e.date !== dateFilter) return false;
    if (mealFilter && e.meal !== mealFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!e.foodName.toLowerCase().includes(q) &&
          !(e.templateNameSnapshot ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <Box sx={{ p: '20px 28px', display: 'flex', flexDirection: 'column', gap: 1.5, height: 'calc(100vh - 48px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">Log</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" size="small"
            onClick={() => dispatch(openModal({ type: 'addLogEntry' }))}>
            + Add Food Entry
          </Button>
          <Button variant="outlined" size="small"
            onClick={() => dispatch(openModal({ type: 'addFromTemplate' }))}>
            ⊞ Add from Template
          </Button>
        </Box>
      </Box>

      {/* Filter bar */}
      <Paper variant="outlined" sx={{ p: '10px 12px', display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField type="date" size="small" label="Date" value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }} />
        <Select size="small" value={mealFilter} onChange={e => setMealFilter(e.target.value)}
          displayEmpty sx={{ minWidth: 150, fontSize: '0.75rem' }}>
          <MenuItem value=""><em>All Meals</em></MenuItem>
          {meals.map(m => <MenuItem key={m} value={m} sx={{ fontSize: '0.75rem' }}>{m}</MenuItem>)}
        </Select>
        <TextField size="small" placeholder="Search food or template…" value={searchText}
          onChange={e => setSearchText(e.target.value)} sx={{ width: 240 }} />
        <Box sx={{ flex: 1 }} />
        <Button size="small" onClick={() => { setDateFilter(''); setMealFilter(''); setSearchText(''); }}>
          Clear filters
        </Button>
      </Paper>

      {/* Table */}
      <Paper variant="outlined" sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 90 }}>Date</TableCell>
              <TableCell sx={{ width: 130 }}>Meal</TableCell>
              <TableCell sx={{ width: 140 }}>Template</TableCell>
              <TableCell>Food</TableCell>
              <TableCell sx={{ width: 110 }}>Amount</TableCell>
              <TableCell align="right" sx={{ width: 68 }}>Cal</TableCell>
              <TableCell align="right" sx={{ width: 80 }}>Protein</TableCell>
              <TableCell align="right" sx={{ width: 68 }}>Fiber</TableCell>
              <TableCell align="right" sx={{ width: 80 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                  No entries match the current filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map(e => (
              <TableRow key={e.id} hover>
                <TableCell sx={{ color: 'text.secondary' }}>{formatShortDate(e.date)}</TableCell>
                <TableCell>{e.meal}</TableCell>
                <TableCell sx={{ color: e.templateNameSnapshot ? 'text.secondary' : 'text.disabled' }}>
                  {e.templateNameSnapshot ?? '—'}
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{e.foodName}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{e.actualAmount} {e.unitType}</TableCell>
                <TableCell align="right">{Math.round(e.calories)}</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {Math.round(e.protein * 10) / 10}g
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {Math.round(e.fiber * 10) / 10}g
                </TableCell>
                <TableCell align="right" sx={{ p: '2px 8px' }}>
                  <IconButton size="small"
                    onClick={() => dispatch(openModal({ type: 'editLogEntry', entryId: e.id }))}>
                    <EditIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" color="error"
                    onClick={() => dispatch(deleteLogEntry(e.id))}>
                    <DeleteIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
