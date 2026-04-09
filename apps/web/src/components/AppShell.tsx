import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Select, MenuItem,
         Drawer, List, ListItemButton, ListItemText, Button,
         Popover, TextField, Stack } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks.js';
import { selectUsers, selectSelectedUserId } from '../store/selectors.js';
import { setSelectedUser, openModal } from '../store/uiSlice.js';
import { fetchLogEntries } from '../store/logEntriesSlice.js';
import { fetchTemplates } from '../store/templatesSlice.js';
import { createUser } from '../store/usersSlice.js';

const DRAWER_WIDTH = 200;
const TOPBAR_HEIGHT = 48;

const NAV_ITEMS = [
  { label: 'Today',     path: '/today'     },
  { label: 'Log',       path: '/log'       },
  { label: 'Templates', path: '/templates' },
  { label: 'Foods',     path: '/foods'     },
  { label: 'History',   path: '/history'   },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const users = useAppSelector(selectUsers);
  const selectedUserId = useAppSelector(selectSelectedUserId);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');

  function handleUserChange(userId: string) {
    dispatch(setSelectedUser(userId));
    dispatch(fetchLogEntries({ userId }));
    dispatch(fetchTemplates(userId));
    localStorage.setItem('lastUserId', userId);
  }

  async function handleAddUser() {
    const name = newName.trim();
    if (!name) return;
    const result = await dispatch(createUser(name));
    if (createUser.fulfilled.match(result)) {
      handleUserChange(result.payload.id);
      setAnchorEl(null);
      setNewName('');
      setNameError('');
    } else {
      setNameError('Username already exists');
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Bar */}
      <AppBar position="fixed" elevation={0} sx={{
        height: TOPBAR_HEIGHT, zIndex: t => t.zIndex.drawer + 1,
        bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Toolbar variant="dense" sx={{ minHeight: TOPBAR_HEIGHT, gap: 2 }}>
          <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mr: 'auto' }}>
            Food Tracker
          </Typography>

          <Typography variant="body2" color="text.secondary">User:</Typography>
          <Select
            size="small"
            value={selectedUserId ?? ''}
            onChange={e => handleUserChange(e.target.value)}
            displayEmpty
            sx={{ minWidth: 120, fontSize: '0.75rem' }}
          >
            <MenuItem value="" disabled><em>Select user</em></MenuItem>
            {users.map(u => (
              <MenuItem key={u.id} value={u.id} sx={{ fontSize: '0.75rem' }}>{u.name}</MenuItem>
            ))}
          </Select>

          <Button size="small" variant="outlined"
            onClick={e => { setAnchorEl(e.currentTarget); setNewName(''); setNameError(''); }}>
            + New User
          </Button>

          <Popover open={Boolean(anchorEl)} anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
            <Stack sx={{ p: 2, gap: 1.5, minWidth: 220 }}>
              <Typography variant="body2" fontWeight={600}>New User</Typography>
              <TextField label="Username" size="small" value={newName} autoFocus
                error={!!nameError} helperText={nameError}
                onChange={e => { setNewName(e.target.value); setNameError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleAddUser(); }} />
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button size="small" onClick={() => setAnchorEl(null)}>Cancel</Button>
                <Button size="small" variant="contained" disabled={!newName.trim()}
                  onClick={handleAddUser}>Create</Button>
              </Stack>
            </Stack>
          </Popover>

          <Button
            variant="contained"
            size="small"
            onClick={() => dispatch(openModal({ type: 'addLogEntry' }))}
            disabled={!selectedUserId}
          >
            + Quick Add
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, mt: `${TOPBAR_HEIGHT}px` }}>
        {/* Sidebar */}
        <Drawer variant="permanent" sx={{
          width: DRAWER_WIDTH, flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH, mt: `${TOPBAR_HEIGHT}px`,
            bgcolor: '#1E293B', border: 'none', boxSizing: 'border-box',
          },
        }}>
          <List dense sx={{ pt: 2 }}>
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  selected={active}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 0, borderRadius: 0,
                    '&.Mui-selected': { bgcolor: 'primary.main' },
                    '&.Mui-selected:hover': { bgcolor: 'primary.dark' },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: {
                      sx: { fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
                            color: active ? '#fff' : '#94A3B8' }
                    }}}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Drawer>

        {/* Main content */}
        <Box component="main" sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
