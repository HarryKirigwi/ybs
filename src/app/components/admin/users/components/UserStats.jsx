import React from 'react';
import { Users, UserPlus, UserMinus, RotateCcw } from 'lucide-react';

const UserStats = ({ users, getUserData }) => {
  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-gray-400'
    },
    {
      title: 'Active Users',
      value: users.filter(u => getUserData(u, 'status') === 'active').length,
      icon: UserPlus,
      color: 'text-gray-400'
    },
    {
      title: 'Inactive Users',
      value: users.filter(u => getUserData(u, 'status') === 'inactive').length,
      icon: UserMinus,
      color: 'text-gray-400'
    },
    {
      title: 'Enrolled',
      value: users.filter(u => getUserData(u, 'enrollment') === 'enrolled').length,
      icon: RotateCcw,
      color: 'text-gray-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                  <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserStats; 