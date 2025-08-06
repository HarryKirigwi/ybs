import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Users, 
  Bell, 
  Globe, 
  Database,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSettingsData, useDataUtils, useConstants } from '../hooks';

/**
 * Admin Settings Component
 * Comprehensive settings management for the admin dashboard
 */
const AdminSettings = () => {
  const { data: settingsData, loading, error, refresh } = useSettingsData();
  const utils = useDataUtils();
  const constants = useConstants();

  const [settings, setSettings] = useState({
    general: {
      siteName: 'XIST LMS',
      siteDescription: 'Learning Management System',
      siteUrl: 'https://xist-lms.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false
    },
    security: {
      passwordMinLength: 8,
      requireTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      enableCaptcha: true,
      forcePasswordChange: false
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'noreply@xist-lms.com',
      smtpPassword: '',
      fromEmail: 'noreply@xist-lms.com',
      fromName: 'XIST LMS',
      enableEmailNotifications: true
    },
    notifications: {
      newUserRegistration: true,
      courseSubmission: true,
      paymentReceived: true,
      systemAlerts: true,
      emailDigest: false,
      pushNotifications: true
    },
    userManagement: {
      allowRegistration: true,
      requireEmailVerification: true,
      autoApproveInstructors: false,
      maxFileUploadSize: 10,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png', 'mp4'],
      userRoles: ['student', 'instructor', 'admin']
    },
    appearance: {
      primaryColor: '#174865',
      secondaryColor: '#3B82F6',
      logoUrl: '/logo.png',
      faviconUrl: '/favicon.ico',
      enableDarkMode: false,
      customCSS: ''
    },
    adminProfile: {
      personalInfo: {
        firstName: 'Harry',
        lastName: 'King',
        email: 'admin@xist.com',
        phone: '+1234567890',
        bio: 'System Administrator',
        avatar: '/admin-avatar.jpg'
      },
      security: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: false,
        lastPasswordChange: '2024-01-15',
        loginHistory: [
          { date: '2024-01-20 10:30:00', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome on Windows' },
          { date: '2024-01-19 14:15:00', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome on Windows' },
          { date: '2024-01-18 09:45:00', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome on Windows' }
        ]
      },
      preferences: {
        dashboardLayout: 'default',
        defaultLanguage: 'en',
        timezone: 'America/New_York',
        emailNotifications: true,
        pushNotifications: true,
        theme: 'light',
        compactMode: false,
        autoLogout: 30
      }
    }
  });

  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Settings sections
  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'userManagement', label: 'User Management', icon: Users },
    { id: 'appearance', label: 'Appearance', icon: Globe },
    { id: 'adminProfile', label: 'Admin Profile', icon: Users }
  ];

  // Load settings from data service
  useEffect(() => {
    if (settingsData && !loading) {
      // Merge data service settings with local state
      setSettings(prevSettings => ({
        ...prevSettings,
        general: {
          ...prevSettings.general,
          ...settingsData.admin
        },
        security: {
          ...prevSettings.security,
          ...settingsData.system
        },
        notifications: {
          ...prevSettings.notifications,
          ...settingsData.notifications
        }
      }));
    }
  }, [settingsData, loading]);

  // Save settings to API
  const saveSettings = async () => {
    setSaving(true);
    try {
      // In production, this would call the API service
      // await apiService.settings.updateSettings(settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      // console.log('Settings saved:', settings);
    } catch (error) {
      // console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to defaults
  const resetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      setSaving(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Reset to default values from data service
        if (settingsData) {
          setSettings({
            general: {
              siteName: settingsData.admin?.siteName || 'XIST LMS',
              siteDescription: settingsData.admin?.siteDescription || 'Learning Management System',
              siteUrl: 'https://xist-lms.com',
              timezone: settingsData.admin?.timezone || 'UTC',
              language: 'en',
              maintenanceMode: false
            },
            security: {
              passwordMinLength: settingsData.system?.passwordMinLength || 8,
              requireTwoFactor: settingsData.system?.enableTwoFactor || false,
              sessionTimeout: settingsData.system?.sessionTimeout || 30,
              maxLoginAttempts: settingsData.system?.maxLoginAttempts || 5,
              enableCaptcha: true,
              forcePasswordChange: false
            },
            email: {
              smtpHost: 'smtp.gmail.com',
              smtpPort: 587,
              smtpUsername: 'noreply@xist-lms.com',
              smtpPassword: '',
              fromEmail: 'noreply@xist-lms.com',
              fromName: 'XIST LMS',
              enableEmailNotifications: settingsData.system?.enableEmailNotifications || true
            },
            notifications: {
              newUserRegistration: true,
              courseSubmission: true,
              paymentReceived: true,
              systemAlerts: settingsData.notifications?.email?.systemAlerts || true,
              emailDigest: false,
              pushNotifications: settingsData.notifications?.push?.systemAlerts || true
            },
            userManagement: {
              allowRegistration: true,
              requireEmailVerification: true,
              autoApproveInstructors: false,
              maxFileUploadSize: settingsData.system?.maxFileSize || 10,
              allowedFileTypes: settingsData.system?.allowedFileTypes || ['pdf', 'doc', 'docx', 'jpg', 'png', 'mp4'],
              userRoles: ['student', 'instructor', 'admin']
            },
            appearance: {
              primaryColor: '#174865',
              secondaryColor: '#3B82F6',
              logoUrl: '/logo.png',
              faviconUrl: '/favicon.ico',
              enableDarkMode: false,
              customCSS: ''
            },
            adminProfile: {
              personalInfo: {
                firstName: 'Harry',
                lastName: 'King',
                email: 'admin@xist.com',
                phone: '+1234567890',
                bio: 'System Administrator',
                avatar: '/admin-avatar.jpg'
              },
              security: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
                twoFactorEnabled: false,
                lastPasswordChange: '2024-01-15',
                loginHistory: [
                  { date: '2024-01-20 10:30:00', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome on Windows' },
                  { date: '2024-01-19 14:15:00', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome on Windows' },
                  { date: '2024-01-18 09:45:00', ip: '192.168.1.100', location: 'New York, US', device: 'Chrome on Windows' }
                ]
              },
              preferences: {
                dashboardLayout: 'default',
                defaultLanguage: 'en',
                timezone: 'America/New_York',
                emailNotifications: true,
                pushNotifications: true,
                theme: 'light',
                compactMode: false,
                autoLogout: 30
              }
            }
          });
        }
      } catch (error) {
        // console.error('Failed to reset settings:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  // Update setting value
  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Test email configuration
  const testEmailConfig = async () => {
    try {
      // Simulate email test
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Test email sent successfully!');
    } catch (error) {
      alert('Failed to send test email. Please check your configuration.');
    }
  };

  // Change admin password
  const changeAdminPassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = settings.adminProfile.security;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    
    if (newPassword.length < constants.VALIDATION.PASSWORD_MIN_LENGTH) {
      alert(`New password must be at least ${constants.VALIDATION.PASSWORD_MIN_LENGTH} characters long`);
      return;
    }
    
    // Validate password using utility function
    const passwordValidation = utils.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      alert('Password does not meet security requirements');
      return;
    }
    
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Password changed successfully!');
      
      // Clear password fields
      updateSetting('adminProfile', 'security', {
        ...settings.adminProfile.security,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert('Failed to change password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Update admin profile
  const updateAdminProfile = async () => {
    try {
      setSaving(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">Error loading settings</p>
            <p className="text-sm text-red-600">{error.message}</p>
            <button 
              onClick={refresh}
              className="mt-2 inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm text-red-700 hover:bg-red-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
          <input
            type="url"
            value={settings.general.siteUrl}
            onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.general.language}
            onChange={(e) => updateSetting('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.general.maintenanceMode}
          onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
          Enable Maintenance Mode
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
          <input
            type="number"
            min="6"
            max="20"
            value={settings.security.passwordMinLength}
            onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            min="5"
            max="480"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireTwoFactor"
            checked={settings.security.requireTwoFactor}
            onChange={(e) => updateSetting('security', 'requireTwoFactor', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="requireTwoFactor" className="ml-2 block text-sm text-gray-900">
            Require Two-Factor Authentication
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableCaptcha"
            checked={settings.security.enableCaptcha}
            onChange={(e) => updateSetting('security', 'enableCaptcha', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enableCaptcha" className="ml-2 block text-sm text-gray-900">
            Enable CAPTCHA on Login
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="forcePasswordChange"
            checked={settings.security.forcePasswordChange}
            onChange={(e) => updateSetting('security', 'forcePasswordChange', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="forcePasswordChange" className="ml-2 block text-sm text-gray-900">
            Force Password Change on Next Login
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
          <input
            type="text"
            value={settings.email.smtpHost}
            onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
          <input
            type="number"
            value={settings.email.smtpPort}
            onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
          <input
            type="text"
            value={settings.email.smtpUsername}
            onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={settings.email.smtpPassword}
              onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
          <input
            type="email"
            value={settings.email.fromEmail}
            onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
          <input
            type="text"
            value={settings.email.fromName}
            onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableEmailNotifications"
          checked={settings.email.enableEmailNotifications}
          onChange={(e) => updateSetting('email', 'enableEmailNotifications', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enableEmailNotifications" className="ml-2 block text-sm text-gray-900">
          Enable Email Notifications
        </label>
      </div>
      <div>
        <button
          onClick={testEmailConfig}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Mail className="w-4 h-4 mr-2" />
          Test Email Configuration
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="newUserRegistration"
            checked={settings.notifications.newUserRegistration}
            onChange={(e) => updateSetting('notifications', 'newUserRegistration', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="newUserRegistration" className="ml-2 block text-sm text-gray-900">
            New User Registration
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="courseSubmission"
            checked={settings.notifications.courseSubmission}
            onChange={(e) => updateSetting('notifications', 'courseSubmission', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="courseSubmission" className="ml-2 block text-sm text-gray-900">
            Course Submission
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="paymentReceived"
            checked={settings.notifications.paymentReceived}
            onChange={(e) => updateSetting('notifications', 'paymentReceived', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="paymentReceived" className="ml-2 block text-sm text-gray-900">
            Payment Received
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="systemAlerts"
            checked={settings.notifications.systemAlerts}
            onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-900">
            System Alerts
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailDigest"
            checked={settings.notifications.emailDigest}
            onChange={(e) => updateSetting('notifications', 'emailDigest', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="emailDigest" className="ml-2 block text-sm text-gray-900">
            Email Digest (Daily Summary)
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pushNotifications"
            checked={settings.notifications.pushNotifications}
            onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
            Push Notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderUserManagementSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max File Upload Size (MB)</label>
          <input
            type="number"
            min="1"
            max="100"
            value={settings.userManagement.maxFileUploadSize}
            onChange={(e) => updateSetting('userManagement', 'maxFileUploadSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
        <input
          type="text"
          value={settings.userManagement.allowedFileTypes.join(', ')}
          onChange={(e) => updateSetting('userManagement', 'allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
          placeholder="pdf, doc, docx, jpg, png, mp4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">Separate file types with commas</p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="allowRegistration"
            checked={settings.userManagement.allowRegistration}
            onChange={(e) => updateSetting('userManagement', 'allowRegistration', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="allowRegistration" className="ml-2 block text-sm text-gray-900">
            Allow User Registration
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireEmailVerification"
            checked={settings.userManagement.requireEmailVerification}
            onChange={(e) => updateSetting('userManagement', 'requireEmailVerification', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
            Require Email Verification
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoApproveInstructors"
            checked={settings.userManagement.autoApproveInstructors}
            onChange={(e) => updateSetting('userManagement', 'autoApproveInstructors', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoApproveInstructors" className="ml-2 block text-sm text-gray-900">
            Auto-approve Instructor Applications
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.appearance.primaryColor}
              onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={settings.appearance.primaryColor}
              onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={settings.appearance.secondaryColor}
              onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={settings.appearance.secondaryColor}
              onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
          <input
            type="url"
            value={settings.appearance.logoUrl}
            onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
          <input
            type="url"
            value={settings.appearance.faviconUrl}
            onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableDarkMode"
          checked={settings.appearance.enableDarkMode}
          onChange={(e) => updateSetting('appearance', 'enableDarkMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="enableDarkMode" className="ml-2 block text-sm text-gray-900">
          Enable Dark Mode
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
        <textarea
          value={settings.appearance.customCSS}
          onChange={(e) => updateSetting('appearance', 'customCSS', e.target.value)}
          rows={6}
          placeholder="/* Add your custom CSS here */"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderAdminProfileSettings = () => (
    <div className="space-y-8">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={settings.adminProfile.personalInfo.firstName}
                onChange={(e) => updateSetting('adminProfile', 'personalInfo', {
                  ...settings.adminProfile.personalInfo,
                  firstName: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={settings.adminProfile.personalInfo.lastName}
                onChange={(e) => updateSetting('adminProfile', 'personalInfo', {
                  ...settings.adminProfile.personalInfo,
                  lastName: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={settings.adminProfile.personalInfo.email}
                onChange={(e) => updateSetting('adminProfile', 'personalInfo', {
                  ...settings.adminProfile.personalInfo,
                  email: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings.adminProfile.personalInfo.phone}
                onChange={(e) => updateSetting('adminProfile', 'personalInfo', {
                  ...settings.adminProfile.personalInfo,
                  phone: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              value={settings.adminProfile.personalInfo.bio}
              onChange={(e) => updateSetting('adminProfile', 'personalInfo', {
                ...settings.adminProfile.personalInfo,
                bio: e.target.value
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-6">
            <button
              onClick={updateAdminProfile}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={settings.adminProfile.security.currentPassword}
                  onChange={(e) => updateSetting('adminProfile', 'security', {
                    ...settings.adminProfile.security,
                    currentPassword: e.target.value
                  })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={settings.adminProfile.security.newPassword}
                    onChange={(e) => updateSetting('adminProfile', 'security', {
                      ...settings.adminProfile.security,
                      newPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={settings.adminProfile.security.confirmPassword}
                    onChange={(e) => updateSetting('adminProfile', 'security', {
                      ...settings.adminProfile.security,
                      confirmPassword: e.target.value
                    })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                checked={settings.adminProfile.security.twoFactorEnabled}
                onChange={(e) => updateSetting('adminProfile', 'security', {
                  ...settings.adminProfile.security,
                  twoFactorEnabled: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="twoFactorEnabled" className="ml-2 block text-sm text-gray-900">
                Enable Two-Factor Authentication
              </label>
            </div>
            <div>
              <button
                onClick={changeAdminPassword}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Login History</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-4">
            {settings.adminProfile.security.loginHistory.map((login, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{login.device}</p>
                    <p className="text-xs text-gray-500">{login.location} • {login.ip}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{new Date(login.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{new Date(login.date).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
              <select
                value={settings.adminProfile.preferences.dashboardLayout}
                onChange={(e) => updateSetting('adminProfile', 'preferences', {
                  ...settings.adminProfile.preferences,
                  dashboardLayout: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="compact">Compact</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={settings.adminProfile.preferences.theme}
                onChange={(e) => updateSetting('adminProfile', 'preferences', {
                  ...settings.adminProfile.preferences,
                  theme: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto Logout (minutes)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings.adminProfile.preferences.autoLogout}
                onChange={(e) => updateSetting('adminProfile', 'preferences', {
                  ...settings.adminProfile.preferences,
                  autoLogout: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-4 mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.adminProfile.preferences.emailNotifications}
                onChange={(e) => updateSetting('adminProfile', 'preferences', {
                  ...settings.adminProfile.preferences,
                  emailNotifications: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                Email Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pushNotifications"
                checked={settings.adminProfile.preferences.pushNotifications}
                onChange={(e) => updateSetting('adminProfile', 'preferences', {
                  ...settings.adminProfile.preferences,
                  pushNotifications: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                Push Notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="compactMode"
                checked={settings.adminProfile.preferences.compactMode}
                onChange={(e) => updateSetting('adminProfile', 'preferences', {
                  ...settings.adminProfile.preferences,
                  compactMode: e.target.checked
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="compactMode" className="ml-2 block text-sm text-gray-900">
                Compact Mode
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'email':
        return renderEmailSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'userManagement':
        return renderUserManagementSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'adminProfile':
        return renderAdminProfileSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="mt-1 text-sm text-gray-600">Configure platform settings and preferences</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={resetSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Settings saved successfully!</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 