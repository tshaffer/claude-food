import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableBody, TableRow,
         TableCell, Paper, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { selectSelectedUserId, selectDailyTotals, selectMealGroupsForDate,
         selectTotalsForDate } from '../store/selectors.js';
import { openModal } from '../store/uiSlice.js';
import { deleteLogEntry } from '../store/logEntriesSlice.js';
import { formatShortDate } from '@claude-food/shared';

type Preset = '7' | '30' | 'month';

export default function HistoryPage() {
  const dispatch       = useAppDispatch();
  const selectedUserId = useAppSelector(selectSelectedUserId);
  const dailyTotals    = useAppSelector(selectDailyTotals);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const mealGroups = useAppSelector(s => selectedDate ? selectMealGroupsForDate(s, selectedDate) : []);
  const dayTotals  = useAppSelector(s => selectedDate ? selectTotalsForDate(s, selectedDate) : null);

  if (!selectedUserId) {
    return <Box sx={{ p: 3 }}><Alert severity="info">Select a user to view history.</Alert></Box>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: '20px 28px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">History</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(['7', '30', 'month'] as Preset[]).map(p => (
            <Button key={p} size="small" variant="outlined">
              {p === '7' ? 'Last 7 Days' : p === '30' ? 'Last 30 Days' : 'This Month'}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', px: '28px', pb: '20px', gap: 2 }}>
        {/* Left: daily totals */}
        <Paper variant="outlined" sx={{ width: 380, flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Calories</TableCell>
                <TableCell align="right">Protein</TableCell>
                <TableCell align="right">Fiber</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dailyTotals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                    No history yet.
                  </TableCell>
                </TableRow>
              )}
              {dailyTotals.map(row => (
                <TableRow key={row.date} hover selected={row.date === selectedDate}
                  onClick={() => setSelectedDate(row.date)}
                  sx={{ cursor: 'pointer',
                        '&.Mui-selected': { bgcolor: '#EFF6FF' },
                        '&.Mui-selected td': { color: 'primary.main', fontWeight: 600 } }}>
                  <TableCell>{formatShortDate(row.date)}</TableCell>
                  <TableCell align="right">{Math.round(row.calories).toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {Math.round(row.protein * 10) / 10}g
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>
                    {Math.round(row.fiber * 10) / 10}g
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Right: day detail */}
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {!selectedDate ? (
            <Alert severity="info">Select a day to view details.</Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                         pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="h2">{formatShortDate(selectedDate)}</Typography>
                  {dayTotals && (
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(dayTotals.calories).toLocaleString()} cal ·{' '}
                      {Math.round(dayTotals.protein * 10) / 10}g protein ·{' '}
                      {Math.round(dayTotals.fiber   * 10) / 10}g fiber
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained"
                    onClick={() => dispatch(openModal({ type: 'addLogEntry', initialDate: selectedDate }))}>
                    + Add Food
                  </Button>
                  <Button size="small" variant="outlined"
                    onClick={() => dispatch(openModal({ type: 'addFromTemplate', initialDate: selectedDate }))}>
                    ⊞ Add from Template
                  </Button>
                </Box>
              </Box>

              {mealGroups.map(group => (
                <Paper key={group.meal} variant="outlined" sx={{ overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                             px: 1.5, py: 0.75, bgcolor: '#F1F5F9',
                             borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{group.meal}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(group.calories)} cal · {Math.round(group.protein * 10) / 10}g protein · {Math.round(group.fiber * 10) / 10}g fiber
                      </Typography>
                    </Box>
                    <Button size="small" sx={{ fontSize: '0.6875rem', py: 0, minWidth: 0 }}
                      onClick={() => dispatch(openModal({ type: 'addLogEntry', initialDate: selectedDate, initialMeal: group.meal }))}>
                      + Add
                    </Button>
                  </Box>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Food</TableCell>
                        <TableCell sx={{ width: 110 }}>Amount</TableCell>
                        <TableCell align="right" sx={{ width: 68 }}>Cal</TableCell>
                        <TableCell align="right" sx={{ width: 80 }}>Protein</TableCell>
                        <TableCell align="right" sx={{ width: 68 }}>Fiber</TableCell>
                        <TableCell align="right" sx={{ width: 80 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.entries.map(e => (
                        <TableRow key={e.id} hover>
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
              ))}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
