import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import { updateUser } from '../../store/slices/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { showNotification } = useNotification();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/me/', formData);
      showNotification('Профиль успешно обновлен', 'success');
      setEditMode(false);

      // Обновляем данные пользователя в Redux store
      dispatch(updateUser(response.data));
    } catch (error) {
      showNotification('Ошибка при обновлении профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roleCode = user?.role_code;

  const getRoleName = (code) => {
    const roles = {
      admin: 'Администратор',
      manager: 'Менеджер',
      user: 'Пользователь',
    };
    if (code && roles[code]) return roles[code];
    return user?.role_name || code || '—';
  };

  const getRoleColor = (code) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      user: 'info',
    };
    return colors[code] || 'default';
  };

  const getInitials = () => {
    if (!user) return 'U';
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user.username[0].toUpperCase();
  };

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Профиль пользователя
      </Typography>

      <Grid container spacing={3}>
        {/* Левая колонка - Аватар и основная информация */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {getInitials()}
                </Avatar>

                <Typography variant="h5" gutterBottom>
                  {user.first_name || user.last_name
                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                    : user.username}
                </Typography>

                <Chip
                  label={getRoleName(roleCode)}
                  color={getRoleColor(roleCode)}
                  sx={{ mb: 2 }}
                />

                <Divider sx={{ width: '100%', my: 2 }} />

                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Имя пользователя
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4, mb: 2 }}>
                    {user.username}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4, mb: 2 }}>
                    {user.email || '—'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BadgeIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Роль
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4, mb: 2 }}>
                    {getRoleName(roleCode)}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Телефон
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ ml: 4 }}>
                    {user.phone || '—'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Правая колонка - Форма редактирования */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Редактирование профиля
                </Typography>
                {!editMode && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Редактировать
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Имя"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!editMode || loading}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Фамилия"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!editMode || loading}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editMode || loading}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Телефон"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editMode || loading}
                      variant="outlined"
                      placeholder="+7 (999) 999-99-99"
                    />
                  </Grid>

                  {editMode && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEditMode(false);
                            // Сброс к исходным данным
                            setFormData({
                              first_name: user.first_name || '',
                              last_name: user.last_name || '',
                              email: user.email || '',
                              phone: user.phone || '',
                            });
                          }}
                          disabled={loading}
                        >
                          Отмена
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={loading}
                        >
                          {loading ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;