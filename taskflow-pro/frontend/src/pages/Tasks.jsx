import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List,
  Download,
  Upload
} from 'lucide-react';
import { tasksAPI } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    page: 1,
    limit: 12
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getAll(filters);
      setTasks(response.data.data.tasks);
    } catch (error) {
      console.error('Fetch tasks error:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.create(taskData);
      toast.success('Task created successfully!');
      setIsTaskFormOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Create task error:', error);
      toast.error('Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await tasksAPI.update(selectedTask._id, taskData);
      toast.success('Task updated successfully!');
      setIsTaskFormOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Update task error:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.delete(taskId);
      toast.success('Task deleted successfully!');
      fetchTasks();
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      toast.success('Task status updated!');
      fetchTasks();
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
      page: 1,
      limit: 12
    });
  };

  const hasActiveFilters = filters.status !== 'all' || 
                          filters.priority !== 'all' || 
                          filters.search !== '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="main-content">
        {/* Header */}
        <div className="tasks-header">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your tasks in one place
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary">
              <Upload size={18} className="mr-2" />
              Import
            </button>
            <button className="btn btn-secondary">
              <Download size={18} className="mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsTaskFormOpen(true)}
              className="btn btn-success"
            >
              <Plus size={18} className="mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input pl-10 w-full lg:w-80"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="form-select"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary text-sm"
                >
                  Clear Filters
                </button>
              )}

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading tasks..." />
            </div>
          ) : tasks.length > 0 ? (
            <div className={viewMode === 'grid' ? 'tasks-grid p-6' : 'space-y-4 p-6'}>
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks found
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more tasks'
                  : 'Get started by creating your first task'
                }
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={() => setIsTaskFormOpen(true)}
                  className="btn btn-primary"
                >
                  <Plus size={20} className="mr-2" />
                  Create Your First Task
                </button>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Form Modal */}
        <TaskForm
          task={selectedTask}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setIsTaskFormOpen(false);
            setSelectedTask(null);
          }}
          isOpen={isTaskFormOpen}
        />
      </div>
    </div>
  );
};

export default Tasks;