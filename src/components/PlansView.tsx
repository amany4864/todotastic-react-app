import React, { useState, useEffect } from 'react';
import { aiService } from '../services/llmService';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CalendarDays, CheckCircle, Circle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlansViewProps {
  refreshTrigger?: number;
}

interface Task {
  title: string;
  scheduled_for: string;
  expected_time_minutes: number;
  status: string;
}

interface PlanData {
  tasks: Task[];
  _id: string;
  user_id: string;
  created_at: string;
}

const PlansView: React.FC<PlansViewProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Use local date format in IST
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString('en-CA') // 'YYYY-MM-DD'
  );

  const fetchPlans = async () => {
    const userId = user?.id || user?._id;
    if (!user || !userId) return;

    try {
      setLoading(true);
      console.log('🔍 DEBUG: Fetching plans with userId:', userId);
      const plansData = await aiService.getPlans(userId.toString());
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load plans');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user, refreshTrigger]);

  // ✅ Get tasks matching selected date in IST
  const getTasksForDate = (date: string) => {
    return plans
      .flatMap(plan =>
        plan.tasks.filter(task => {
          const taskDate = new Date(task.scheduled_for).toLocaleDateString('en-CA');
          return taskDate === date;
        })
      )
      .sort(
        (a, b) =>
          new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
      );
  };

  const getNextSevenDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const selectedTasks = getTasksForDate(selectedDate);
  const nextSevenDays = getNextSevenDays();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Week View Selector */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-blue-400" />
          Weekly Overview
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {nextSevenDays.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const tasksCount = getTasksForDate(dateStr).length;
            const isSelected = dateStr === selectedDate;
            const todayClass = isToday(date) ? 'ring-2 ring-blue-400' : '';
            
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`p-3 rounded-lg text-center transition-all duration-200 ${todayClass} ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                }`}
              >
                <div className="text-xs font-medium">
                  {formatDate(date).split(',')[0]}
                </div>
                <div className="text-lg font-bold mt-1">
                  {date.getDate()}
                </div>
                {tasksCount > 0 && (
                  <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day View */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-400" />
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString([], { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            {isToday(new Date(selectedDate + 'T00:00:00')) && (
              <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Today
              </span>
            )}
          </h2>
          {selectedTasks.length > 0 && (
            <div className="text-sm text-gray-400">
              {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} planned
            </div>
          )}
        </div>

        {selectedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-400 mb-4">
              AI-powered planning is coming soon. For now, you can manage your tasks in the list view.
            </p>
            <button
              onClick={() => {
                // Trigger a custom event to switch to list view
                window.dispatchEvent(new CustomEvent('switchToListView'));
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Switch to List View
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedTasks.map((task, index) => (
              <div
                key={index}
                className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        task.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'
                      }`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(task.scheduled_for)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {task.expected_time_minutes} minutes
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-blue-600/20 text-blue-400'
                  }`}>
                    {task.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlansView;
