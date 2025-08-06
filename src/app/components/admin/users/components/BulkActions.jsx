import React from 'react';
import { Trash2 } from 'lucide-react';

const BulkActions = ({ selectedUsers, handleBulkDelete }) => {
  if (selectedUsers.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-800">
          {selectedUsers.length} user(s) selected
        </span>
        <div className="flex space-x-2">
          <button
            onClick={handleBulkDelete}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions; 