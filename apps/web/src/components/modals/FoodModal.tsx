import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button,
         TextField, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import { selectFoods } from '../../store/selectors.js';
import { closeModal } from '../../store/uiSlice.js';
import { createFood, updateFood, deleteFood } from '../../store/foodsSlice.js';
import type { CreateFoodRequest } from '@claude-food/domain';

interface Props { foodId?: string; }

export default function FoodModal({ foodId }: Props) {
  const dispatch  = useAppDispatch();
  const foods     = useAppSelector(selectFoods);
  const existing  = foodId ? foods.find(f => f.id === foodId) : undefined;
  const isEditing = !!existing;

  const [name,     setName]     = useState(existing?.name            ?? '');
  const [unitQty,  setUnitQty]  = useState<number | ''>(existing?.unitQuantity   ?? '');
  const [unitType, setUnitType] = useState(existing?.unitType        ?? '');
  const [cal,      setCal]      = useState<number | ''>(existing?.caloriesPerUnit ?? '');
  const [protein,  setProtein]  = useState<number | ''>(existing?.proteinPerUnit  ?? '');
  const [fiber,    setFiber]    = useState<number | ''>(existing?.fiberPerUnit    ?? '');

  const isValid = name.trim() && unitQty !== '' && unitType.trim() &&
                  cal !== '' && protein !== '' && fiber !== '';

  async function handleSave() {
    if (!isValid) return;
    const body: CreateFoodRequest = {
      name: name.trim(), unitQuantity: Number(unitQty), unitType: unitType.trim(),
      caloriesPerUnit: Number(cal), proteinPerUnit: Number(protein), fiberPerUnit: Number(fiber),
    };
    if (isEditing) {
      await dispatch(updateFood({ id: foodId!, body }));
    } else {
      await dispatch(createFood(body));
    }
    dispatch(closeModal());
  }

  async function handleDelete() {
    if (foodId) await dispatch(deleteFood(foodId));
    dispatch(closeModal());
  }

  return (
    <Dialog open onClose={() => dispatch(closeModal())} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem', fontWeight: 600, pb: 1 }}>
        {isEditing ? 'Edit Food' : 'New Food'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: '8px !important' }}>
        <TextField label="Food Name" size="small" value={name}
          onChange={e => setName(e.target.value)} autoFocus />

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="Unit Quantity" type="number" size="small" value={unitQty}
            onChange={e => setUnitQty(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ flex: 1 }} />
          <TextField label="Unit Type" size="small" value={unitType}
            onChange={e => setUnitType(e.target.value)} placeholder="cup, oz, each…"
            sx={{ flex: 1 }} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField label="Calories / unit" type="number" size="small" value={cal}
            onChange={e => setCal(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ flex: 1 }} />
          <TextField label="Protein / unit (g)" type="number" size="small" value={protein}
            onChange={e => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ flex: 1 }} />
          <TextField label="Fiber / unit (g)" type="number" size="small" value={fiber}
            onChange={e => setFiber(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ flex: 1 }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {isEditing && (
          <Button size="small" color="error" onClick={handleDelete} sx={{ mr: 'auto' }}>
            Delete
          </Button>
        )}
        <Button size="small" onClick={() => dispatch(closeModal())}>Cancel</Button>
        <Button size="small" variant="contained" disabled={!isValid} onClick={handleSave}>
          {isEditing ? 'Save Changes' : 'Create Food'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
