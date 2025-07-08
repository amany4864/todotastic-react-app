
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

  const handleToggleComplete = () => {
    console.log('Toggle complete clicked for todo:', todo.id, 'current status:', todo.completed);
    onToggleComplete(todo.id, !todo.completed);
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700/50 p-6 hover:shadow-xl hover:border-gray-600/50 transition-all duration-300 ${
      todo.completed ? 'opacity-75 bg-gradient-to-br from-gray-800/60 to-gray-900/60' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleToggleComplete}
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer
                ${todo.completed 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-lg shadow-green-500/25' 
                  : 'border-gray-500 hover:border-green-400 hover:bg-green-400/10'
                }`}
            >
              {todo.completed && <Check className="w-4 h-4" />}
            </button>
            <h3 className={`text-lg font-semibold transition-all duration-200 ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-100'
            }`}>
              {todo.title}
            </h3>
          </div>
          
          {todo.description && (
            <p className={`mt-2 text-sm transition-all duration-200 ${
              todo.completed ? 'text-gray-500' : 'text-gray-300'
            }`}>
              {todo.description}
            </p>
          )}
          
          {todo.due_date && (
            <div className={`flex items-center mt-3 text-sm transition-all duration-200 ${
              isOverdue ? 'text-red-400' : todo.completed ? 'text-gray-500' : 'text-gray-400'
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
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
