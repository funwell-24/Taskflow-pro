const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't include password in queries by default
    validate: {
      validator: function(password) {
        // At least one uppercase, one lowercase, one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  avatar: {
    type: String,
    default: null,
    validate: {
      validator: function(url) {
        if (!url) return true; // Optional field
        return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(url);
      },
      message: 'Please provide a valid image URL'
    }
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'manager'],
      message: 'Role must be either user, admin, or manager'
    },
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0,
    max: [5, 'Too many login attempts']
  },
  lockUntil: {
    type: Date,
    default: null
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: ''
    },
    phone: {
      type: String,
      validate: {
        validator: function(phone) {
          if (!phone) return true; // Optional field
          return /^\+?[\d\s\-\(\)]{10,}$/.test(phone);
        },
        message: 'Please provide a valid phone number'
      }
    },
    location: {
      city: String,
      country: String,
      timezone: String
    },
    socialLinks: {
      website: String,
      github: String,
      linkedin: String,
      twitter: String
    }
  },
  statistics: {
    tasksCreated: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 } // in minutes
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive information from JSON output
      delete ret.password;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for isLocked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes for better query performance
userSchema.index({ email: 1 }); // Unique index is automatically created for unique fields
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ 'preferences.theme': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost factor of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.passwordChangedAt = Date.now() - 1000; // 1 second in past to ensure token is created after
  }
  next();
});

// Instance method to check if password matches
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If account is locked, don't allow login
  if (this.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  // Handle login attempts
  if (!isMatch) {
    await this.handleFailedLogin();
    return false;
  }
  
  // Reset login attempts on successful login
  if (this.loginAttempts > 0 || this.lockUntil) {
    await this.resetLoginAttempts();
  }
  
  // Update last login
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
  
  return true;
};

// Instance method to handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
  this.loginAttempts += 1;
  
  // Lock account for 30 minutes after 5 failed attempts
  if (this.loginAttempts >= 5 && !this.isLocked) {
    this.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
  }
  
  await this.save({ validateBeforeSave: false });
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save({ validateBeforeSave: false });
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  const publicFields = [
    '_id', 'name', 'email', 'avatar', 'role', 'isVerified', 
    'preferences', 'profile', 'statistics', 'createdAt'
  ];
  
  const publicProfile = {};
  publicFields.forEach(field => {
    if (userObject[field] !== undefined) {
      publicProfile[field] = userObject[field];
    }
  });
  
  return publicProfile;
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find by email (including password for auth)
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email, isActive: true }).select('+password');
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
        admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        averageTasksCreated: { $avg: '$statistics.tasksCreated' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : null;
};

// Middleware to update statistics when user is referenced in tasks
userSchema.methods.incrementTasksCreated = async function() {
  this.statistics.tasksCreated += 1;
  await this.save({ validateBeforeSave: false });
};

userSchema.methods.incrementTasksCompleted = async function() {
  this.statistics.tasksCompleted += 1;
  await this.save({ validateBeforeSave: false });
};

// Query helper to exclude inactive users by default
userSchema.pre(/^find/, function(next) {
  // Only include active users in queries unless specifically excluded
  if (!this.getOptions().includeInactive) {
    this.where({ isActive: true });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);