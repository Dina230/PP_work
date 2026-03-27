import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { login } from '../../store/slices/authSlice';
import { getHomePath } from '../../utils/rolePaths';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (!result.error) {
      const u = result.payload?.user;
      navigate(getHomePath(u?.role_code, u?.is_superuser));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <InventoryIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            Складской учёт
          </Typography>

          {location.state?.registered && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Регистрация успешна. Войдите под новым логином.
            </Alert>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              disabled={loading}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              disabled={loading}
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Нет аккаунта?{' '}
            <Link component={RouterLink} to="/register">
              Регистрация
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;