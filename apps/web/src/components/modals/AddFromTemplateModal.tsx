import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button,
         TextField, MenuItem, Box, Typography, Table, TableHead,
         TableBody, TableRow, TableCell, Paper } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { selectSelectedUserId, selectTemplates, selectFoodsById } from '../../store/selectors.js';
import { closeModal } from '../../store/uiSlice.js';
import { addFromTemplate } from '../../store/logEntriesSlice.js';
import { calcNutrition } from '@claude-food/domain';
import { todayISO } from '@claude-food/shared';

const MEAL_SUGGESTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

interface Props {
  initialDate?: string;
  initialMeal?: string;
}

export default function AddFromTemplateModal({ initialDate, initialMeal }: Props) {
  const dispatch       = useAppDispatch();
  const selectedUserId = useAppSelector(selectSelectedUserId)!;
  const templates      = useAppSelector(selectTemplates);
  const foodsById      = useAppSelector(selectFoodsById);

  const [date,       setDate]       = useState(initialDate   ?? todayISO());
  const [meal,       setMeal]       = useState(initialMeal   ?? 'Breakfast');
  const [templateId, setTemplateId] = useState('');
  const [multiplier, setMultiplier] = useState<number>(1);

  const template = templates.find(t => t.id === templateId);

  const previewRows = template?.items.map(item => {
    const food = foodsById[item.foodId];
    if (!food) return null;
    const finalAmount = item.defaultAmount * multiplier;
    const n = calcNutrition(finalAmount, food.unitQuantity,
                             food.caloriesPerUnit, food.proteinPerUnit, food.fiberPerUnit);
    return { foodName: food.name, unitType: food.unitType,
             defaultAmount: item.defaultAmount, finalAmount, ...n };
  }).filter(Boolean) ?? [];

  const totals = previewRows.reduce(
    (acc, r) => r ? { cal: acc.cal + r.calories, pro: acc.pro + r.protein, fib: acc.fib + r.fiber } : acc,
    { cal: 0, pro: 0, fib: 0 }
  );

  async function handleAdd() {
    if (!templateId) return;
    await dispatch(addFromTemplate({
      userId: selectedUserId,
      body: { date, meal, templateId, multiplier },
    }));
    dispatch(closeModal());
  }

  return (
    <Dialog open onClose={() => dispatch(closeModal())} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, pb: 1 }}>Add from Template</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="Date" type="date" size="small" value={date}
            onChange={e => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />

          <TextField label="Meal" size="small" value={meal}
            onChange={e => setMeal(e.target.value)} select sx={{ flex: 1 }}>
            {MEAL_SUGGESTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="Template" size="small" value={templateId}
            onChange={e => setTemplateId(e.target.value)} select sx={{ flex: 1 }}>
            <MenuItem value=""><em>Select template…</em></MenuItem>
            {templates.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
          </TextField>

          <TextField label="Multiplier" type="number" size="small" value={multiplier}
            onChange={e => setMultiplier(Math.max(0.1, Number(e.target.value)))}
            sx={{ width: 110 }} />
        </Box>

        {previewRows.length > 0 && (
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Food</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Cal</TableCell>
                  <TableCell align="right">Protein</TableCell>
                  <TableCell align="right">Fiber</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewRows.map((r, i) => r && (
                  <TableRow key={i}>
                    <TableCell sx={{ fontWeight: 500 }}>{r.foodName}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {Math.round(r.finalAmount * 10) / 10} {r.unitType}
                    </TableCell>
                    <TableCell align="right">{Math.round(r.calories)}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {Math.round(r.protein * 10) / 10}g
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>
                      {Math.round(r.fiber * 10) / 10}g
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell />
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{Math.round(totals.cal)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {Math.round(totals.pro * 10) / 10}g
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {Math.round(totals.fib * 10) / 10}g
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" onClick={() => dispatch(closeModal())}>Cancel</Button>
        <Button size="small" variant="contained" disabled={!templateId}
          onClick={handleAdd}>
          Add Entries
        </Button>
      </DialogActions>
    </Dialog>
  );
}
