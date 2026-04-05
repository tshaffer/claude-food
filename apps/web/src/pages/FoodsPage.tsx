import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableBody, TableRow,
         TableCell, TextField, Paper, Alert, IconButton, Select, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { selectFoods } from '../store/selectors.js';
import { deleteFood } from '../store/foodsSlice.js';
import { openModal } from '../store/uiSlice.js';

type SortKey = 'name' | 'caloriesPerUnit' | 'proteinPerUnit' | 'fiberPerUnit';

export default function FoodsPage() {
  const dispatch = useAppDispatch();
  const foods    = useAppSelector(selectFoods);

  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const filtered = foods
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      if (typeof av === 'string') return sortDir * av.localeCompare(bv as string);
      return sortDir * ((av as number) - (bv as number));
    });

  function handleSortChange(key: SortKey) {
    if (key === sortBy) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortBy(key); setSortDir(1); }
  }

  return (
    <Box sx={{ p: '20px 28px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">Foods</Typography>
        <Button variant="contained" size="small"
          onClick={() => dispatch(openModal({ type: 'addFood' }))}>
          + New Food
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: '10px 12px', display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField size="small" placeholder="Search foods…" value={search}
          onChange={e => setSearch(e.target.value)} sx={{ width: 260 }} />
        <Box sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">Sort:</Typography>
        <Select size="small" value={sortBy}
          onChange={e => handleSortChange(e.target.value as SortKey)}
          sx={{ minWidth: 160, fontSize: '0.75rem' }}>
          <MenuItem value="name">Name A–Z</MenuItem>
          <MenuItem value="caloriesPerUnit">Calories</MenuItem>
          <MenuItem value="proteinPerUnit">Protein</MenuItem>
          <MenuItem value="fiberPerUnit">Fiber</MenuItem>
        </Select>
      </Paper>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Food</TableCell>
              <TableCell align="right" sx={{ width: 90 }}>Unit Qty</TableCell>
              <TableCell sx={{ width: 100 }}>Unit Type</TableCell>
              <TableCell align="right" sx={{ width: 110 }}>Cal / unit</TableCell>
              <TableCell align="right" sx={{ width: 120 }}>Protein / unit</TableCell>
              <TableCell align="right" sx={{ width: 110 }}>Fiber / unit</TableCell>
              <TableCell align="right" sx={{ width: 80 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                  {search ? 'No foods match your search.' : 'No foods added yet.'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map(f => (
              <TableRow key={f.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{f.name}</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>{f.unitQuantity}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{f.unitType}</TableCell>
                <TableCell align="right">{f.caloriesPerUnit}</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>{f.proteinPerUnit}g</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>{f.fiberPerUnit}g</TableCell>
                <TableCell align="right" sx={{ p: '2px 8px' }}>
                  <IconButton size="small"
                    onClick={() => dispatch(openModal({ type: 'editFood', foodId: f.id }))}>
                    <EditIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" color="error"
                    onClick={() => dispatch(deleteFood(f.id))}>
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
