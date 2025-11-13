/**
 * Application-wide constants and configuration
 * Centralized location for all static values and configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  UPLOAD_TIMEOUT: 30000, // 30 seconds for file uploads
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'TaskFlow Pro',
  VERSION: '1.0.0',
  DESCRIPTION: 'Advanced Task Management System',
  SUPPORT_EMAIL: 'support@taskflowpro.com',
  COMPANY: 'TaskFlow Pro Inc.',
  COPYRIGHT_YEAR: new Date().getFullYear(),
};

// Task Status Constants
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ON_HOLD: 'on-hold',
  
  // Status display names
  DISPLAY_NAMES: {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'on-hold': 'On Hold',
  },

  // Status colors for UI
  COLORS: {
    'pending': 'warning',
    'in-progress': 'primary',
    'completed': 'success',
    'cancelled': 'gray',
    'on-hold': 'gray',
  },

  // Status icons
  ICONS: {
    'pending': 'Clock',
    'in-progress': 'PlayCircle',
    'completed': 'CheckCircle2',
    'cancelled': 'XCircle',
    'on-hold': 'PauseCircle',
  },

  // Status transitions - which statuses can transition to which
  TRANSITIONS: {
    'pending': ['in-progress', 'cancelled', 'on-hold'],
    'in-progress': ['completed', 'on-hold', 'pending'],
    'completed': ['in-progress', 'pending'],
    'cancelled': ['pending'],
    'on-hold': ['in-progress', 'pending', 'cancelled'],
  },
};

// Task Priority Constants
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  
  // Priority display names
  DISPLAY_NAMES: {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'urgent': 'Urgent',
  },

  // Priority colors for UI
  COLORS: {
    'low': 'success',
    'medium': 'primary',
    'high': 'warning',
    'urgent': 'error',
  },

  // Priority icons
  ICONS: {
    'low': 'ArrowDown',
    'medium': 'Minus',
    'high': 'ArrowUp',
    'urgent': 'AlertTriangle',
  },

  // Priority weights for sorting
  WEIGHTS: {
    'low': 1,
    'medium': 2,
    'high': 3,
    'urgent': 4,
  },
};

// User Roles and Permissions
export const USER_ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin',

  // Role display names
  DISPLAY_NAMES: {
    'user': 'User',
    'manager': 'Manager',
    'admin': 'Administrator',
  },

  // Role hierarchy
  HIERARCHY: {
    'user': 1,
    'manager': 2,
    'admin': 3,
  },

  // Default permissions for each role
  PERMISSIONS: {
    user: {
      canCreateTasks: true,
      canEditOwnTasks: true,
      canDeleteOwnTasks: true,
      canViewTasks: true,
      canManageUsers: false,
      canViewAllTasks: false,
      canAssignTasks: false,
      canDeleteAnyTask: false,
      canEditAnyTask: false,
      canManageSystem: false,
    },
    manager: {
      canCreateTasks: true,
      canEditOwnTasks: true,
      canDeleteOwnTasks: true,
      canViewTasks: true,
      canManageUsers: false,
      canViewAllTasks: true,
      canAssignTasks: true,
      canDeleteAnyTask: false,
      canEditAnyTask: false,
      canManageSystem: false,
    },
    admin: {
      canCreateTasks: true,
      canEditOwnTasks: true,
      canDeleteOwnTasks: true,
      canViewTasks: true,
      canManageUsers: true,
      canViewAllTasks: true,
      canAssignTasks: true,
      canDeleteAnyTask: true,
      canEditAnyTask: true,
      canManageSystem: true,
    },
  },
};

// Date and Time Constants
export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM dd, yyyy',
  DISPLAY_DATE_TIME: 'MMM dd, yyyy, hh:mm a',
  DISPLAY_TIME: 'hh:mm a',
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATE_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  RELATIVE: 'relative', // For relative time display
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt'],
  
  // File type categories
  CATEGORIES: {
    IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  },
};

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  TASK_TITLE_MAX_LENGTH: 100,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  BIO_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 20,
  COMMENT_MAX_LENGTH: 500,
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  LIMIT_OPTIONS: [6, 12, 24, 48],
  MAX_LIMIT: 100,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
  SIDEBAR_STATE: 'sidebar_state',
};

// Theme Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Language Constants
export const LANGUAGES = {
  EN: { code: 'en', name: 'English', nativeName: 'English' },
  ES: { code: 'es', name: 'Spanish', nativeName: 'Español' },
  FR: { code: 'fr', name: 'French', nativeName: 'Français' },
  DE: { code: 'de', name: 'German', nativeName: 'Deutsch' },
};

// Notification Constants
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  
  // Auth specific errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    USER_EXISTS: 'An account with this email already exists.',
    WEAK_PASSWORD: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  },
  
  // Task specific errors
  TASK: {
    NOT_FOUND: 'Task not found.',
    NO_PERMISSION: 'You do not have permission to modify this task.',
    INVALID_STATUS: 'Invalid task status.',
    DUPLICATE_TITLE: 'A task with this title already exists.',
  },
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth success messages
  AUTH: {
    LOGIN: 'Welcome back! Login successful.',
    REGISTER: 'Account created successfully! Welcome to TaskFlow Pro.',
    LOGOUT: 'You have been logged out successfully.',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PASSWORD_CHANGED: 'Password changed successfully!',
  },
  
  // Task success messages
  TASK: {
    CREATED: 'Task created successfully!',
    UPDATED: 'Task updated successfully!',
    DELETED: 'Task deleted successfully!',
    STATUS_CHANGED: 'Task status updated!',
  },
  
  // General success messages
  GENERAL: {
    SAVED: 'Changes saved successfully!',
    DELETED: 'Item deleted successfully!',
    UPLOADED: 'File uploaded successfully!',
  },
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_TEAM_COLLABORATION: true,
  ENABLE_TIME_TRACKING: true,
  ENABLE_FILE_ATTACHMENTS: true,
  ENABLE_ADVANCED_ANALYTICS: true,
  ENABLE_EMAIL_NOTIFICATIONS: false, // Set to true when email service is configured
  ENABLE_PUSH_NOTIFICATIONS: false, // Set to true when push service is configured
};

// Default User Preferences
export const DEFAULT_PREFERENCES = {
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  theme: THEMES.LIGHT,
  language: LANGUAGES.EN.code,
  timezone: 'UTC',
  emailDigest: 'daily',
  compactView: false,
  showCompletedTasks: true,
  autoArchive: false,
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  TASKS: {
    BASE: '/tasks',
    STATS: '/tasks/stats/overview',
    SEARCH: '/tasks/search',
    BULK_UPDATE: '/tasks/bulk-update',
    COMMENTS: '/tasks/:id/comments',
    TIME_LOGS: '/tasks/:id/time-logs',
    ATTACHMENTS: '/tasks/:id/attachments',
    ARCHIVE: '/tasks/:id/archive',
    UNARCHIVE: '/tasks/:id/unarchive',
    DUPLICATE: '/tasks/:id/duplicate',
  },
  USERS: {
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
    AVATAR: '/users/avatar',
    STATS: '/users/stats/personal',
    USER_TASKS: '/users/tasks',
    // Admin endpoints
    LIST: '/users',
    BY_ID: '/users/:id',
    ROLE: '/users/:id/role',
    DEACTIVATE: '/users/:id/deactivate',
    ACTIVATE: '/users/:id/activate',
  },
  HEALTH: '/health',
  DOCS: '/api/docs',
};

// Export all constants as a single object for easy importing
export default {
  API_CONFIG,
  APP_CONFIG,
  TASK_STATUS,
  TASK_PRIORITY,
  USER_ROLES,
  DATE_FORMATS,
  FILE_UPLOAD,
  VALIDATION,
  PAGINATION,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
  NOTIFICATION_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FEATURE_FLAGS,
  DEFAULT_PREFERENCES,
  API_ENDPOINTS,
};