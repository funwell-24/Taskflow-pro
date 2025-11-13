import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, User, Tag, Clock } from 'lucide-react';
import { format } from 'date-fns';

const TaskForm = ({ 
  task, 
  onSubmit, 
  onCancel, 
  isOpen,
  users = [], // For assignment dropdown
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    assignedTo: '',
    tags: [],
    estimatedHours: '',
    actualHours: ''
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        assignedTo: task.assignedTo?._id || '',
        tags: task.tags || [],
        estimatedHours: task.estimatedHours || '',
        actualHours: task.actualHours || ''
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        assignedTo: '',
        tags: [],
        estimatedHours: '',
        actualHours: ''
      });
    }
    setErrors({});
    setNewTag('');
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (formData.estimatedHours && (formData.estimatedHours < 0 || formData.estimatedHours > 1000)) {
      newErrors.estimatedHours = 'Estimated hours must be between 0 and 1000';
    }

    if (formData.actualHours && (formData.actualHours < 0 || formData.actualHours > 1000)) {
      newErrors.actualHours = 'Actual hours must be between 0 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : 0,
      actualHours: formData.actualHours ? parseFloat(formData.actualHours) : 0,
      assignedTo: formData.assignedTo || null,
      dueDate: formData.dueDate || null
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="flex items-center gap-2">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button 
            onClick={onCancel} 
            className="btn-icon"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'border-error-500' : ''}`}
              placeholder="Enter task title..."
              disabled={isLoading}
            />
            {errors.title && (
              <div className="form-error">{errors.title}</div>
            )}
          </div>
          
          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${errors.description ? 'border-error-500' : ''}`}
              placeholder="Describe the task..."
              rows="3"
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{errors.description && <span className="form-error">{errors.description}</span>}</span>
              <span>{formData.description.length}/1000</span>
            </div>
          </div>
          
          {/* Priority and Status */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          {/* Due Date and Assignment */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                <Calendar size={16} className="inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
                min={format(new Date(), 'yyyy-MM-dd')}
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="assignedTo" className="form-label">
                <User size={16} className="inline mr-1" />
                Assign To
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="form-select"
                disabled={isLoading}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Time Estimation */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimatedHours" className="form-label">
                <Clock size={16} className="inline mr-1" />
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                className={`form-input ${errors.estimatedHours ? 'border-error-500' : ''}`}
                placeholder="0"
                min="0"
                max="1000"
                step="0.5"
                disabled={isLoading}
              />
              {errors.estimatedHours && (
                <div className="form-error">{errors.estimatedHours}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="actualHours" className="form-label">
                <Clock size={16} className="inline mr-1" />
                Actual Hours
              </label>
              <input
                type="number"
                id="actualHours"
                name="actualHours"
                value={formData.actualHours}
                onChange={handleChange}
                className={`form-input ${errors.actualHours ? 'border-error-500' : ''}`}
                placeholder="0"
                min="0"
                max="1000"
                step="0.5"
                disabled={isLoading}
              />
              {errors.actualHours && (
                <div className="form-error">{errors.actualHours}</div>
              )}
            </div>
          </div>
          
          {/* Tags */}
          <div className="form-group">
            <label htmlFor="newTag" className="form-label">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                id="newTag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="form-input flex-1"
                placeholder="Add a tag..."
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-secondary"
                disabled={isLoading || !newTag.trim()}
              >
                Add
              </button>
            </div>
            
            {/* Tag List */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-primary-600 hover:text-primary-800"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner-small mr-2"></div>
                  {task ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  {task ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;