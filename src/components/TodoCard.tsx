
import React from 'react';
import { Todo } from '../services/todoService';
import { Calendar, Edit, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onToggleComplete: (id: number, completed: boolean) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onEdit, onDelete, onToggleComplete }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${
      todo.completed ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggleComplete(todo.id, !todo.completed)}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                ${todo.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
                }`}
            >
              {todo.completed && <Check className="w-4 h-4" />}
            </button>
            <h3 className={`text-lg font-semibold ${
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {todo.title}
            </h3>
          </div>
          
          {todo.description && (
            <p className={`mt-2 text-sm ${
              todo.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {todo.description}
            </p>
          )}
          
          {todo.due_date && (
            <div className={`flex items-center mt-3 text-sm ${
              isOverdue ? 'text-red-600' : todo.completed ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Calendar className="w-4 h-4 mr-1" />
              <span className={isOverdue ? 'font-medium' : ''}>
                Due: {formatDate(todo.due_date)}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(todo)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
