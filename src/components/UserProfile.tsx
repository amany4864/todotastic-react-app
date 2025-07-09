
import React from 'react';
import { Todo } from '../services/todoService';
import { User, CheckCircle, Circle, TrendingUp } from 'lucide-react';

interface UserProfileProps {
  user: { email: string; username?: string };
  todos: Todo[];
}

const UserProfile: React.FC<UserProfileProps> = ({ user, todos }) => {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate stroke dasharray for the circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg border border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
              {user.username || user.email.split('@')[0]}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 w-full sm:w-auto">
          {/* Task Statistics */}
          <div className="flex space-x-4 sm:space-x-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-300 mb-1">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Total</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-blue-400">{totalTasks}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-300 mb-1">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Done</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-400">{completedTasks}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-gray-300 mb-1">
                <Circle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Pending</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-orange-400">{pendingTasks}</p>
            </div>
          </div>

          {/* Circular Progress Chart */}
          <div className="relative">
            <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="rgb(55, 65, 81)"
                strokeWidth="8"
                fill="none"
                className="opacity-30"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="url(#gradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base sm:text-lg font-bold text-gray-100">
                {Math.round(completionPercentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
