import React from 'react';
import { Users, Crown, BookOpen, GraduationCap } from 'lucide-react';

const UserCategories = ({ activeCategory, getUserCounts, handleCategorySelect }) => {
  const categories = [
    {
      id: 'all',
      label: 'All Users',
      icon: Users,
      color: 'blue',
      count: getUserCounts().all
    },
    {
      id: 'admin',
      label: 'Administrators',
      icon: Crown,
      color: 'purple',
      count: getUserCounts().admin
    },
    {
      id: 'instructor',
      label: 'Instructors',
      icon: BookOpen,
      color: 'green',
      count: getUserCounts().instructor
    },
    {
      id: 'student',
      label: 'Students',
      icon: GraduationCap,
      color: 'orange',
      count: getUserCounts().student
    }
  ];

  const getColorClasses = (category, color) => {
    const isActive = activeCategory === category;
    const colorMap = {
      blue: {
        active: 'border-blue-500 bg-blue-50',
        inactive: 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100',
        iconActive: 'bg-blue-100 text-blue-600',
        iconInactive: 'bg-gray-200 text-gray-600',
        textActive: 'text-blue-900',
        textInactive: 'text-gray-900',
        countActive: 'text-blue-700',
        countInactive: 'text-gray-600'
      },
      purple: {
        active: 'border-purple-500 bg-purple-50',
        inactive: 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100',
        iconActive: 'bg-purple-100 text-purple-600',
        iconInactive: 'bg-gray-200 text-gray-600',
        textActive: 'text-purple-900',
        textInactive: 'text-gray-900',
        countActive: 'text-purple-700',
        countInactive: 'text-gray-600'
      },
      green: {
        active: 'border-green-500 bg-green-50',
        inactive: 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100',
        iconActive: 'bg-green-100 text-green-600',
        iconInactive: 'bg-gray-200 text-gray-600',
        textActive: 'text-green-900',
        textInactive: 'text-gray-900',
        countActive: 'text-green-700',
        countInactive: 'text-gray-600'
      },
      orange: {
        active: 'border-orange-500 bg-orange-50',
        inactive: 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100',
        iconActive: 'bg-orange-100 text-orange-600',
        iconInactive: 'bg-gray-200 text-gray-600',
        textActive: 'text-orange-900',
        textInactive: 'text-gray-900',
        countActive: 'text-orange-700',
        countInactive: 'text-gray-600'
      }
    };

    return colorMap[color];
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">User Categories</h3>
        <p className="text-sm text-gray-600">Click on a category to filter users by role</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {categories.map((category) => {
          const colors = getColorClasses(category.id, category.color);
          const isActive = activeCategory === category.id;
          
          return (
            <div 
              key={category.id}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isActive ? colors.active : colors.inactive
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${isActive ? colors.iconActive : colors.iconInactive}`}>
                    <category.icon className={`w-6 h-6 ${isActive ? colors.textActive : colors.textInactive}`} />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${isActive ? colors.textActive : colors.textInactive}`}>
                      {category.label}
                    </p>
                    <p className={`text-xs ${isActive ? colors.countActive : colors.countInactive}`}>
                      {category.count} {category.id === 'all' ? 'users' : category.id + 's'}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <div className={`w-2 h-2 bg-${category.color}-500 rounded-full`}></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserCategories; 