import React from 'react';
import { TrendingUp, Clock, BookOpen, Users, DollarSign } from 'lucide-react';
import { StatsCard } from '../../shared/ui';

/**
 * Admin Dashboard Overview Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.dashboardData - Dashboard statistics data
 */
const AdminDashboardOverview = ({ dashboardData = {} }) => {
  const stats = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers || 0,
      change: '+12.5% from last month',
      changeType: 'positive',
      icon: Users,
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-500',
      format: 'number'
    },
    {
      title: 'Active Courses',
      value: dashboardData.activeCourses || 0,
      change: '+8.2% from last month',
      changeType: 'positive',
      icon: BookOpen,
      borderColor: 'border-green-500',
      iconColor: 'text-green-500',
      format: 'number'
    },
    {
      title: 'Monthly Revenue',
      value: dashboardData.monthlyRevenue || 0,
      change: '+10% from last month',
      changeType: 'positive',
      icon: DollarSign,
      borderColor: 'border-purple-500',
      iconColor: 'text-purple-500',
      format: 'currency'
    },
    {
      title: 'Completion Rate',
      value: dashboardData.completionRate || 0,
      change: '+5% from last month',
      changeType: 'positive',
      icon: TrendingUp,
      borderColor: 'border-orange-500',
      iconColor: 'text-orange-500',
      format: 'percentage'
    }
  ];

  return (
    <section id="dashboard-section">
      {/* Mobile Welcome Message */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-6 mt-4 text-white">
        <h1 className="text-lg font-semibold mb-1">Admin Dashboard 👋</h1>
        <p className="text-sm text-white/90">Monitor and manage platform activities</p>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 sm:mb-8">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
        {/* Pending Actions */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-6">Pending Actions</h3>

          <div className="space-y-4">
            {/* Course Approval */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-slate-800">Course Approval</p>
                  <p className="text-sm text-gray-600">{dashboardData.pendingActions?.courseApproval || 0} items</p>
                </div>
              </div>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                High
              </span>
            </div>

            {/* Instructor Approval */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-slate-800">Instructor Approval</p>
                  <p className="text-sm text-gray-600">{dashboardData.pendingActions?.instructorApproval || 0} items</p>
                </div>
              </div>
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Medium
              </span>
            </div>

            {/* Payment Issues */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-slate-800">Payment Issues</p>
                  <p className="text-sm text-gray-600">{dashboardData.pendingActions?.paymentIssues || 0} items</p>
                </div>
              </div>
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                High
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-6">Recent Activities</h3>

          <div className="space-y-4">
            {dashboardData.recentActivities?.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">{activity.title}</p>
                  <p className="text-sm text-gray-600">by {activity.user}</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardOverview; 