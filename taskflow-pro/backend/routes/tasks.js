const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats
} = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed', 'cancelled', 'on-hold'])
    .withMessage('Invalid status'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Estimated hours must be between 0 and 1000')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID')
];

// Apply auth middleware to all routes
router.use(auth);

// Task routes
router.get('/', getTasks);
router.get('/stats/overview', getTaskStats);
router.get('/:id', idValidation, getTask);
router.post('/', taskValidation, createTask);
router.put('/:id', idValidation, updateTask);
router.delete('/:id', idValidation, deleteTask);

module.exports = router;