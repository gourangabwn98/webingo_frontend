# Real-Time Collaborative Project Management Platform

A full-stack MERN application with real-time collaboration, role-based access control, and file uploads.

## Live Demo
- **Frontend**: [https://webingo-frontend.vercel.app](https://webingo-frontend.vercel.app)
- **Backend**: [https://webingo-assignment.onrender.com](https://webingo-assignment.onrender.com)

## Features Implemented
- JWT Authentication + Refresh Tokens
- Role-Based Access Control (Project Admin, Team Member, Viewer)
- Multi-tenant Project Management
- Advanced Task CRUD + Filtering + Bulk Operations
- Real-time updates using Socket.io
- File upload (Cloudinary)
- Responsive UI with Tailwind + React

## Tech Stack
- **Backend**: Node.js, Express, Socket.io, Mongoose, JWT
- **Frontend**: React, Redux Toolkit, Socket.io-client, Tailwind
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

## Setup Instructions (Local)

1. Clone the repo
2. Backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev