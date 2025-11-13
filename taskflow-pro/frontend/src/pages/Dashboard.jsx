import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus,
  TrendingUp,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import { tasksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, statsResponse] = await Promise.all([
        tasksAPI.getAll({ limit: 6, page: 1 }),
        tasksAPI.getStats()
      ]);

      const tasks = tasksResponse.data.data.tasks;
      const statsData = statsResponse.data.data.stats;

      setStats(statsData);
      setRecentTasks(tasks);
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.create(taskData);
      toast.success('Task created successfully!');
      setIsTaskFormOpen(false);
      fetchDashboardData(); // Refresh data
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
      fetchDashboardData(); // Refresh data
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
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      toast.success('Task status updated!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Status change error:', error);
      toast.error('Failed to update task status');
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="text-3xl font-bold">{value}</h3>
        <p className="text-gray-600">{title}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );

  const getCompletionRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your tasks today.
            </p>
          </div>
          <button
            onClick={() => setIsTaskFormOpen(true)}
            className="btn btn-success"
          >
            <Plus size={20} className="mr-2" />
            New Task
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Tasks"
          value={stats.total}
          icon={<Target size={24} />}
          color="total"
          description="All your tasks"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={<Clock size={24} />}
          color="pending"
          description="Waiting to start"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<TrendingUp size={24} />}
          color="progress"
          description="Currently working on"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle size={24} />}
          color="completed"
          description={`${getCompletionRate()}% completion rate`}
        />
        {stats.overdue > 0 && (
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={<AlertCircle size={24} />}
            color="pending"
            description="Needs attention"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="text-primary-600" size={20} />
            <h3 className="font-semibold">Today's Schedule</h3>
          </div>
          <p className="text-gray-600 text-sm">
            {stats.pending + stats.inProgress > 0 
              ? `You have ${stats.pending + stats.inProgress} tasks to work on today`
              : 'No tasks scheduled for today'
            }
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="text-success-600" size={20} />
            <h3 className="font-semibold">Productivity</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Completion rate: <strong>{getCompletionRate()}%</strong>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center gap-3 mb-3">
            <Users className="text-warning-600" size={20} />
            <h3 className="font-semibold">Team</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Ready to collaborate with your team
          </p>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <Link 
              to="/tasks" 
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              View All Tasks →
            </Link>
          </div>
        </div>

        <div className="p-6">
          {recentTasks.length > 0 ? (
            <div className="tasks-grid">
              {recentTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Target size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tasks yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first task
              </p>
              <button
                onClick={() => setIsTaskFormOpen(true)}
                className="btn btn-primary"
              >
                <Plus size={20} className="mr-2" />
                Create Your First Task
              </button>
            </div>
          )}
        </div>
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
  );
};

export default Dashboard;