import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useNotification } from '../../hooks/useNotification';
import authService from '../../services/authService';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const { showNotification } = useNotification();
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
      await authService.updateProfile(formData);
      showNotification('Профиль успешно обновлен', 'success');
      setEditMode(false);
    } catch (error) {
      showNotification('Ошибка при обновлении профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role) => {
    const roles = {
      admin: 'Администратор',
      manager: 'Менеджер',
      user: 'Пользователь',
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'warning',
      user: 'info',
    };
    return colors[role] || 'default';
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
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
              {editMode && (
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    minWidth: 'auto',
                    p: 1,
                    borderRadius: '50%',
                  }}
                >
                  <PhotoCameraIcon />
                  <input type="file" hidden accept="image/*" />
                </Button>
              )}
            </Box>

            <Typography variant="h5" gutterBottom>
              {user.username}
            </Typography>

            <Chip
              label={getRoleName(user.role)}
              color={getRoleColor(user.role)}
              sx={{ mb: 2 }}
            />

            <Divider sx={{ my: 2 }} />

            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" color="textSecondary">
                Дата регистрации
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(user.date_joined).toLocaleDateString('ru-RU')}
              </Typography>

              <Typography variant="body2" color="textSecondary">
                Последний вход
              </Typography>
              <Typography variant="body1" gutterBottom>
                {user.last_login ? new Date(user.last_login).toLocaleString('ru-RU') : 'Нет данных'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Правая колонка - Форма с данными */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Личные данные
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

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Имя"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!editMode || loading}
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
                        startIcon={<SaveIcon />}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Сохранить'}
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;