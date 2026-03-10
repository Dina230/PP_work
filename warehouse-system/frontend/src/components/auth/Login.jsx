import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Inventory as InventoryIcon } from '@mui/icons-material';
import { login, clearError } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const testUsers = [
    { role: 'Администратор', username: 'admin', password: 'admin123' },
    { role: 'Менеджер', username: 'manager', password: 'manager123' },
    { role: 'Пользователь', username: 'user', password: 'user123' },
  ];

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <InventoryIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>

          <Typography component="h1" variant="h5" align="center" gutterBottom fontWeight="600">
            Складской учёт
          </Typography>

          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Войдите в систему для продолжения работы
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Имя пользователя"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              variant="outlined"
              size="medium"
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Войти'}
            </Button>
          </form>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
              Тестовые учётные данные:
            </Typography>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mt: 1,
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
            }}>
              {testUsers.map((user, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: '#e0e0e0',
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => setFormData({ username: user.username, password: user.password })}
                >
                  <Typography variant="body2" fontWeight="500">
                    {user.role}:
                  </Typography>
                  <Box>
                    <Typography variant="body2" component="span" sx={{ mr: 1, color: 'primary.main' }}>
                      {user.username}
                    </Typography>
                    <Typography variant="body2" component="span" color="textSecondary">
                      / {user.password}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;