import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    first_name: '',
    last_name: '',
  });

  const isAdmin =
    currentUser?.role_code === 'admin' || currentUser?.is_superuser;

  useEffect(() => {
    if (currentUser && !isAdmin) {
      navigate('/dashboard');
    }
  }, [currentUser, isAdmin, navigate]);

  const load = async () => {
    try {
      const [uRes, rRes] = await Promise.all([api.get('/users/'), api.get('/roles/')]);
      setUsers(uRes.data.results || uRes.data);
      setRoles(rRes.data.results || rRes.data);
    } catch {
      showNotification('Нет доступа или ошибка загрузки', 'error');
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.role) {
      showNotification('Укажите логин, пароль и роль', 'warning');
      return;
    }
    try {
      await api.post('/users/', {
        username: form.username,
        email: form.email || '',
        password: form.password,
        role: form.role,
        first_name: form.first_name || '',
        last_name: form.last_name || '',
        is_active: true,
        is_staff: false,
      });
      showNotification('Пользователь создан', 'success');
      setOpen(false);
      setForm({
        username: '',
        email: '',
        password: '',
        role: '',
        first_name: '',
        last_name: '',
      });
      load();
    } catch (error) {
      const detail = error.response?.data
        ? JSON.stringify(error.response.data)
        : 'Ошибка создания';
      showNotification(detail, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      showNotification('Нельзя удалить себя', 'warning');
      return;
    }
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await api.delete(`/users/${id}/`);
      showNotification('Удалено', 'success');
      load();
    } catch {
      showNotification('Ошибка удаления', 'error');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Пользователи и роли</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Новый пользователь
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Логин</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email || '—'}</TableCell>
                <TableCell>{u.role_name || u.role_code || '—'}</TableCell>
                <TableCell>
                  {[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}
                </TableCell>
                <TableCell>{u.is_active ? 'Активен' : 'Отключён'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(u.id)}
                    disabled={u.id === currentUser?.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новый пользователь</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Логин"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                required
                label="Пароль (мин. 6 символов)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                label="Роль"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Фамилия"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleCreate} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
