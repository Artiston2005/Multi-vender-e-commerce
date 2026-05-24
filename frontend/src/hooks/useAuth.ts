import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, initialize } = useAuthStore();
  
  return {
    user,
    token,
    isAuthenticated,
    isVendor: user?.role === 'VENDOR',
    isAdmin: user?.role === 'ADMIN',
    isCustomer: user?.role === 'CUSTOMER',
    login,
    logout,
    initialize
  };
};
