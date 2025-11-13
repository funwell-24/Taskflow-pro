import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

/**
 * Custom hook to use authentication context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Manages user authentication state and provides auth methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Check if user is authenticated on app startup
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Verify token and get user data
        const response = await authAPI.getMe();
        setUser(response.data.data.user);
      }
    } catch (error) {
      // Token is invalid or expired
      console.error('Auth initialization error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Result object with success status and message
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      const { token, user: userData } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in state
      setUser(userData);
      
      toast.success('Welcome back! Login successful.');
      
      return { 
        success: true, 
        message: 'Login successful',
        user: userData 
      };
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Login failed. Please try again.';
      
      toast.error(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage,
        error: error.response?.data 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Object} Result object with success status and message
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      const { token, user: newUser } = response.data.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set user in state
      setUser(newUser);
      
      toast.success('Account created successfully! Welcome to TaskFlow Pro.');
      
      return { 
        success: true, 
        message: 'Registration successful',
        user: newUser 
      };
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Registration failed. Please try again.';
      
      toast.error(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage,
        error: error.response?.data 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   * Clears authentication state and localStorage
   */
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      
      // Clear user state
      setUser(null);
      
      toast.success('You have been logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout. Please try again.');
    }
  };

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Object} Result object with success status
   */
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      
      const { user: updatedUser } = response.data.data;
      
      // Update user in state
      setUser(updatedUser);
      
      toast.success('Profile updated successfully!');
      
      return { 
        success: true, 
        message: 'Profile updated successfully',
        user: updatedUser 
      };
    } catch (error) {
      console.error('Profile update error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to update profile. Please try again.';
      
      toast.error(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Object} Result object with success status
   */
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      await authAPI.changePassword(passwordData);
      
      toast.success('Password changed successfully!');
      
      return { 
        success: true, 
        message: 'Password changed successfully' 
      };
    } catch (error) {
      console.error('Password change error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          'Failed to change password. Please try again.';
      
      toast.error(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user data from server
   * Useful when you need to sync user data after external changes
   */
  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data.user);
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, log user out
      logout();
    }
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Array of roles to check
   * @returns {boolean} True if user has any of the roles
   */
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  /**
   * Check if user is admin
   * @returns {boolean} True if user is admin
   */
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  /**
   * Check if user is manager or admin
   * @returns {boolean} True if user is manager or admin
   */
  const isManagerOrAdmin = () => {
    return user?.role === 'admin' || user?.role === 'manager';
  };

  /**
   * Get user permissions based on role
   * @returns {Object} Permissions object
   */
  const getPermissions = () => {
    const basePermissions = {
      canCreateTasks: true,
      canEditOwnTasks: true,
      canDeleteOwnTasks: true,
      canViewTasks: true,
    };

    const rolePermissions = {
      user: {
        ...basePermissions,
        canManageUsers: false,
        canViewAllTasks: false,
        canAssignTasks: false,
      },
      manager: {
        ...basePermissions,
        canManageUsers: false,
        canViewAllTasks: true,
        canAssignTasks: true,
      },
      admin: {
        ...basePermissions,
        canManageUsers: true,
        canViewAllTasks: true,
        canAssignTasks: true,
        canDeleteAnyTask: true,
        canEditAnyTask: true,
      },
    };

    return rolePermissions[user?.role] || rolePermissions.user;
  };

  /**
   * Check if user can perform specific action
   * @param {string} action - Action to check
   * @param {Object} resource - Resource to check against (optional)
   * @returns {boolean} True if user can perform the action
   */
  const can = (action, resource = null) => {
    const permissions = getPermissions();
    
    // Check basic permission
    if (!permissions[action]) {
      return false;
    }

    // Additional resource-based checks can be added here
    if (resource && resource.createdBy && action.includes('Own')) {
      return resource.createdBy === user?.id;
    }

    return true;
  };

  /**
   * Get authentication token from localStorage
   * @returns {string|null} JWT token or null
   */
  const getToken = () => {
    return localStorage.getItem('token');
  };

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user;
  };

  /**
   * Clear authentication state (for testing or error recovery)
   */
  const clearAuth = () => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  };

  // Context value
  const value = {
    // State
    user,
    loading,
    isInitialized,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    
    // Role and Permission checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isManagerOrAdmin,
    getPermissions,
    can,
    
    // Utility functions
    getToken,
    isAuthenticated,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;