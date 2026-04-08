import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set default header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 [Auth] Found existing token, fetching user profile...');
      }
      fetchProfile();
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔓 [Auth] No token found, user not authenticated');
      }
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 [Auth] Attempting login for: ${email}`);
      }
      const response = await api.post('/users/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ [Auth] Login successful for user: ${user.email}`);
        }
        return { success: true };
      }
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ [Auth] Login failed: ${response.data.message}`);
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [Auth] Login error:', err.response?.data?.message || err.message);
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (userData) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📝 [Auth] Attempting registration for: ${userData.email}`);
      }
      const response = await api.post('/users/register', userData);
      if (response.data.success) {
        const { token, user } = response.data;
        // localStorage.setItem('token', token);
        // api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // setUser(user);
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ [Auth] Registration successful for user: ${user.email}`);
        }
        return { success: true };
      }
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ [Auth] Registration failed: ${response.data.message}`);
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ [Auth] Registration error:', err.response?.data?.message || err.message);
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = async (onBeforeLogout) => {
    // If a pre-logout callback is provided (e.g. flushToServer), await it first
    // so cart/wishlist data is saved to the server before we clear user state.
    if (typeof onBeforeLogout === 'function') {
      try {
        await onBeforeLogout();
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[AuthContext] Pre-logout callback error:', err);
        }
      }
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('🚪 [Auth] User logging out');
    }

    // Call API logout endpoint
    const token = localStorage.getItem('token');
    try {
      await api.post('/users/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [Auth] API logout successful');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [Auth] API logout failed, proceeding with frontend cleanup:', err.message);
      }
    }

    // Clear frontend data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [Auth] Logout completed');
    }

    // Redirect to login
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
