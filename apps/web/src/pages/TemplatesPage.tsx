import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem, List, ListItemButton, ListItemText,
         Paper, Table, TableHead, TableBody, TableRow, TableCell,
         IconButton, Alert, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { selectSelectedUserId, selectTemplates, selectFoods } from '../store/selectors.js';
import { createTemplate, updateTemplate, deleteTemplate } from '../store/templatesSlice.js';
import { openModal } from '../store/uiSlice.js';
import { calcNutrition } from '@claude-food/domain';
import type { TemplateWithItems } from '../store/templatesSlice.js';

interface DraftItem {
  clientId: string;
  id?: string;
  foodId: string;
  defaultAmount: number | '';
}

export default function TemplatesPage() {
  const dispatch       = useAppDispatch();
  const selectedUserId = useAppSelector(selectSelectedUserId);
  const templates      = useAppSelector(selectTemplates);
  const foods          = useAppSelector(selectFoods);
  const foodsById      = Object.fromEntries(foods.map(f => [f.id, f]));

  const [search,       setSearch]       = useState('');
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [draftName,    setDraftName]    = useState('');
  const [draftItems,   setDraftItems]   = useState<DraftItem[]>([]);
  const [hasChanges,   setHasChanges]   = useState(false);

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  function loadTemplate(t: TemplateWithItems) {
    setSelectedId(t.id);
    setDraftName(t.name);
    setDraftItems(t.items.map(i => ({
      clientId: i.id, id: i.id, foodId: i.foodId, defaultAmount: i.defaultAmount,
    })));
    setHasChanges(false);
  }

  function addRow() {
    setDraftItems(prev => [...prev, {
      clientId: `new-${Date.now()}`, foodId: '', defaultAmount: '',
    }]);
    setHasChanges(true);
  }

  function removeRow(clientId: string) {
    setDraftItems(prev => prev.filter(i => i.clientId !== clientId));
    setHasChanges(true);
  }

  function updateRow(clientId: string, patch: Partial<DraftItem>) {
    setDraftItems(prev => prev.map(i => i.clientId === clientId ? { ...i, ...patch } : i));
    setHasChanges(true);
  }

  async function handleSave() {
    if (!selectedId) return;
    const items = draftItems
      .filter(i => i.foodId && i.defaultAmount !== '')
      .map((i, idx) => ({ foodId: i.foodId, lineNumber: idx + 1, defaultAmount: Number(i.defaultAmount) }));
    await dispatch(updateTemplate({ id: selectedId, name: draftName, items }));
    setHasChanges(false);
  }

  async function handleNewTemplate() {
    if (!selectedUserId) return;
    const result = await dispatch(createTemplate({ userId: selectedUserId, name: 'Untitled Template' }));
    if (createTemplate.fulfilled.match(result)) {
      loadTemplate(result.payload);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    await dispatch(deleteTemplate(selectedId));
    setSelectedId(null); setDraftName(''); setDraftItems([]);
  }

  // Totals
  const totals = draftItems.reduce(
    (acc, item) => {
      const food = foodsById[item.foodId];
      if (!food || item.defaultAmount === '') return acc;
      const n = calcNutrition(Number(item.defaultAmount), food.unitQuantity,
                              food.caloriesPerUnit, food.proteinPerUnit, food.fiberPerUnit);
      return { cal: acc.cal + n.calories, pro: acc.pro + n.protein, fib: acc.fib + n.fiber };
    },
    { cal: 0, pro: 0, fib: 0 }
  );

  if (!selectedUserId) {
    return <Box sx={{ p: 3 }}><Alert severity="info">Select a user to manage templates.</Alert></Box>;
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Left panel */}
      <Box sx={{ width: 260, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider',
                 bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: '16px 16px 12px', display: 'flex', justifyContent: 'space-between',
                   alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h3">Templates</Typography>
          <Button size="small" variant="contained" onClick={handleNewTemplate}>+ New</Button>
        </Box>
        <Box sx={{ p: '10px 12px' }}>
          <TextField size="small" fullWidth placeholder="Search templates…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </Box>
        <List dense sx={{ flex: 1, overflow: 'auto', pt: 0 }}>
          {filtered.map(t => (
            <ListItemButton key={t.id} selected={t.id === selectedId}
              onClick={() => loadTemplate(t)}
              sx={{ '&.Mui-selected': { bgcolor: '#EFF6FF' } }}>
              <ListItemText
                primary={t.name}
                secondary={`${t.items.length} items`}
                slotProps={{
                  primary:   { sx: { fontSize: '0.8125rem', fontWeight: t.id === selectedId ? 600 : 400,
                                     color: t.id === selectedId ? 'primary.main' : 'text.primary' }},
                  secondary: { sx: { fontSize: '0.6875rem' }},
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Right panel */}
      <Box sx={{ flex: 1, p: '20px 24px', display: 'flex', flexDirection: 'column', gap: 1.5,
                 overflow: 'auto' }}>
        {!selectedId ? (
          <Alert severity="info">Select a template or create a new one.</Alert>
        ) : (
          <>
            {/* Editor header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2,
                       pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <TextField size="small" value={draftName}
                onChange={e => { setDraftName(e.target.value); setHasChanges(true); }}
                sx={{ width: 280 }} />
              <Box sx={{ flex: 1 }} />
              <Button variant="contained" size="small" disabled={!hasChanges} onClick={handleSave}>
                Save
              </Button>
              <Button variant="outlined" size="small"
                onClick={() => dispatch(openModal({
                  type: 'addFromTemplate',
                  initialDate: undefined, initialMeal: undefined,
                }))}>
                Log This Template
              </Button>
              <Button variant="outlined" size="small" color="error" onClick={handleDelete}>
                Delete
              </Button>
            </Box>

            {/* Items table */}
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 32 }}>#</TableCell>
                    <TableCell>Food</TableCell>
                    <TableCell sx={{ width: 140 }}>Default Amount</TableCell>
                    <TableCell align="right" sx={{ width: 72 }}>Cal</TableCell>
                    <TableCell align="right" sx={{ width: 80 }}>Protein</TableCell>
                    <TableCell align="right" sx={{ width: 72 }}>Fiber</TableCell>
                    <TableCell sx={{ width: 40 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {draftItems.map((item, idx) => {
                    const food = foodsById[item.foodId];
                    const n = food && item.defaultAmount !== ''
                      ? calcNutrition(Number(item.defaultAmount), food.unitQuantity,
                                      food.caloriesPerUnit, food.proteinPerUnit, food.fiberPerUnit)
                      : null;
                    return (
                      <TableRow key={item.clientId}>
                        <TableCell sx={{ color: 'text.disabled' }}>{idx + 1}</TableCell>
                        <TableCell>
                          <TextField select size="small" fullWidth value={item.foodId}
                            onChange={e => updateRow(item.clientId, { foodId: e.target.value })}
                            sx={{ fontSize: '0.75rem' }}>
                            <MenuItem value=""><em>Select food…</em></MenuItem>
                            {foods.map(f => (
                              <MenuItem key={f.id} value={f.id} sx={{ fontSize: '0.75rem' }}>
                                {f.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={item.defaultAmount}
                            onChange={e => updateRow(item.clientId, { defaultAmount: e.target.value === '' ? '' : Number(e.target.value) })}
                            slotProps={{ input: { endAdornment: food ? <Typography variant="caption" sx={{ ml: 0.5, whiteSpace: 'nowrap' }}>{food.unitType}</Typography> : undefined } }}
                            sx={{ width: 120 }} />
                        </TableCell>
                        <TableCell align="right">{n ? Math.round(n.calories) : '—'}</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>
                          {n ? `${Math.round(n.protein * 10) / 10}g` : '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>
                          {n ? `${Math.round(n.fiber * 10) / 10}g` : '—'}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => removeRow(item.clientId)}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Box sx={{ p: '8px 12px', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button size="small" onClick={addRow}>+ Add Food to Template</Button>
              </Box>
            </Paper>

            {/* Totals */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { label: 'Total Calories', value: Math.round(totals.cal).toString() },
                { label: 'Total Protein',  value: `${Math.round(totals.pro * 10) / 10}g` },
                { label: 'Total Fiber',    value: `${Math.round(totals.fib * 10) / 10}g` },
              ].map(t => (
                <Paper key={t.label} variant="outlined" sx={{ flex: 1, p: '10px 16px' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {t.label}
                  </Typography>
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{t.value}</Typography>
                </Paper>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
