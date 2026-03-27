/**
 * Домашняя страница по роли (после входа и для меню «Главная»).
 */
export function getHomePath(roleCode, isSuperuser) {
  if (isSuperuser) return '/admin/home';
  switch (roleCode) {
    case 'admin':
      return '/admin/home';
    case 'manager':
      return '/manager/home';
    case 'user':
      return '/user/home';
    default:
      return '/user/home';
  }
}
