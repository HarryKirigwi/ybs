import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Award, 
  Download,
  BarChart3,
  Activity,
  Target,
  Calendar
} from 'lucide-react';
import { StatsCard } from '../../shared/ui';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';

// Import centralized hooks
import { useAnalyticsData } from '../hooks';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

/**
 * Admin Analytics Component
 * Comprehensive analytics dashboard for LMS administrators
 * Updated to use centralized services
 */
const AdminAnalytics = () => {
  // Use centralized analytics data and operations
  const { 
    data: analyticsData, 
    loading, 
    error, 
    refresh 
  } = useAnalyticsData();

  const [timeRange, setTimeRange] = useState('monthly');

  // Extract analytics data from centralized service
  const data = analyticsData || {
    userMetrics: {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      userGrowth: 0,
      userRetention: 0,
      userEngagement: 0
    },
    courseMetrics: {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      courseCompletion: 0,
      averageRating: 0,
      totalEnrollments: 0
    },
    engagementMetrics: {
      averageSessionTime: 0,
      pageViews: 0,
      uniqueVisitors: 0,
      bounceRate: 0,
      timeOnSite: 0,
      returnVisitors: 0
    },
    performanceMetrics: {
      courseCompletionRate: 0,
      averageGrade: 0,
      assignmentSubmission: 0,
      quizPassRate: 0,
      certificateIssued: 0,
      dropoutRate: 0
    },
    platformMetrics: {
      serverUptime: 0,
      averageLoadTime: 0,
      mobileUsage: 0,
      desktopUsage: 0,
      peakConcurrentUsers: 0,
      bandwidthUsage: 0
    },
    userGrowthData: [],
    coursePerformanceData: [],
    engagementTrendData: [],
    deviceUsageData: [],
    learningOutcomesData: {
      labels: [],
      datasets: []
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    // Refresh data with new time range
    refresh();
  };

  const handleExportAnalytics = async () => {
    try {
      const csvContent = [
        ['Metric', 'Value', 'Change', 'Period'],
        ['Total Users', data?.userMetrics?.totalUsers || 0, (data?.userMetrics?.userGrowth || 0) + '%', timeRange],
        ['Active Users', data?.userMetrics?.activeUsers || 0, '', timeRange],
        ['New Users', data?.userMetrics?.newUsers || 0, '', timeRange],
        ['Course Completion Rate', (data?.performanceMetrics?.courseCompletionRate || 0) + '%', '', timeRange],
        ['Average Grade', (data?.performanceMetrics?.averageGrade || 0) + '%', '', timeRange],
        ['Server Uptime', (data?.platformMetrics?.serverUptime || 0) + '%', '', timeRange],
        ['Average Load Time', (data?.platformMetrics?.averageLoadTime || 0) + 'ms', '', timeRange]
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // console.error('Failed to export analytics:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading analytics...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
              <button 
                onClick={refresh}
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
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={handleExportAnalytics}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={(data?.userMetrics?.totalUsers || 0).toLocaleString()}
          change={data?.userMetrics?.userGrowth || 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Courses"
          value={data?.courseMetrics?.totalCourses || 0}
          change={data?.courseMetrics?.courseCompletion || 0}
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Completion Rate"
          value={`${data?.performanceMetrics?.courseCompletionRate || 0}%`}
          change={data?.performanceMetrics?.averageGrade || 0}
          icon={Award}
          color="purple"
        />
        <StatsCard
          title="Server Uptime"
          value={`${data?.platformMetrics?.serverUptime || 0}%`}
          change={data?.platformMetrics?.averageLoadTime || 0}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          {(data?.userGrowthData || []).length > 0 ? (
            <Line
              data={{
                labels: (data?.userGrowthData || []).map(item => item.month),
                datasets: [{
                  label: 'Users',
                  data: (data?.userGrowthData || []).map(item => item.users),
                  borderColor: 'rgb(59, 130, 246)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Course Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
          {(data?.coursePerformanceData || []).length > 0 ? (
            <Bar
              data={{
                labels: (data?.coursePerformanceData || []).map(item => item.course),
                datasets: [{
                  label: 'Enrollments',
                  data: (data?.coursePerformanceData || []).map(item => item.enrollments),
                  backgroundColor: 'rgba(34, 197, 94, 0.8)'
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Engagement */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
          <div className="space-y-4">
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Active Users</span>
               <span className="font-semibold">{(data?.userMetrics?.activeUsers || 0).toLocaleString()}</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">New Users</span>
               <span className="font-semibold">{(data?.userMetrics?.newUsers || 0).toLocaleString()}</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Retention Rate</span>
               <span className="font-semibold">{data?.userMetrics?.userRetention || 0}%</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Engagement Score</span>
               <span className="font-semibold">{data?.userMetrics?.userEngagement || 0}%</span>
             </div>
          </div>
        </div>

        {/* Course Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Metrics</h3>
          <div className="space-y-4">
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Published Courses</span>
               <span className="font-semibold">{data?.courseMetrics?.publishedCourses || 0}</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Draft Courses</span>
               <span className="font-semibold">{data?.courseMetrics?.draftCourses || 0}</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Total Enrollments</span>
               <span className="font-semibold">{(data?.courseMetrics?.totalEnrollments || 0).toLocaleString()}</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Average Rating</span>
               <span className="font-semibold">{data?.courseMetrics?.averageRating || 0}/5</span>
             </div>
          </div>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Server Uptime</span>
               <span className="font-semibold">{data?.platformMetrics?.serverUptime || 0}%</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Load Time</span>
               <span className="font-semibold">{data?.platformMetrics?.averageLoadTime || 0}ms</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Mobile Usage</span>
               <span className="font-semibold">{data?.platformMetrics?.mobileUsage || 0}%</span>
             </div>
                         <div className="flex justify-between items-center">
               <span className="text-gray-600">Peak Users</span>
               <span className="font-semibold">{data?.platformMetrics?.peakConcurrentUsers || 0}</span>
             </div>
          </div>
        </div>
      </div>

             {/* Device Usage Chart */}
       {(data?.deviceUsageData || []).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
          <div className="w-full max-w-md mx-auto">
            <Doughnut
                             data={{
                 labels: (data?.deviceUsageData || []).map(item => item.device),
                 datasets: [{
                   data: (data?.deviceUsageData || []).map(item => item.percentage),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ]
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={refresh}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default AdminAnalytics; 