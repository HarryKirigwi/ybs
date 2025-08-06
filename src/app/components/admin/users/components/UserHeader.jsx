import React from 'react';
import { UserPlus, Download, Upload } from 'lucide-react';

const UserHeader = ({ 
  setShowAddDialog, 
  exportUsers, 
  handleImport 
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
        <p className="mt-1 text-sm text-gray-600">Manage all users in the platform</p>
      </div>
      <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          aria-label="Add new user"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
        <button
          onClick={exportUsers}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          aria-label="Export users to CSV"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
        <button
          onClick={handleImport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          aria-label="Import users from CSV"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </button>
      </div>
    </div>
  );
};

export default UserHeader; 