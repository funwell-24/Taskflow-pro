import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Save, 
  Camera, 
  Shield,
  Bell,
  Palette,
  Globe,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    location: {
      city: user?.profile?.location?.city || '',
      country: user?.profile?.location?.country || ''
    }
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    notifications: {
      email: user?.preferences?.notifications?.email ?? true,
      push: user?.preferences?.notifications?.push ?? true,
      sms: user?.preferences?.notifications?.sms ?? false
    },
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'en',
    timezone: user?.preferences?.timezone || 'UTC'
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePreferencesChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPreferencesForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setPreferencesForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profileForm);
      // Form will be updated automatically via context
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await usersAPI.updatePreferences(preferencesForm);
      toast.success('Preferences updated successfully!');
      refreshUser(); // Refresh user data
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      // Clear password form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setAvatarLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      await usersAPI.uploadAvatar(formData);
      toast.success('Avatar updated successfully!');
      refreshUser(); // Refresh user data
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-semibold">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full cursor-pointer hover:bg-primary-700"
                >
                  <Camera size={14} />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarLoading}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold">Profile Picture</h3>
                <p className="text-sm text-gray-600">
                  {avatarLoading ? 'Uploading...' : 'Click the camera icon to update your photo'}
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <User size={16} className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="form-input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <Mail size={16} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="form-input"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  className="form-textarea"
                  placeholder="Tell us a bit about yourself..."
                  rows="3"
                />
                <div className="text-sm text-gray-500 text-right">
                  {profileForm.bio.length}/500
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="form-input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={profileForm.location.city}
                    onChange={(e) => handleProfileChange('location.city', e.target.value)}
                    className="form-input"
                    placeholder="Your city"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <LoadingSpinner size="sm" variant="white" />
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 'preferences':
        return (
          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            {/* Notifications */}
            <div className="card">
              <div className="card-header">
                <h3 className="flex items-center gap-2">
                  <Bell size={20} />
                  Notifications
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Email Notifications</label>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.notifications.email}
                      onChange={(e) => handlePreferencesChange('notifications.email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Push Notifications</label>
                    <p className="text-sm text-gray-600">Browser push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.notifications.push}
                      onChange={(e) => handlePreferencesChange('notifications.push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">SMS Notifications</label>
                    <p className="text-sm text-gray-600">Text message alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferencesForm.notifications.sms}
                      onChange={(e) => handlePreferencesChange('notifications.sms', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="card">
              <div className="card-header">
                <h3 className="flex items-center gap-2">
                  <Palette size={20} />
                  Appearance
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label htmlFor="theme" className="form-label">
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={preferencesForm.theme}
                    onChange={(e) => handlePreferencesChange('theme', e.target.value)}
                    className="form-select"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="language" className="form-label">
                    <Globe size={16} className="inline mr-2" />
                    Language
                  </label>
                  <select
                    id="language"
                    value={preferencesForm.language}
                    onChange={(e) => handlePreferencesChange('language', e.target.value)}
                    className="form-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="timezone" className="form-label">
                    <Clock size={16} className="inline mr-2" />
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={preferencesForm.timezone}
                    onChange={(e) => handlePreferencesChange('timezone', e.target.value)}
                    className="form-select"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" variant="white" />
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 'security':
        return (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="flex items-center gap-2">
                  <Shield size={20} />
                  Change Password
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="form-input"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="form-input"
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="form-input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" variant="white" />
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="main-content">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-50 text-primary-600 border border-primary-200'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-lg shadow-sm border p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Account Info</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Member since:</span>{' '}
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>{' '}
                    <span className="capitalize">{user?.role}</span>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user?.isVerified 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-warning-100 text-warning-800'
                    }`}>
                      {user?.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;