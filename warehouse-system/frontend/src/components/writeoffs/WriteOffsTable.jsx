import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const WriteOffsTable = () => {
  const [writeoffs, setWriteoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showNotification } = useNotification();

  const fetchWriteOffs = async () => {
    try {
      const response = await api.get('/writeoffs/');
      setWriteoffs(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки списаний', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWriteOffs();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/writeoffs/${id}/approve/`);
      showNotification('Списание утверждено', 'success');
      fetchWriteOffs();
    } catch (error) {
      showNotification('Ошибка при утверждении', 'error');
    }
  };

  const getStatusChip = (status) => {
    switch(status?.code) {
      case 'pending':
        return <Chip label="Ожидает" color="warning" size="small" />;
      case 'approved':
        return <Chip label="Утверждено" color="success" size="small" />;
      case 'rejected':
        return <Chip label="Отклонено" color="error" size="small" />;
      default:
        return <Chip label={status?.name || 'Неизвестно'} size="small" />;
    }
  };

  const filtered = writeoffs.filter(w =>
    w.document_number?.toLowerCase().includes(search.toLowerCase()) ||
    w.product_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Списания</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchWriteOffs}
            sx={{ mr: 2 }}
          >
            Обновить
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/writeoffs/new"
          >
            Новое списание
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск по номеру или товару..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Товар</TableCell>
              <TableCell>Партия</TableCell>
              <TableCell align="right">Кол-во</TableCell>
              <TableCell>Причина</TableCell>
              <TableCell>Создал</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="500">
                    {w.document_number}
                  </Typography>
                </TableCell>
                <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{w.product_name}</TableCell>
                <TableCell>{w.batch_number}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="600">{w.quantity}</Typography>
                </TableCell>
                <TableCell>{w.reason}</TableCell>
                <TableCell>{w.created_by_name}</TableCell>
                <TableCell>{getStatusChip(w.status)}</TableCell>
                <TableCell>
                  <IconButton size="small" href={`/writeoffs/${w.id}`}>
                    <VisibilityIcon />
                  </IconButton>
                  {w.status?.code === 'pending' && (
                    <>
                      <IconButton size="small" color="success" onClick={() => handleApprove(w.id)}>
                        <ApproveIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <RejectIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WriteOffsTable;