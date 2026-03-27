import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import api from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.password_confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const d = err.response?.data;
      setError(
        typeof d === 'object' ? JSON.stringify(d) : d || 'Ошибка регистрации',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <InventoryIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            Регистрация
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" paragraph>
            Будет создана учётная запись с ролью «Пользователь».
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Логин"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Имя"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Фамилия"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Пароль (мин. 6 символов)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Повтор пароля"
              type="password"
              value={formData.password_confirm}
              onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Уже есть аккаунт?{' '}
            <Link component={RouterLink} to="/login">
              Войти
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
