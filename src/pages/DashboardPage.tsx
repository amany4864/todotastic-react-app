import React, { useState, useEffect } from 'react';
import { Todo, todoService, CreateTodoData, UpdateTodoData } from '../services/todoService';
import { useAuth } from '../contexts/AuthContext';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import UserProfile from '../components/UserProfile';
import CalendarView from '../components/CalendarView';
import AIPlannerChat from '../components/AIPlannerChat';
import { TaskData } from '../services/llmService';
import { Plus, Search, CheckCircle, Circle, List, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
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
  const [showAIPlanner, setShowAIPlanner] = useState(false);

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

  const handleAIPlanGenerated = async (tasks: TaskData[]) => {
    // Convert AI tasks to todos and add them
    for (const task of tasks) {
      try {
        const todoData: CreateTodoData = {
          title: task.title,
          description: `Estimated time: ${task.expected_time_minutes} minutes`,
          due_date: task.scheduled_for
        };
        const newTodo = await todoService.createTodo(todoData);
        setTodos(prev => [newTodo, ...prev]);
      } catch (error) {
        console.error('Failed to create todo from AI plan:', error);
      }
    }
    toast.success(`Added ${tasks.length} tasks from AI plan!`);
    setShowAIPlanner(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* User Profile */}
      {user && <UserProfile user={user} todos={todos} />}

      {/* View Toggle Buttons */}
      <div className="mb-6 flex items-center justify-center">
        <div className="inline-flex rounded-lg p-1 bg-gray-800/50 border border-gray-700/50 w-full sm:w-auto">
          <button
            onClick={() => setCurrentView('list')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === 'list'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <List className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">List</span>
          </button>
          <button
            onClick={() => setCurrentView('calendar')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              currentView === 'calendar'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Calendar</span>
          </button>
        </div>
      </div>

      {/* Controls - Only show for list view */}
      {currentView === 'list' && (
        <div className="mb-6 sm:mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
          
          {/* Filter Buttons - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 sm:gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                }`}
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                All ({todos.length})
              </button>
              
              <button
                onClick={() => setFilter('active')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filter === 'active'
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                }`}
              >
                <Circle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Active ({todos.filter(todo => !todo.completed).length})
              </button>
              
              <button
                onClick={() => setFilter('completed')}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  filter === 'completed'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Done ({todos.filter(todo => todo.completed).length})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowAIPlanner(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                AI Planner
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Todo Button for Calendar View */}
      {currentView === 'calendar' && (
        <div className="mb-6 sm:mb-8 flex justify-center sm:justify-end">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAIPlanner(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              AI Planner
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add Todo
            </button>
          </div>
        </div>
      )}

      {/* Content based on current view */}
      {currentView === 'list' ? (
        // List View
        filteredTodos.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="text-gray-500 mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 bg-gray-700/50 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-200 mb-2">
              {searchQuery || filter !== 'all' ? 'No todos found' : 'No todos yet'}
            </h3>
            <p className="text-sm sm:text-base text-gray-400 mb-4">
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
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add Your First Todo
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* AI Planner Chat Modal */}
      {showAIPlanner && (
        <AIPlannerChat
          onPlanGenerated={handleAIPlanGenerated}
          onClose={() => setShowAIPlanner(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
