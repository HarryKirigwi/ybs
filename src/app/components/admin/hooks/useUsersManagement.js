import { useState, useEffect } from 'react';
import { useApiService } from './useApiService';
import { usersData, dataUtils } from '../services/dataService';

export const useUsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    enrollment: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [activeCategory, setActiveCategory] = useState('all');
  const [userLimit, setUserLimit] = useState(5); // Default limit of 5 users

  const { users: apiUsers, loading: apiLoading, error } = useApiService();

  // Check if we should use mock data (for development)
  const useMockData = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;

  // API functions
  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (useMockData) {
        // Use mock data for development
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(usersData.users);
      } else {
        // Use real API
        const data = await apiUsers.getAll();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users, falling back to mock data:', error);
      setNotification({ message: 'Failed to fetch users, using mock data', type: 'warning' });
      // Fallback to mock data
      setUsers(usersData.users);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      if (useMockData) {
        // Simulate API call with mock data
        const newUser = {
          id: Date.now(),
          ...userData,
          joinDate: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString().split('T')[0],
          phone: userData.phone || '',
          department: userData.department || '',
          location: userData.location || '',
          bio: userData.bio || '',
          website: userData.website || '',
          company: userData.company || ''
        };
        setUsers(prev => [...prev, newUser]);
        setNotification({ message: 'User created successfully', type: 'success' });
        return true;
      } else {
        // Use real API
        const result = await apiUsers.create(userData);
        setUsers(prev => [...prev, result]);
        setNotification({ message: 'User created successfully', type: 'success' });
        return true;
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      setNotification({ message: 'Failed to create user', type: 'error' });
      return false;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      if (useMockData) {
        // Simulate API call with mock data
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...userData } : user
        ));
        setNotification({ message: 'User updated successfully', type: 'success' });
        return true;
      } else {
        // Use real API
        const result = await apiUsers.update(userId, userData);
        setUsers(prev => prev.map(user => 
          user.id === userId ? result : user
        ));
        setNotification({ message: 'User updated successfully', type: 'success' });
        return true;
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      setNotification({ message: 'Failed to update user', type: 'error' });
      return false;
    }
  };

  const deleteUser = async (userId) => {
    try {
      if (useMockData) {
        // Simulate API call with mock data
        setUsers(prev => prev.filter(user => user.id !== userId));
        setNotification({ message: 'User deleted successfully', type: 'success' });
        return true;
      } else {
        // Use real API
        await apiUsers.delete(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        setNotification({ message: 'User deleted successfully', type: 'success' });
        return true;
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      setNotification({ message: 'Failed to delete user', type: 'error' });
      return false;
    }
  };

  const bulkDeleteUsers = async (userIds) => {
    try {
      if (useMockData) {
        // Simulate API call with mock data
        setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
        setSelectedUsers([]);
        setNotification({ message: `${userIds.length} users deleted successfully`, type: 'success' });
        return true;
      } else {
        // Use real API
        await apiUsers.bulkDelete(userIds);
        setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
        setSelectedUsers([]);
        setNotification({ message: `${userIds.length} users deleted successfully`, type: 'success' });
        return true;
      }
    } catch (error) {
      console.error('Failed to delete users:', error);
      setNotification({ message: 'Failed to delete users', type: 'error' });
      return false;
    }
  };

  const exportUsers = async () => {
    try {
      if (useMockData) {
        // Simulate export with mock data
        const csvContent = "data:text/csv;charset=utf-8," + 
          "Name,Email,Role,Status,Enrollment,Join Date,Last Login\n" +
          users.map(user => 
            `${dataUtils.getUserData(user, 'name', '')},${dataUtils.getUserData(user, 'email', '')},${dataUtils.getUserData(user, 'role', '')},${dataUtils.getUserData(user, 'status', '')},${dataUtils.getUserData(user, 'enrollment', '')},${dataUtils.getUserData(user, 'joinDate', '')},${dataUtils.getUserData(user, 'lastLogin', '')}`
          ).join('\n');
        
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setNotification({ message: 'Users exported successfully', type: 'success' });
      } else {
        // Use real API
        await apiUsers.export();
        setNotification({ message: 'Users exported successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to export users:', error);
      setNotification({ message: 'Failed to export users', type: 'error' });
    }
  };

  const importUsers = async (file) => {
    try {
      if (useMockData) {
        // Simulate import with mock data
        const reader = new FileReader();
        reader.onload = (e) => {
          const csv = e.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',');
          
          const newUsers = lines.slice(1).map((line, index) => {
            const values = line.split(',');
            return {
              id: Date.now() + index,
              name: values[0] || '',
              email: values[1] || '',
              role: values[2] || 'student',
              status: values[3] || 'active',
              enrollment: values[4] || 'enrolled',
              joinDate: values[5] || new Date().toISOString().split('T')[0],
              lastLogin: values[6] || new Date().toISOString().split('T')[0],
              phone: '',
              department: '',
              location: '',
              bio: '',
              website: '',
              company: ''
            };
          });
          
          setUsers(prev => [...prev, ...newUsers]);
          setNotification({ message: `${newUsers.length} users imported successfully`, type: 'success' });
        };
        reader.readAsText(file);
      } else {
        // Use real API
        const result = await apiUsers.import(file);
        setUsers(prev => [...prev, ...result]);
        setNotification({ message: 'Users imported successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to import users:', error);
      setNotification({ message: 'Failed to import users', type: 'error' });
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const downloadTemplate = async () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Email,Role,Status,Enrollment,Join Date,Last Login\n" +
      "John Doe,john@example.com,student,active,enrolled,2024-01-15,2024-03-20";
    
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'users-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        importUsers(file);
      }
    };
    input.click();
  };

  const handleAddUser = async (formData) => {
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

    const success = await createUser(userData);
    return success;
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      setNotification({ message: 'Please select users to delete', type: 'error' });
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`);
    if (confirmed) {
      await bulkDeleteUsers(selectedUsers);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    if (category !== 'all') {
      setFilters(prev => ({ ...prev, role: category }));
    } else {
      setFilters(prev => ({ ...prev, role: 'all' }));
    }
  };

  // Filter users based on search, filters, and active category
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const matchesSearch = dataUtils.getUserData(user, 'name', '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataUtils.getUserData(user, 'email', '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filters.role === 'all' || dataUtils.getUserData(user, 'role') === filters.role;
    const matchesStatus = filters.status === 'all' || dataUtils.getUserData(user, 'status') === filters.status;
    const matchesEnrollment = filters.enrollment === 'all' || dataUtils.getUserData(user, 'enrollment') === filters.enrollment;
    const matchesCategory = activeCategory === 'all' || dataUtils.getUserData(user, 'role') === activeCategory;
    
    return matchesSearch && matchesRole && matchesStatus && matchesEnrollment && matchesCategory;
  });

  // Limit the filtered users to show only the specified number
  const limitedUsers = filteredUsers.slice(0, userLimit);

  // Get user counts by category
  const getUserCounts = () => {
    const counts = {
      all: users.length,
      admin: users.filter(u => dataUtils.getUserData(u, 'role') === 'admin').length,
      instructor: users.filter(u => dataUtils.getUserData(u, 'role') === 'instructor').length,
      student: users.filter(u => dataUtils.getUserData(u, 'role') === 'student').length
    };
    return counts;
  };

  // Initialize users data on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    // State
    users,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedUsers,
    setSelectedUsers,
    loading: loading || apiLoading,
    notification,
    setNotification,
    activeCategory,
    setActiveCategory,
    userLimit,
    setUserLimit,
    error,
    
    // Utility functions (from centralized data service)
    getInitials: dataUtils.getInitials,
    getUserData: dataUtils.getUserData,
    isValidEmail: dataUtils.isValidEmail,
    validatePassword: dataUtils.validatePassword,
    isValidPhone: dataUtils.isValidPhone,
    getAvatarColor: dataUtils.getAvatarColor,
    getStatusColor: dataUtils.getStatusColor,
    getEnrollmentColor: dataUtils.getStatusColor, // Reuse status color for enrollment
    getRoleColor: dataUtils.getRoleColor,
    
    // API functions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    bulkDeleteUsers,
    exportUsers,
    importUsers,
    showNotification,
    downloadTemplate,
    handleImport,
    handleAddUser,
    handleBulkDelete,
    
    // UI functions
    toggleUserSelection,
    toggleAllUsers,
    handleCategorySelect,
    
    // Computed values
    filteredUsers,
    limitedUsers,
    getUserCounts,
  };
}; 