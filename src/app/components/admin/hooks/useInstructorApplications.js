import { useState, useEffect, useMemo } from 'react';
import { dataService, analyticsData } from '../services/dataService';
import apiService from '../services/apiService';

/**
 * Custom hook for managing instructor applications
 */
export const useInstructorApplications = () => {
  // State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    department: 'all',
    searchTerm: ''
  });

  // Check if we should use mock data (for development)
  const useMockData = import.meta.env.DEV || !import.meta.VITE_APP_API_URL;

  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (useMockData) {
          // In development, use mock data
          const mockApplications = analyticsData.instructorApplications || [];
          setApplications(mockApplications);
        } else {
          // In production, fetch from API
          const response = await apiService.instructorApplications.getApplications();
          setApplications(response.data || response || []);
        }
      } catch (err) {
        console.error('Failed to load instructor applications, falling back to mock data:', err);
        setError('Failed to load instructor applications');
        
        // Fallback to mock data if API fails
        const mockApplications = analyticsData.instructorApplications || [];
        setApplications(mockApplications);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [useMockData]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesStatus = filters.status === 'all' || app.application_status === filters.status;
      const matchesDepartment = filters.department === 'all' || app.department === filters.department;
      const matchesSearch = !filters.searchTerm || 
        app.full_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        app.skills.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        app.course_proposal.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return matchesStatus && matchesDepartment && matchesSearch;
    });
  }, [applications, filters]);

  // Get application statistics
  const getApplicationStats = useMemo(() => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.application_status === 'pending').length,
      approved: applications.filter(app => app.application_status === 'approved').length,
      rejected: applications.filter(app => app.application_status === 'rejected').length
    };
    return stats;
  }, [applications]);

  // View application details
  const viewApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  // Close application modal
  const closeApplicationModal = () => {
    setSelectedApplication(null);
    setShowApplicationModal(false);
  };

  // Approve application
  const approveApplication = async (applicationId, reviewNotes = '') => {
    try {
      setLoading(true);
      
      if (useMockData) {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the application status locally
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                application_status: 'approved',
                reviewNotes,
                reviewer: 'Admin User',
                reviewDate: new Date().toISOString()
              }
            : app
        ));
        
        return { success: true, data: { message: 'Application approved successfully' } };
      } else {
        // Call the API to approve the application
        const response = await apiService.instructorApplications.approveApplication(applicationId, reviewNotes);
        
        // Update the application status locally
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                application_status: 'approved',
                reviewNotes,
                reviewer: 'Admin User',
                reviewDate: new Date().toISOString()
              }
            : app
        ));
        
        return { success: true, data: response };
      }
    } catch (err) {
      console.error('Failed to approve application:', err);
      setError('Failed to approve application');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Reject application
  const rejectApplication = async (applicationId, reviewNotes = '') => {
    try {
      setLoading(true);
      
      if (useMockData) {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update the application status locally
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                application_status: 'rejected',
                reviewNotes,
                reviewer: 'Admin User',
                reviewDate: new Date().toISOString()
              }
            : app
        ));
        
        return { success: true, data: { message: 'Application rejected successfully' } };
      } else {
        // Call the API to reject the application
        const response = await apiService.instructorApplications.rejectApplication(applicationId, reviewNotes);
        
        // Update the application status locally
        setApplications(prev => prev.map(app => 
          app.id === applicationId 
            ? { 
                ...app, 
                application_status: 'rejected',
                reviewNotes,
                reviewer: 'Admin User',
                reviewDate: new Date().toISOString()
              }
            : app
        ));
        
        return { success: true, data: response };
      }
    } catch (err) {
      console.error('Failed to reject application:', err);
      setError('Failed to reject application');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      department: 'all',
      searchTerm: ''
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    // State
    applications,
    filteredApplications,
    loading,
    error,
    selectedApplication,
    showApplicationModal,
    filters,
    stats: getApplicationStats,

    // Actions
    viewApplication,
    closeApplicationModal,
    approveApplication,
    rejectApplication,
    updateFilters,
    clearFilters,

    // Utilities
    getStatusColor,
    formatDate
  };
}; 