 TaskFlow Pro - Advanced Task Management System
https://img.shields.io/badge/MERN-Stack-brightgreen
https://img.shields.io/badge/Version-1.0.0-blue
https://img.shields.io/badge/License-MIT-green

A modern, full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js). Organize, track, and complete your tasks efficiently with a beautiful, responsive interface.

✨ Live Demo
🌐 Frontend Application: https://taskflow-pro-jbzu-mn5o57fi6-fabians-projects-1fd08ff3.vercel.app

🔗 Backend API: https://taskflow-pro-8omk.onrender.com



🎯 Features
🔐 Authentication & Security
User Registration & Login with JWT tokens

Password Encryption using bcryptjs

Protected Routes with role-based access

Session Management with secure token storage

📝 Task Management
Create, Read, Update, Delete tasks

Task Status Tracking (Pending, In Progress, Completed, Cancelled)

Priority Levels (Low, Medium, High, Urgent)

Due Date Management with overdue indicators

Task Assignments to team members

File Attachments for task documentation

Comments & Discussions on tasks

Time Tracking with estimated vs actual hours

🎨 User Experience
Responsive Design that works on all devices

Dark/Light Theme support

Real-time Updates with instant feedback

Advanced Filtering and search capabilities

Drag & Drop interface for task organization

Keyboard Shortcuts for power users

📊 Analytics & Reporting
Dashboard Overview with task statistics

Progress Tracking with visual indicators

Performance Metrics and completion rates

Team Productivity insights

🛠️ Technology Stack
Frontend
React 18 - Modern UI library

Vite - Fast build tool and dev server

React Router DOM - Client-side routing

Axios - HTTP client for API calls

Lucide React - Beautiful icons

React Hot Toast - User notifications

Context API - State management

CSS3 - Custom responsive design

Backend
Node.js - Runtime environment

Express.js - Web application framework

MongoDB - NoSQL database

Mongoose - MongoDB object modeling

JWT - JSON Web Tokens for authentication

bcryptjs - Password hashing

Express Validator - Input validation

Multer - File upload handling

CORS - Cross-origin resource sharing

Helmet - Security headers

Deployment & DevOps
Vercel - Frontend hosting

Render - Backend hosting

MongoDB Atlas - Cloud database

GitHub Actions - CI/CD pipeline

Environment Variables - Secure configuration

🚀 Quick Start
Prerequisites
Node.js (v18 or higher)

MongoDB (local or Atlas)

Git

Installation
Clone the repository

bash
git clone https://github.com/your-username/taskflow-pro.git
cd taskflow-pro
Backend Setup

bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
Frontend Setup

bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
Access the application

Frontend: http://localhost:3000

Backend API: http://localhost:5000

Environment Variables
Backend (.env)

env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow-pro
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
Frontend (.env)

env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TaskFlow Pro
VITE_ENVIRONMENT=development
📁 Project Structure
text
taskflow-pro/
├── 📁 backend/
│   ├── 📁 controllers/     # Route controllers
│   ├── 📁 models/          # MongoDB models
│   ├── 📁 routes/          # API routes
│   ├── 📁 middleware/      # Custom middleware
│   ├── 📁 config/          # Database configuration
│   ├── 📁 uploads/         # File uploads directory
│   ├── server.js           # Entry point
│   └── package.json
├── 📁 frontend/
│   ├── 📁 public/          # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/  # Reusable components
│   │   ├── 📁 contexts/    # React contexts
│   │   ├── 📁 pages/       # Page components
│   │   ├── 📁 services/    # API services
│   │   ├── 📁 utils/       # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── vite.config.js      # Vite configuration
│   └── package.json
└── README.md
🔌 API Documentation
Authentication Endpoints
POST /api/auth/register - User registration

POST /api/auth/login - User login

GET /api/auth/me - Get current user

Task Endpoints
GET /api/tasks - Get all tasks (with filtering)

POST /api/tasks - Create new task

GET /api/tasks/:id - Get single task

PUT /api/tasks/:id - Update task

DELETE /api/tasks/:id - Delete task

GET /api/tasks/stats/overview - Get task statistics

User Endpoints
GET /api/users/profile - Get user profile

PUT /api/users/profile - Update user profile

PUT /api/users/preferences - Update user preferences

🎨 Features in Detail
Task Management
Smart Filtering: Filter by status, priority, due date, and assignee

Advanced Search: Search through task titles, descriptions, and tags

Bulk Operations: Update multiple tasks at once

Task Templates: Create templates for repetitive tasks

Collaboration
Team Assignments: Assign tasks to team members

Comment Threads: Discuss tasks with your team

File Sharing: Attach documents and images to tasks

Activity Logs: Track all changes and updates

Productivity
Time Tracking: Monitor time spent on tasks

Progress Indicators: Visual progress tracking

Due Date Reminders: Never miss a deadline

Priority Management: Focus on what matters most

🚀 Deployment
This project is configured for easy deployment:

Backend (Render)
Automatic deployments from GitHub

Environment variable management

Free tier available

Frontend (Vercel)
Instant deployments from GitHub

Global CDN distribution

Automatic SSL certificates

Database (MongoDB Atlas)
Cloud-hosted MongoDB

Automated backups

Scalable performance

