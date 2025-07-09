
import React, { useState, useEffect } from 'react';
import { Todo, CreateTodoData, UpdateTodoData } from '../services/todoService';
import { Calendar, X } from 'lucide-react';

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: CreateTodoData | UpdateTodoData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TodoForm: React.FC<TodoFormProps> = ({ todo, onSubmit, onCancel, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setDueDate(todo.due_date ? todo.due_date.split('T')[0] : '');
    }
  }, [todo]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (dueDate && new Date(dueDate) < new Date(new Date().toDateString())) {
      newErrors.dueDate = 'Due date must be today or in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate || undefined,
    };

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700/50 w-full max-w-md sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100">
            {todo ? 'Edit Todo' : 'Add New Todo'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-200" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 sm:py-3 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400 text-sm sm:text-base ${
                errors.title ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter todo title"
            />
            {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400 text-sm sm:text-base"
              placeholder="Enter description (optional)"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300 mb-2">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-3 py-2 sm:py-3 bg-gray-700/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 text-sm sm:text-base ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              <Calendar className="absolute right-3 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.dueDate && <p className="mt-1 text-sm text-red-400">{errors.dueDate}</p>}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 sm:py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm sm:text-base"
            >
              {isLoading ? 'Saving...' : (todo ? 'Update' : 'Add Todo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
