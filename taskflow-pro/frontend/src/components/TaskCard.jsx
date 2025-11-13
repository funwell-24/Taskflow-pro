import React from 'react';
import { 
  Calendar, 
  User, 
  Flag, 
  Edit, 
  Trash2, 
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { format, isBefore, isToday, isTomorrow } from 'date-fns';

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  showActions = true 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in-progress':
        return 'status-in-progress';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'on-hold':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} />;
      case 'in-progress':
        return <PlayCircle size={16} />;
      case 'on-hold':
        return <PauseCircle size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else if (isBefore(date, new Date())) {
      return `Overdue: ${format(date, 'MMM dd, yyyy')}`;
    } else {
      return format(date, 'MMM dd, yyyy');
    }
  };

  const getDueDateColor = (dueDate, status) => {
    if (status === 'completed' || status === 'cancelled') {
      return 'text-gray-400';
    }
    
    if (!dueDate) return 'text-gray-500';
    
    const date = new Date(dueDate);
    
    if (isBefore(date, new Date())) {
      return 'text-error-600 font-semibold';
    } else if (isToday(date)) {
      return 'text-warning-600 font-semibold';
    } else if (isTomorrow(date)) {
      return 'text-warning-500';
    } else {
      return 'text-gray-500';
    }
  };

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(task._id, newStatus);
    }
  };

  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && 
                   task.status !== 'completed' && task.status !== 'cancelled';

  return (
    <div className={`task-card ${isOverdue ? 'border-error-500' : ''}`}>
      {/* Header with title and actions */}
      <div className="task-header">
        <h3 className="task-title" title={task.title}>
          {task.title}
        </h3>
        
        {showActions && (
          <div className="task-actions">
            {/* Quick Status Actions */}
            {task.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="btn-icon text-success-600 hover:bg-success-50"
                title="Mark as completed"
              >
                <CheckCircle2 size={16} />
              </button>
            )}
            
            <button
              onClick={() => onEdit(task)}
              className="btn-icon"
              title="Edit task"
            >
              <Edit size={16} />
            </button>
            
            <button
              onClick={() => onDelete(task._id)}
              className="btn-icon btn-danger"
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Description */}
      {task.description && (
        <p className="task-description" title={task.description}>
          {task.description.length > 150 
            ? `${task.description.substring(0, 150)}...` 
            : task.description
          }
        </p>
      )}
      
      {/* Metadata - Priority and Status */}
      <div className="task-meta">
        <div className={`task-priority ${getPriorityColor(task.priority)}`}>
          <Flag size={14} />
          <span>{task.priority}</span>
        </div>
        
        <div className={`task-status ${getStatusColor(task.status)}`}>
          {getStatusIcon(task.status)}
          <span>{task.status.replace('-', ' ')}</span>
        </div>

        {/* Time tracking */}
        {(task.estimatedHours > 0 || task.actualHours > 0) && (
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
            <Clock size={12} />
            <span>
              {task.actualHours > 0 && `${task.actualHours}h/`}
              {task.estimatedHours > 0 ? `${task.estimatedHours}h` : 'No estimate'}
            </span>
          </div>
        )}
      </div>
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="inline-block text-gray-500 text-xs px-2 py-1">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}
      
      {/* Footer with due date and assignee */}
      <div className="task-footer">
        <div className="flex items-center gap-4">
          {/* Due Date */}
          {task.dueDate && (
            <div className={`task-due-date ${getDueDateColor(task.dueDate, task.status)}`}>
              <Calendar size={14} />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}
          
          {/* Assigned User */}
          {task.assignedTo && (
            <div className="task-assigned" title={`Assigned to: ${task.assignedTo.name}`}>
              <User size={14} />
              <span>{task.assignedTo.name}</span>
            </div>
          )}
        </div>
        
        {/* Progress indicator for in-progress tasks */}
        {task.status === 'in-progress' && task.estimatedHours > 0 && task.actualHours > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ 
                  width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%` 
                }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Math.round((task.actualHours / task.estimatedHours) * 100)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Overdue badge */}
      {isOverdue && (
        <div className="absolute -top-2 -right-2">
          <span className="bg-error-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Overdue
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;