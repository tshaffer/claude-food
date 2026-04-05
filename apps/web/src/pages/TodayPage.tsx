import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { selectSelectedUserId, selectTodayDate, selectMealGroupsForDate,
         selectTotalsForDate } from '../store/selectors.js';
import { openModal } from '../store/uiSlice.js';
import { formatDisplayDate } from '@claude-food/shared';
import NutritionSummaryCards from '../components/NutritionSummaryCards.js';
import MealSection from '../components/MealSection.js';

export default function TodayPage() {
  const dispatch = useAppDispatch();
  const selectedUserId = useAppSelector(selectSelectedUserId);
  const todayDate      = useAppSelector(selectTodayDate);
  const mealGroups     = useAppSelector(s => selectMealGroupsForDate(s, todayDate));
  const totals         = useAppSelector(s => selectTotalsForDate(s, todayDate));

  if (!selectedUserId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Select a user from the top bar to get started.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: '20px 28px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
          <Typography variant="h1">Today</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDisplayDate(todayDate)}
          </Typography>
        </Box>
      </Box>

      {/* Summary cards */}
      <NutritionSummaryCards
        calories={totals.calories}
        protein={totals.protein}
        fiber={totals.fiber}
      />

      {/* Action bar */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" size="small"
          onClick={() => dispatch(openModal({ type: 'addLogEntry', initialDate: todayDate }))}>
          + Add Food
        </Button>
        <Button variant="outlined" size="small"
          onClick={() => dispatch(openModal({ type: 'addFromTemplate', initialDate: todayDate }))}>
          ⊞ Add from Template
        </Button>
      </Box>

      {/* Meal sections */}
      {mealGroups.length === 0 ? (
        <Alert severity="info" sx={{ mt: 1 }}>
          No food logged today. Use the buttons above to get started.
        </Alert>
      ) : (
        mealGroups.map(group => (
          <MealSection
            key={group.meal}
            group={group}
            onAddToMeal={meal =>
              dispatch(openModal({ type: 'addLogEntry', initialDate: todayDate, initialMeal: meal }))
            }
          />
        ))
      )}
    </Box>
  );
}
