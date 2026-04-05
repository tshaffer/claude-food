import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import AppShell from './components/AppShell.js';
import TodayPage from './pages/TodayPage.js';
import LogPage from './pages/LogPage.js';
import TemplatesPage from './pages/TemplatesPage.js';
import FoodsPage from './pages/FoodsPage.js';
import HistoryPage from './pages/HistoryPage.js';
import GlobalModalHost from './components/GlobalModalHost.js';
import { useAppDispatch } from './store/hooks.js';
import { fetchUsers } from './store/usersSlice.js';
import { fetchFoods } from './store/foodsSlice.js';

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchFoods());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppShell>
          <Routes>
            <Route path="/"          element={<Navigate to="/today" replace />} />
            <Route path="/today"     element={<TodayPage />} />
            <Route path="/log"       element={<LogPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/foods"     element={<FoodsPage />} />
            <Route path="/history"   element={<HistoryPage />} />
          </Routes>
        </AppShell>
        <GlobalModalHost />
      </Box>
    </BrowserRouter>
  );
}
