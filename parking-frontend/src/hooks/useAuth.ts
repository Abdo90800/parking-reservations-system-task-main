import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { RootState } from '@/store';
import { loginSuccess, logout, restoreAuth } from '@/store/slices/authSlice';
import { api } from '@/lib/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login({ username, password });
      dispatch(loginSuccess(response));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout: handleLogout,
  };
};