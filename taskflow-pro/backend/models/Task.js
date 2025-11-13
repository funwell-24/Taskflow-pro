const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    minlength: [1, 'Title must not be empty']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'],
      message: 'Status must be: pending, in-progress, completed, cancelled, or on-hold'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be: low, medium, high, or urgent'
    },
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date) {
        if (!date) return true; // Optional field
        return date > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(userId) {
        if (!userId) return true; // Optional field
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return !!user && user.isActive;
      },
      message: 'Assigned user must be an active user'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task creator is required'],
    validate: {
      validator: async function(userId) {
        const User = mongoose.model('User');
        const user = await User.findById(userId);
        return !!user && user.isActive;
      },
      message: 'Creator must be an active user'
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number, // in bytes
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000'],
    default: 0
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    max: [1000, 'Actual hours cannot exceed 1000'],
    default: 0
  },
  completedAt: {
    type: Date,
    validate: {
      validator: function(date) {
        if (!date) return true; // Optional field
        return date <= new Date();
      },
      message: 'Completion date cannot be in the future'
    }
  },
  timeLogs: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: { // in minutes
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute']
    },
    description: {
      type: String,
      maxlength: [200, 'Time log description cannot exceed 200 characters']
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    loggedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    }
  }],
  reminders: [{
    type: Date,
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Reminder must be in the future'
    }
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Calculate virtual fields for JSON output
      ret.isOverdue = doc.isOverdue;
      ret.timeSpent = doc.timeSpent;
      ret.progress = doc.progress;
      return ret;
    }
  },
  toObject: {
    virtuals: true
  }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual for total time spent
taskSchema.virtual('timeSpent').get(function() {
  return this.timeLogs.reduce((total, log) => total + log.duration, 0);
});

// Virtual for progress percentage
taskSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'cancelled') return 0;
  
  if (this.estimatedHours > 0 && this.actualHours > 0) {
    return Math.min(Math.round((this.actualHours / this.estimatedHours) * 100), 100);
  }
  
  // Default progress based on status
  const statusProgress = {
    'pending': 0,
    'in-progress': 50,
    'on-hold': 25,
    'completed': 100,
    'cancelled': 0
  };
  
  return statusProgress[this.status] || 0;
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ isArchived: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ 'attachments.uploadedAt': -1 });
taskSchema.index({ title: 'text', description: 'text' }); // Text search index

// Compound indexes for common queries
taskSchema.index({ createdBy: 1, isArchived: 1, dueDate: 1 });
taskSchema.index({ assignedTo: 1, isArchived: 1, status: 1 });
taskSchema.index({ status: 1, priority: 1, dueDate: 1 });

// Pre-save middleware to handle completion
taskSchema.pre('save', function(next) {
  // Set completedAt when task is marked as completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Clear completedAt if task is no longer completed
  if (this.status !== 'completed' && this.completedAt) {
    this.completedAt = null;
  }
  
  // Set archivedAt when task is archived
  if (this.isArchived && !this.archivedAt) {
    this.archivedAt = new Date();
  }
  
  next();
});

// Pre-save middleware to update user statistics
taskSchema.pre('save', async function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    try {
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(
        this.createdBy,
        { $inc: { 'statistics.tasksCompleted': 1 } }
      );
    } catch (error) {
      console.error('Error updating user statistics:', error);
    }
  }
  next();
});

// Instance method to add a time log
taskSchema.methods.addTimeLog = async function(timeLogData) {
  this.timeLogs.push(timeLogData);
  
  // Update actual hours
  this.actualHours = this.timeLogs.reduce((total, log) => total + (log.duration / 60), 0);
  
  await this.save();
  return this;
};

// Instance method to add a comment
taskSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData);
  await this.save();
  return this.comments[this.comments.length - 1];
};

// Instance method to update a comment
taskSchema.methods.updateComment = async function(commentId, content, userId) {
  const comment = this.comments.id(commentId);
  
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  // Check if user owns the comment
  if (comment.user.toString() !== userId.toString()) {
    throw new Error('Not authorized to update this comment');
  }
  
  comment.content = content;
  comment.updatedAt = new Date();
  comment.isEdited = true;
  
  await this.save();
  return comment;
};

// Instance method to add an attachment
taskSchema.methods.addAttachment = async function(attachmentData) {
  this.attachments.push(attachmentData);
  await this.save();
  return this.attachments[this.attachments.length - 1];
};

// Instance method to remove an attachment
taskSchema.methods.removeAttachment = async function(attachmentId) {
  this.attachments = this.attachments.filter(
    attachment => attachment._id.toString() !== attachmentId
  );
  await this.save();
};

// Instance method to archive task
taskSchema.methods.archive = async function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  await this.save();
};

// Instance method to unarchive task
taskSchema.methods.unarchive = async function() {
  this.isArchived = false;
  this.archivedAt = null;
  await this.save();
};

// Static method to find overdue tasks
taskSchema.statics.findOverdueTasks = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $in: ['pending', 'in-progress', 'on-hold'] },
    isArchived: false
  }).populate('assignedTo', 'name email avatar').populate('createdBy', 'name email');
};

// Static method to get task statistics
taskSchema.statics.getTaskStats = async function(userId = null) {
  const matchStage = { isArchived: false };
  if (userId) {
    matchStage.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$status', 'cancelled'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        totalEstimatedHours: { $sum: '$estimatedHours' },
        totalActualHours: { $sum: '$actualHours' },
        tasksByStatus: {
          $push: {
            status: '$status',
            priority: '$priority'
          }
        }
      }
    },
    {
      $project: {
        totalTasks: 1,
        completedTasks: 1,
        overdueTasks: 1,
        completionRate: {
          $cond: [
            { $eq: ['$totalTasks', 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 2] }
          ]
        },
        totalEstimatedHours: 1,
        totalActualHours: 1,
        efficiency: {
          $cond: [
            { $eq: ['$totalEstimatedHours', 0] },
            0,
            { $round: [{ $multiply: [{ $divide: ['$totalActualHours', '$totalEstimatedHours'] }, 100] }, 2] }
          ]
        },
        statusBreakdown: {
          $arrayToObject: {
            $map: {
              input: ['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'],
              as: 'status',
              in: {
                k: '$$status',
                v: {
                  $size: {
                    $filter: {
                      input: '$tasksByStatus',
                      as: 'task',
                      cond: { $eq: ['$$task.status', '$$status'] }
                    }
                  }
                }
              }
            }
          }
        },
        priorityBreakdown: {
          $arrayToObject: {
            $map: {
              input: ['low', 'medium', 'high', 'urgent'],
              as: 'priority',
              in: {
                k: '$$priority',
                v: {
                  $size: {
                    $filter: {
                      input: '$tasksByStatus',
                      as: 'task',
                      cond: { $eq: ['$$task.priority', '$$priority'] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : null;
};

// Static method to search tasks with text
taskSchema.statics.searchTasks = function(searchTerm, userId) {
  const matchStage = {
    $text: { $search: searchTerm },
    isArchived: false
  };

  if (userId) {
    matchStage.$or = [
      { createdBy: userId },
      { assignedTo: userId }
    ];
  }

  return this.find(matchStage)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ score: { $meta: 'textScore' } });
};

// Query helper to exclude archived tasks by default
taskSchema.pre(/^find/, function(next) {
  if (!this.getOptions().includeArchived) {
    this.where({ isArchived: false });
  }
  next();
});

// Query helper to populate common fields
taskSchema.pre(/^find/, function(next) {
  this.populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email');
  next();
});

module.exports = mongoose.model('Task', taskSchema);