import React from 'react';
import { Search, Filter, X, Users, Shield, GraduationCap } from 'lucide-react';

const UserFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filters, 
  setFilters, 
  activeCategory, 
  handleCategorySelect 
}) => {
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      role: 'all',
      status: 'all',
      enrollment: 'all'
    });
  };

  const hasActiveFilters = searchTerm || filters.status !== 'all' || filters.enrollment !== 'all';

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl border border-gray-100 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Advanced Filters</h3>
            <p className="text-sm text-gray-600">Refine your user search with precision</p>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <X className="w-4 h-4" />
            <span className="font-medium">Clear all</span>
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Search Filter */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-500" />
            Search Users
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300"
              placeholder="Search by name or email..."
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-green-500" />
            Account Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
            >
              <option value="all" className="py-2">All Status</option>
              <option value="active" className="py-2">🟢 Active</option>
              <option value="inactive" className="py-2">⚪ Inactive</option>
              <option value="suspended" className="py-2">🔴 Suspended</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>

        {/* Enrollment Filter */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <GraduationCap className="w-4 h-4 mr-2 text-purple-500" />
            Enrollment Status
          </label>
          <div className="relative">
            <select
              value={filters.enrollment}
              onChange={(e) => setFilters(prev => ({ ...prev, enrollment: e.target.value }))}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
            >
              <option value="all" className="py-2">All Enrollment</option>
              <option value="enrolled" className="py-2">📚 Enrolled</option>
              <option value="pending" className="py-2">⏳ Pending</option>
              <option value="completed" className="py-2">✅ Completed</option>
              <option value="dropped" className="py-2">❌ Dropped</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-gray-700">Active Filters</span>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {searchTerm && (
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-200 shadow-sm">
                <Search className="w-4 h-4 mr-2" />
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 p-1 hover:bg-blue-300 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.status !== 'all' && (
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200 shadow-sm">
                <Shield className="w-4 h-4 mr-2" />
                Status: {filters.status}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
                  className="ml-2 p-1 hover:bg-green-300 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {filters.enrollment !== 'all' && (
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200 shadow-sm">
                <GraduationCap className="w-4 h-4 mr-2" />
                Enrollment: {filters.enrollment}
                <button
                  onClick={() => setFilters(prev => ({ ...prev, enrollment: 'all' }))}
                  className="ml-2 p-1 hover:bg-purple-300 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Filters applied: {hasActiveFilters ? 'Yes' : 'None'}</span>
          <span className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>Ready to filter</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserFilters; 