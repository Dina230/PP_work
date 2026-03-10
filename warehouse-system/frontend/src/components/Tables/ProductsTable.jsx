// frontend/src/components/Tables/ProductsTable.jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Box,
  Button
} from '@mui/material';
import { Search, Edit, Delete, Add } from '@mui/icons-material';
import { productService } from '../../services/productService';
import { useNotification } from '../../hooks/useNotification';

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, search, orderBy, order]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search,
        ordering: `${order === 'desc' ? '-' : ''}${orderBy}`
      };
      const response = await productService.getProducts(params);
      setProducts(response.data.results);
      setTotalCount(response.data.count);
    } catch (error) {
      showNotification('Ошибка при загрузке товаров', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить товар?')) {
      try {
        await productService.deleteProduct(id);
        showNotification('Товар успешно удален', 'success');
        fetchProducts();
      } catch (error) {
        showNotification('Ошибка при удалении товара', 'error');
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          variant="outlined"
          placeholder="Поиск товаров..."
          value={search}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          size="small"
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          color="primary"
          href="/products/new"
        >
          Добавить товар
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Название
                </TableSortLabel>
              </TableCell>
              <TableCell>Артикул</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Ед. изм.</TableCell>
              <TableCell>Мин. запас</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.category_name}</TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.min_stock}</TableCell>
                <TableCell>
                  <Chip
                    label={product.is_active ? 'Активен' : 'Неактивен'}
                    color={product.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" href={`/products/${product.id}/edit`}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(product.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Строк на странице"
      />
    </Box>
  );
};

export default ProductsTable;