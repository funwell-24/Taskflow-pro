const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

module.exports = router;