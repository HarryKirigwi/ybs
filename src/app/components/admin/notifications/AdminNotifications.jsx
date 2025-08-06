import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Filter,
  Search,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  User,
  BookOpen,
  Shield,
  Settings
} from 'lucide-react';

// Import centralized hooks
import { useNotifications } from '../contexts/NotificationsContext';

/**
 * Admin Notifications Component
 * Comprehensive notification management for LMS administrators
 * Updated to use centralized services
 */
const AdminNotifications = () => {

  
  // Use centralized notifications data and operations
  const { 
    notifications, 
    loading, 
    error, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    fetchNotifications,
    refreshNotifications,
    startAutoUpdate,
    stopAutoUpdate 
  } = useNotifications();

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Extract notifications from centralized data
  const notificationsList = notifications || [];

  // Filter notifications based on search and filter
  const filteredNotifications = notificationsList.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || notification.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // setSuccess('Notification marked as read');
      // setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // No need to refresh as the hook updates state immediately
    } catch (error) {
      // console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      // setSuccess('Notification deleted');
      // setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // Delete each selected notification
      for (const notificationId of selectedNotifications) {
        await deleteNotification(notificationId);
      }
      setSelectedNotifications([]);
      setIsSelectMode(false);
      // No need to refresh as the hook updates state immediately
    } catch (error) {
      // console.error('Failed to delete selected notifications:', error);
    }
  };

  const handleNotificationSelect = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleExportNotifications = async () => {
    try {
      const csvContent = [
        ['Type', 'Priority', 'Title', 'Message', 'Timestamp', 'Read'],
        ...filteredNotifications.map(notification => [
          notification.type,
          notification.priority,
          notification.title,
          notification.message,
          new Date(notification.timestamp).toLocaleString(),
          notification.read ? 'Yes' : 'No'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notifications-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // console.error('Failed to export notifications:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'system': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-purple-600 bg-purple-100';
      case 'course': return 'text-green-600 bg-green-100';
      case 'payment': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading notifications...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading notifications</h3>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
              <button 
                onClick={refreshNotifications}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600">Manage system notifications and alerts</p>
          <div className="flex items-center mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-gray-500">Auto-updating</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All as Read
          </button>
          <button
            onClick={handleExportNotifications}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="user">User</option>
              <option value="course">Course</option>
              <option value="payment">Payment</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSelectMode(!isSelectMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isSelectMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelectMode ? 'Cancel' : 'Select'}
            </button>
            {isSelectMode && selectedNotifications.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedNotifications.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {isSelectMode && (
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleNotificationSelect(notification.id)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    )}
                    <div className="flex-shrink-0">
                      {(() => {
                        const getIcon = (type) => {
                          switch (type) {
                            case 'system': return <Settings className="w-5 h-5" />;
                            case 'user': return <User className="w-5 h-5" />;
                            case 'course': return <BookOpen className="w-5 h-5" />;
                            case 'payment': return <Shield className="w-5 h-5" />;
                            default: return <Bell className="w-5 h-5" />;
                          }
                        };

                        const getColor = (type) => {
                          switch (type) {
                            case 'system': return 'text-blue-600 bg-blue-100';
                            case 'user': return 'text-purple-600 bg-purple-100';
                            case 'course': return 'text-green-600 bg-green-100';
                            case 'payment': return 'text-orange-600 bg-orange-100';
                            default: return 'text-gray-600 bg-gray-100';
                          }
                        };

                        return (
                          <div className={`p-2 rounded-lg ${getColor(notification.type)}`}>
                            {getIcon(notification.type)}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                        {notification.user && (
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {notification.user}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination or Load More */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">
            Showing {filteredNotifications.length} of {notificationsList.length} notifications
          </p>
          <button
            onClick={refreshNotifications}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications; 