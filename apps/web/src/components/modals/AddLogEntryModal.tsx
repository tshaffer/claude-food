import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button,
         TextField, MenuItem, Box, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { selectSelectedUserId, selectFoods } from '../../store/selectors.js';
import { closeModal } from '../../store/uiSlice.js';
import { createLogEntry } from '../../store/logEntriesSlice.js';
import { calcNutrition } from '@claude-food/domain';
import { todayISO } from '@claude-food/shared';

const MEAL_SUGGESTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

interface Props {
  initialDate?: string;
  initialMeal?: string;
}

export default function AddLogEntryModal({ initialDate, initialMeal }: Props) {
  const dispatch       = useAppDispatch();
  const selectedUserId = useAppSelector(selectSelectedUserId)!;
  const foods          = useAppSelector(selectFoods);

  const [date,   setDate]   = useState(initialDate ?? todayISO());
  const [meal,   setMeal]   = useState(initialMeal ?? 'Breakfast');
  const [foodId, setFoodId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');

  const food      = foods.find(f => f.id === foodId);
  const preview   = food && amount !== ''
    ? calcNutrition(Number(amount), food.unitQuantity,
                    food.caloriesPerUnit, food.proteinPerUnit, food.fiberPerUnit)
    : null;

  async function handleSave(addAnother = false) {
    if (!foodId || amount === '') return;
    await dispatch(createLogEntry({
      userId: selectedUserId,
      body: { userId: selectedUserId, date, meal, foodId, actualAmount: Number(amount) },
    }));
    if (addAnother) {
      setFoodId(''); setAmount('');
    } else {
      dispatch(closeModal());
    }
  }

  return (
    <Dialog open onClose={() => dispatch(closeModal())} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, pb: 1 }}>Add Food Entry</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
        <TextField label="Date" type="date" size="small" value={date}
          onChange={e => setDate(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }} />

        <TextField label="Meal" size="small" value={meal}
          onChange={e => setMeal(e.target.value)} select>
          {MEAL_SUGGESTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          {meal && !MEAL_SUGGESTIONS.includes(meal) && (
            <MenuItem value={meal}>{meal}</MenuItem>
          )}
        </TextField>

        <TextField label="Food" size="small" value={foodId}
          onChange={e => setFoodId(e.target.value)} select>
          <MenuItem value=""><em>Select food…</em></MenuItem>
          {foods.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
        </TextField>

        <TextField label={`Amount${food ? ` (${food.unitType})` : ''}`}
          type="number" size="small" value={amount}
          onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} />

        {preview && (
          <Box sx={{ bgcolor: '#F8FAFC', border: '1px solid', borderColor: 'divider',
                     borderRadius: 1, p: 1.25, display: 'flex', gap: 2 }}>
            {[
              { label: 'Calories', value: Math.round(preview.calories).toString() },
              { label: 'Protein',  value: `${Math.round(preview.protein * 10) / 10}g` },
              { label: 'Fiber',    value: `${Math.round(preview.fiber   * 10) / 10}g` },
            ].map(item => (
              <Box key={item.label} sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" onClick={() => dispatch(closeModal())}>Cancel</Button>
        <Button size="small" variant="outlined" disabled={!foodId || amount === ''}
          onClick={() => handleSave(true)}>
          Save & Add Another
        </Button>
        <Button size="small" variant="contained" disabled={!foodId || amount === ''}
          onClick={() => handleSave(false)}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
