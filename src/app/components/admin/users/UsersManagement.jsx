import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  MoreHorizontal,
  X,
  Mail,
  Calendar,
  Clock,
  Shield,
  UserCheck,
  UserX,
  EyeOff,
  Phone,
  MapPin,
  Globe,
  Building,
  GraduationCap,
  Settings,
  Info,
  Lock,
  Crown,
  BookOpen,
  UserPlus,
  ChevronDown,
  Users,
  UserCog
} from 'lucide-react';
import { DataTable } from '../../shared/ui';

// Import custom hook
import { useUsersManagement } from '../hooks';

// Import reusable components
import {
  UserStats,
  UserCategories,
  UserFilters,
  UserHeader,
  BulkActions
} from './components';

// Import instructor approval component
import InstructorApproval from './components/InstructorApproval';

/**
 * Admin Users Management Component
 * Refactored to use reusable components and custom hooks
 */
const UsersManagement = () => {
  // Custom hook for all users management logic
  const {
    users,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedUsers,
    setSelectedUsers,
    loading,
    notification,
    setNotification,
    activeCategory,
    setActiveCategory,
    userLimit,
    setUserLimit,
    getInitials,
    getUserData,
    getAvatarColor,
    getStatusColor,
    getEnrollmentColor,
    getRoleColor,
    exportUsers,
    importUsers,
    handleImport,
    handleAddUser,
    handleBulkDelete,
    toggleUserSelection,
    toggleAllUsers,
    handleCategorySelect,
    filteredUsers,
    limitedUsers,
    getUserCounts,
    updateUser,
    deleteUser,
  } = useUsersManagement();

  // Modal states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);

  // Available limit options
  const limitOptions = [5, 10, 25, 50, 100];

  // Tab state
  const [activeTab, setActiveTab] = useState('users');

  // Tab configuration
  const tabs = [
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage all users in the system'
    },
    {
      id: 'instructor-approval',
      label: 'Instructor Approval',
      icon: UserCog,
      description: 'Review and approve instructor applications'
    }
  ];

  // Action menu handlers
  const toggleActionMenu = (userId, event) => {
    if (openActionMenu === userId) {
      setOpenActionMenu(null);
    } else {
      setOpenActionMenu(userId);
      const rect = event.currentTarget.getBoundingClientRect();
      setActionMenuPosition({
        x: rect.left,
        y: rect.bottom + window.scrollY
      });
    }
  };

  const handleUserAction = async (action, user) => {
    setOpenActionMenu(null);
    
    switch (action) {
      case 'view':
        handleViewUser(user);
        break;
      case 'edit':
        handleEditUser(user);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${getUserData(user, 'name', 'this user')}?`)) {
          await deleteUser(user.id);
        }
        break;
      default:
        break;
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  };

  const closeAddUserDialog = () => {
    setShowAddDialog(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditDialog(true);
  };

  const closeEditUserDialog = () => {
    setShowEditDialog(false);
    setEditingUser(null);
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
  };

  const handleSaveEditUser = async (formData) => {
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      enrollment: formData.enrollment,
      phone: formData.phone,
      department: formData.department,
      location: formData.location,
      bio: formData.bio,
      website: formData.website,
      company: formData.company
    };

    if (formData.password) {
      userData.password = formData.password;
    }

    await updateUser(editingUser.id, userData);
    closeEditUserDialog();
  };

  // Keyboard event handler
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeUserModal();
      closeEditUserDialog();
      setOpenActionMenu(null);
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (value, user) => (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(getUserData(user, 'name', ''))}`}>
            {getInitials(getUserData(user, 'name', ''))}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{getUserData(user, 'name', 'Unknown')}</div>
            <div className="text-sm text-gray-500">{getUserData(user, 'email', 'No email')}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'enrollment',
      label: 'Enrollment',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEnrollmentColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && (
        <>
          {/* Header */}
          <UserHeader 
            setShowAddDialog={setShowAddDialog}
            exportUsers={exportUsers}
            handleImport={handleImport}
          />

          {/* Stats */}
          <UserStats users={users} getUserData={getUserData} />

          {/* User Categories */}
          <UserCategories 
            activeCategory={activeCategory}
            getUserCounts={getUserCounts}
            handleCategorySelect={handleCategorySelect}
          />

          {/* Filters */}
          <UserFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filters={filters}
            setFilters={setFilters}
            activeCategory={activeCategory}
            handleCategorySelect={handleCategorySelect}
          />

          {/* Bulk Actions */}
          <BulkActions 
            selectedUsers={selectedUsers}
            handleBulkDelete={handleBulkDelete}
          />

          {/* Users Table */}
          <div className="bg-white shadow rounded-lg">
        {activeCategory !== 'all' && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  Showing {activeCategory === 'admin' ? 'Administrators' : 
                           activeCategory === 'instructor' ? 'Instructors' : 
                           activeCategory === 'student' ? 'Students' : 'All Users'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({limitedUsers.length} of {filteredUsers.length} users)
                </span>
              </div>
              <button
                onClick={() => handleCategorySelect('all')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                View All Users
              </button>
            </div>
          </div>
        )}

        {/* User Limit Control */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Show:</span>
              <div className="relative">
                <select
                  value={userLimit}
                  onChange={(e) => setUserLimit(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {limitOptions.map(option => (
                    <option key={option} value={option}>
                      {option} users
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <span className="text-sm text-gray-500">
                (Showing {limitedUsers.length} of {filteredUsers.length} filtered users)
              </span>
            </div>
            {filteredUsers.length > userLimit && (
              <button
                onClick={() => setUserLimit(Math.min(userLimit + 5, filteredUsers.length))}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Show More
              </button>
            )}
          </div>
        </div>

        <DataTable
          data={limitedUsers}
          columns={columns}
          selectable={true}
          selectedRows={selectedUsers}
          onSelectionChange={setSelectedUsers}
          loading={loading}
          emptyMessage={`No ${activeCategory === 'all' ? 'users' : activeCategory + 's'} found`}
          onAction={(user, event) => toggleActionMenu(user.id, event)}
        />
      </div>
        </>
      )}

      {/* Instructor Approval Tab */}
      {activeTab === 'instructor-approval' && (
        <InstructorApproval />
      )}

      {/* Action Menu */}
      {openActionMenu && (
        <div 
          className="fixed inset-0 z-50" 
          onClick={() => setOpenActionMenu(null)}
          onKeyDown={handleKeyDown}
        >
          <div 
            className="absolute bg-white shadow-lg rounded-lg border border-gray-200 py-1 min-w-[150px]"
            style={{
              left: `${actionMenuPosition.x}px`,
              top: `${actionMenuPosition.y}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleUserAction('view', users.find(u => u.id === openActionMenu))}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
              aria-label={`View details for ${getUserData(users.find(u => u.id === openActionMenu), 'name', 'user')}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              View
            </button>
            <button
              onClick={() => handleUserAction('edit', users.find(u => u.id === openActionMenu))}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center cursor-pointer"
              aria-label={`Edit ${getUserData(users.find(u => u.id === openActionMenu), 'name', 'user')}`}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => handleUserAction('delete', users.find(u => u.id === openActionMenu))}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center cursor-pointer"
              aria-label={`Delete ${getUserData(users.find(u => u.id === openActionMenu), 'name', 'user')}`}
            >
              <X className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Add User Dialog */}
      {showAddDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeAddUserDialog}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add New User</h2>
              <button
                onClick={closeAddUserDialog}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Status *
                </label>
                <select
                  name="enrollment"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Enrollment</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddUserDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {showEditDialog && editingUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeEditUserDialog}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={closeEditUserDialog}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveEditUser(Object.fromEntries(formData));
            }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={getUserData(editingUser, 'name', '')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={getUserData(editingUser, 'email', '')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    name="role"
                    defaultValue={getUserData(editingUser, 'role', '')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                    <option value="student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    defaultValue={getUserData(editingUser, 'status', '')}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enrollment Status *
                </label>
                <select
                  name="enrollment"
                  defaultValue={getUserData(editingUser, 'enrollment', '')}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Enrollment</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? "text" : "password"}
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditUserDialog}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isUserModalOpen && selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeUserModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={closeUserModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-medium ${getAvatarColor(getUserData(selectedUser, 'name', ''))}`}>
                  {getInitials(getUserData(selectedUser, 'name', ''))}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">{getUserData(selectedUser, 'name', 'Unknown')}</h3>
                  <p className="text-gray-600">{getUserData(selectedUser, 'email', 'No email')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Basic Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{getUserData(selectedUser, 'email', 'No email')}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{getUserData(selectedUser, 'phone', 'No phone')}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{getUserData(selectedUser, 'location', 'No location')}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{getUserData(selectedUser, 'company', 'No company')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Account Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-400 mr-3" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(getUserData(selectedUser, 'role', ''))}`}>
                        {getUserData(selectedUser, 'role', 'Unknown')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 text-gray-400 mr-3" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(getUserData(selectedUser, 'status', ''))}`}>
                        {getUserData(selectedUser, 'status', 'Unknown')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <GraduationCap className="w-4 h-4 text-gray-400 mr-3" />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEnrollmentColor(getUserData(selectedUser, 'enrollment', ''))}`}>
                        {getUserData(selectedUser, 'enrollment', 'Unknown')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">
                        Joined: {new Date(getUserData(selectedUser, 'joinDate', '')).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {getUserData(selectedUser, 'bio', '') && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Bio</h4>
                  <p className="text-sm text-gray-900">{getUserData(selectedUser, 'bio', '')}</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeUserModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement; 