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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { useNotification } from '../../hooks/useNotification';

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const { showNotification } = useNotification();

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data.results || response.data);
    } catch (error) {
      showNotification('Ошибка загрузки товаров', 'error');
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Удалить товар?')) {
      try {
        await api.delete(`/products/${id}/`);
        showNotification('Товар удален', 'success');
        fetchProducts();
      } catch (error) {
        showNotification('Ошибка при удалении', 'error');
      }
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Товары</Typography>
        <Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchProducts} sx={{ mr: 2 }}>
            Обновить
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} href="/products/new">
            Добавить
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon /> }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Артикул</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Ед. изм.</TableCell>
              <TableCell>Остаток</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.sku}</TableCell>
                <TableCell>{p.category_name}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell>
                  <Chip label={p.quantity || 0} color={p.quantity > 0 ? 'success' : 'error'} size="small" />
                </TableCell>
                <TableCell>
                  <IconButton href={`/products/${p.id}/edit`}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(p.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProductsTable;