import React, { useState, useEffect } from 'react';
import { Todo, todoService, CreateTodoData, UpdateTodoData } from '../services/todoService';
import { useAuth } from '../contexts/AuthContext';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import UserProfile from '../components/UserProfile';
import CalendarView from '../components/CalendarView';
import { Plus, Search, CheckCircle, Circle, List, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'active' | 'completed';
type ViewType = 'list' | 'calendar';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('list');

  const fetchTodos = async () => {
    try {
      const fetchedTodos = await todoService.getTodos();
      setTodos(fetchedTodos);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const filterTodos = () => {
    let filtered = todos;

    // Filter by completion status
    switch (filter) {
      case 'active':
        filtered = filtered.filter(todo => !todo.completed);
        break;
      case 'completed':
        filtered = filtered.filter(todo => todo.completed);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTodos(filtered);
  };

  const handleCreateTodo = async (data: CreateTodoData) => {
    setFormLoading(true);
    try {
      const newTodo = await todoService.createTodo(data);
      setTodos(prev => [newTodo, ...prev]);
      setShowForm(false);
      toast.success('Todo created successfully!');
    } catch (error) {
      console.error('Failed to create todo:', error);
      toast.error('Failed to create todo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTodo = async (data: UpdateTodoData) => {
    if (!editingTodo) return;

    setFormLoading(true);
    try {
      const updatedTodo = await todoService.updateTodo(editingTodo.id, data);
      setTodos(prev => prev.map(todo => 
        todo.id === editingTodo.id ? updatedTodo : todo
      ));
      setEditingTodo(undefined);
      toast.success('Todo updated successfully!');
    } catch (error) {
      console.error('Failed to update todo:', error);
      toast.error('Failed to update todo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success('Todo deleted successfully!');
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast.error('Failed to delete todo');
    }
  };

const handleToggleComplete = async (id: number) => {
  try {
    const updatedTodo = await todoService.toggleTodoComplete(id);
    setTodos(prev => prev.map(todo => 
      todo.id === id ? updatedTodo : todo
    ));
    toast.success(updatedTodo.completed ? 'Todo completed!' : 'Todo reopened!');
  } catch (error) {
    console.error('Failed to toggle todo:', error);
    toast.error('Failed to update todo');
  }
};

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTodo(undefined);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [todos, filter, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* User Profile */}
      {user && <UserProfile user={user} todos={todos} />}

      {/* Header */}
{/*       <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">My Todos</h1>
        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>{todos.filter(todo => !todo.completed).length} active</span>
          <span>{todos.filter(todo => todo.completed).length} completed</span>
          <span>{todos.length} total</span>
        </div>
      </div> */}

      {/* View Toggle Buttons */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex rounded-lg p-1 bg-gray-800/50 border border-gray-700/50">
          <button
            onClick={() => setCurrentView('list')}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === 'calendar'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Controls - Only show for list view */}
      {currentView === 'list' && (
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              All ({todos.length})
            </button>
            
            <button
              onClick={() => setFilter('active')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              <Circle className="w-4 h-4 mr-2" />
              Active ({todos.filter(todo => !todo.completed).length})
            </button>
            
            <button
              onClick={() => setFilter('completed')}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'completed'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed ({todos.filter(todo => todo.completed).length})
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Todo
          </button>
        </div>
      )}

      {/* Add Todo Button for Calendar View */}
      {currentView === 'calendar' && (
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Todo
          </button>
        </div>
      )}

      {/* Content based on current view */}
      {currentView === 'list' ? (
        // List View
        filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">
              {searchQuery || filter !== 'all' ? 'No todos found' : 'No todos yet'}
            </h3>
            <p className="text-gray-400 mb-4">
              {searchQuery || filter !== 'all' 
                ? 'Try adjusting your search or filter.' 
                : 'Get started by creating your first todo.'
              }
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Todo
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTodos.map((todo) => (
              <TodoCard
  key={todo.id}
  todo={todo}
  onEdit={handleEditTodo}
  onDelete={handleDeleteTodo}
  onToggleComplete={() => handleToggleComplete(todo.id)}
/>
            ))}
          </div>
        )
      ) : (
        // Calendar View
        <CalendarView
  todos={todos}
  onEditTodo={handleEditTodo}
  onDeleteTodo={handleDeleteTodo}
  onToggleComplete={handleToggleComplete}
/>
      )}

      {/* Todo Form Modal */}
      {(showForm || editingTodo) && (
        <TodoForm
          todo={editingTodo}
          onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
          onCancel={handleCloseForm}
          isLoading={formLoading}
        />
      )}
    </div>
  );
};

export default DashboardPage;
