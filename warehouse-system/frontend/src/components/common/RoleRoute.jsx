import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getHomePath } from '../../utils/rolePaths';

/**
 * allowedRoles: массив кодов ролей, которым разрешён маршрут.
 * Суперпользователь считается администратором для маршрутов с 'admin'.
 */
const RoleRoute = ({ allowedRoles, children }) => {
  const user = useSelector((state) => state.auth.user);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!user) {
    return null;
  }

  const code = user.role_code || (user.is_superuser ? 'admin' : 'user');
  const isAdmin = user.is_superuser || user.role_code === 'admin';

  const allowed =
    allowedRoles.includes(code) ||
    (allowedRoles.includes('admin') && isAdmin);

  if (!allowed) {
    return <Navigate to={getHomePath(code, user.is_superuser)} replace />;
  }

  return children;
};

export default RoleRoute;
