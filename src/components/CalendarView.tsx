
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Todo } from '../services/todoService';
import { format, isSameDay } from 'date-fns';
import { Clock, CheckCircle, Circle } from 'lucide-react';

interface CalendarViewProps {
  todos: Todo[];
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  todos, 
  onEditTodo, 
  onDeleteTodo, 
  onToggleComplete 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get todos for the selected date
  const getTasksForDate = (date: Date) => {
    return todos.filter(todo => 
      todo.due_date && isSameDay(new Date(todo.due_date), date)
    );
  };

  // Get dates that have tasks
  const getDatesWithTasks = () => {
    return todos
      .filter(todo => todo.due_date)
      .map(todo => new Date(todo.due_date!));
  };

  const tasksForSelectedDate = getTasksForDate(selectedDate);
  const datesWithTasks = getDatesWithTasks();

  const handleToggleComplete = (todo: Todo) => {
    onToggleComplete(todo.id, !todo.completed);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Calendar */}
      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-100">Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border border-gray-600 bg-gray-800/50"
            modifiers={{
              hasTask: datesWithTasks,
            }}
            modifiersStyles={{
              hasTask: {
                backgroundColor: 'rgba(59, 130, 246, 0.3)',
                color: 'white',
                fontWeight: 'bold',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Tasks for selected date */}
      <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm border border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Tasks for {format(selectedDate, 'MMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksForSelectedDate.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">No tasks scheduled</div>
              <p className="text-gray-400 text-sm">
                Select a different date or add tasks with due dates
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksForSelectedDate.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-4 rounded-lg border border-gray-700/50 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 ${
                    todo.completed ? 'opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer
                          ${todo.completed 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white' 
                            : 'border-gray-500 hover:border-green-400 hover:bg-green-400/10'
                          }`}
                      >
                        {todo.completed ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Circle className="w-3 h-3" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className={`font-medium transition-all duration-200 ${
                          todo.completed ? 'line-through text-gray-400' : 'text-gray-100'
                        }`}>
                          {todo.title}
                        </h4>
                        {todo.description && (
                          <p className={`text-sm mt-1 transition-all duration-200 ${
                            todo.completed ? 'text-gray-500' : 'text-gray-300'
                          }`}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => onEditTodo(todo)}
                        className="p-1 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteTodo(todo.id)}
                        className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
