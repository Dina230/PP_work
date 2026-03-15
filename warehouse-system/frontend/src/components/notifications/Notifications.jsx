import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  MarkEmailRead as ReadIcon,
  DoneAll as ReadAllIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const typeColor = {
  info: 'default',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

const Notifications = () => {
  const { showNotification } = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setItems(res.data.results || res.data);
    } catch {
      showNotification('Ошибка загрузки уведомлений', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/mark_as_read/`);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
    } catch {
      showNotification('Не удалось пометить как прочитанное', 'error');
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/');
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      showNotification('Не удалось пометить все как прочитанные', 'error');
    }
  };

  const unreadCount = items.filter((n) => !n.is_read).length;

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Уведомления</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label={`Непрочитанные: ${unreadCount}`}
            color={unreadCount ? 'warning' : 'default'}
          />
          <Button
            variant="outlined"
            startIcon={<ReadAllIcon />}
            onClick={handleMarkAll}
            disabled={!unreadCount}
          >
            Пометить все прочитанными
          </Button>
        </Box>
      </Box>

      <Paper>
        {items.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color="textSecondary">
              Уведомлений пока нет.
            </Typography>
          </Box>
        ) : (
          <List>
            {items.map((n) => (
              <ListItem
                key={n.id}
                divider
                sx={{ opacity: n.is_read ? 0.6 : 1 }}
              >
                <Box sx={{ mr: 2 }}>
                  <Chip
                    size="small"
                    label={n.type.toUpperCase()}
                    color={typeColor[n.type] || 'default'}
                  />
                </Box>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight={n.is_read ? 400 : 600}
                    >
                      {n.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2">{n.message}</Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {new Date(n.created_at).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                {!n.is_read && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <ReadIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;

