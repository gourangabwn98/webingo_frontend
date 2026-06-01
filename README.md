# Collab PM — Collaborative Project Management

A full-stack real-time project management application built with the MERN stack, featuring role-based access control, WebSocket collaboration, file uploads, and email invitations.

- **Frontend (Live):** [https://webingo-frontend.vercel.app](https://webingo-frontend.vercel.app)
- **Backend API (Live):** [https://webingo-assignment.onrender.com](https://webingo-assignment.onrender.com)
- **Frontend Repo:** [https://github.com/gourangabwn98/webingo_frontend](https://github.com/gourangabwn98/webingo_frontend)
- **Backend Repo:** [https://github.com/gourangabwn98/Webingo_assignment](https://github.com/gourangabwn98/Webingo_assignment)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Folder Structure](#folder-structure)
4. [Setup Instructions](#setup-instructions)
5. [Environment Variables](#environment-variables)
6. [API Documentation](#api-documentation)
7. [WebSocket Events](#websocket-events)
8. [Deployment Guide](#deployment-guide)

---

## Project Overview

Collab PM is a real-time collaborative project management tool where teams can:

- Create and manage projects with role-based member access (Admin / Member / Viewer)
- Create, assign, and track tasks with statuses and priorities
- View a Kanban board or list view of tasks
- Upload and attach files to tasks via Cloudinary
- Invite team members via email with token-based invitation links
- See live updates as teammates make changes (via Socket.IO)
- View activity logs per project

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router v6, Tailwind CSS, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas with Mongoose ODM |
| Real-time | Socket.IO |
| File Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Auth | JWT (access + refresh token pattern) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture Decisions

### 1. Dual JWT Token Strategy (Access + Refresh)
Access tokens expire in 15 minutes to minimize exposure if stolen. Refresh tokens (7-day TTL) allow seamless re-authentication without forcing the user to log in again. The refresh token is stored in an HTTP-only cookie (not localStorage) to protect against XSS attacks. The access token is kept in Redux state (memory only).

**Why not a single long-lived token?** Long-lived JWTs cannot be revoked without a blocklist. Short access tokens limit the damage window if intercepted.

### 2. Role-Based Access Control (RBAC) via Middleware
Three roles are enforced at the middleware layer (`rbac.middleware.js`) rather than inside controllers:

- **Admin** — full CRUD on project, tasks, members; can invite and remove members
- **Member** — can create/edit/delete own tasks
- **Viewer** — read-only access

This keeps controllers clean and makes permission logic easy to audit in one place.

### 3. Service Layer Pattern
Business logic lives in `/services`, not in controllers. Controllers handle HTTP request/response only; services handle DB queries, external API calls, and complex logic. This makes the codebase testable (services can be unit-tested independently) and keeps controllers thin.

### 4. Socket.IO Room-Based Broadcasting
Each project has its own Socket.IO room (`project:<id>`). When a user opens a project, the frontend joins that room. All task and project mutations emit events only to that room — not to all connected clients. This scales cleanly without broadcasting noise globally.

### 5. Cloudinary for File Storage
Files are uploaded to Cloudinary instead of stored on the server filesystem. This is essential for stateless deployment on platforms like Render, where the filesystem is ephemeral. Cloudinary also provides CDN delivery and image transformation out of the box.

### 6. Centralised Error Handling
`ApiError.js` is a custom error class. All thrown errors go through `error.middleware.js`, which formats a consistent JSON response. This means controllers never need to manually set status codes or craft error bodies.

### 7. Redux Toolkit for Frontend State
RTK is used instead of plain Redux to reduce boilerplate. Each feature (auth, projects, tasks, socket) has its own slice. API calls are made with plain async thunks (not RTK Query) because the app has complex side effects (socket emissions after mutations) that are awkward to express in RTK Query's lifecycle hooks.

### 8. Optimistic UI Updates
After task creation, the new task is dispatched to Redux state immediately (`addTask`) rather than waiting for a full `loadTasks` refetch. This makes the UI feel instant. The same applies to bulk operations, which refetch after the API resolves.

### 9. Rate Limiting
`rateLimiter.middleware.js` applies per-IP rate limits on auth routes (login, register, forgot-password) to prevent brute-force attacks. General API routes have a looser limit to prevent abuse without impacting normal usage.

### 10. Input Validation with Dedicated Validators
All incoming request bodies are validated via `validators/` using a schema-based approach before reaching controllers. `validate.middleware.js` runs the validator and returns a structured 400 response on failure, so controllers can assume inputs are clean.

---

## Folder Structure

```
collab-pm/
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection (mongoose.connect)
│   │   │   ├── cloudinary.js      # Cloudinary SDK config
│   │   │   └── nodemailer.js      # SMTP transporter config
│   │   ├── controllers/           # HTTP request handlers (thin — delegate to services)
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── file.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js      # Verifies JWT access token
│   │   │   ├── rbac.middleware.js      # Checks project role (admin/member/viewer)
│   │   │   ├── error.middleware.js     # Global error handler → consistent JSON
│   │   │   ├── rateLimiter.middleware.js  # express-rate-limit config
│   │   │   └── validate.middleware.js  # Runs Joi/Zod schema validators
│   │   ├── models/
│   │   │   ├── User.model.js           # email, password (hashed), avatar, refreshToken
│   │   │   ├── Project.model.js        # name, description, status, members[{user, role}]
│   │   │   ├── Task.model.js           # title, status, priority, assignees, attachments, dueDate
│   │   │   ├── ActivityLog.model.js    # user, project, action, meta (for audit trail)
│   │   │   └── Invitation.model.js     # token, email, projectId, role, expiresAt
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── task.routes.js
│   │   │   └── file.routes.js
│   │   ├── services/                   # All business logic lives here
│   │   │   ├── auth.service.js         # register, login, refresh, password reset
│   │   │   ├── project.service.js      # CRUD, invite, member management
│   │   │   ├── task.service.js         # CRUD, bulk ops, filters, sorting
│   │   │   ├── file.service.js         # Cloudinary upload/delete
│   │   │   └── email.service.js        # Sends invitation and reset emails
│   │   ├── socket/
│   │   │   ├── index.js               # Socket.IO init, auth middleware, room management
│   │   │   └── handlers/
│   │   │       ├── project.handler.js  # project:update, member events
│   │   │       └── task.handler.js     # task:create, task:update, task:delete events
│   │   ├── utils/
│   │   │   ├── ApiError.js            # Custom error class with statusCode + message
│   │   │   ├── ApiResponse.js         # Standardised success response wrapper
│   │   │   ├── generateTokens.js      # Signs and returns access + refresh JWTs
│   │   │   └── cache.js               # In-memory cache utility (e.g. for rate-limiting data)
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── project.validator.js
│   │   │   └── task.validator.js
│   │   └── app.js                     # Express app setup: CORS, body-parser, routes, error handler
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── task.test.js
│   │   └── file.test.js
│   ├── .env.example
│   ├── package.json
│   └── server.js                      # Entry point: HTTP + Socket.IO server boot
│
└── client/                            # React frontend (Vite)
    ├── src/
    │   ├── app/
    │   │   └── store.js               # Redux store with combined reducers
    │   ├── features/
    │   │   ├── auth/                  # authSlice (user state) + authApi (axios calls)
    │   │   ├── projects/              # projectsSlice + projectsApi
    │   │   ├── tasks/                 # tasksSlice (tasks, filters, selected) + tasksApi
    │   │   └── socket/               # socketSlice (connection status)
    │   ├── hooks/
    │   │   ├── useSocket.js           # Manages socket connection lifecycle, exposes join/leave
    │   │   └── useAuth.js             # Reads auth state, handles token refresh on mount
    │   ├── components/
    │   │   ├── ui/                    # Reusable primitives (Button, Modal, Badge, Avatar…)
    │   │   ├── layout/               # Sidebar, Navbar, AppLayout (authenticated shell)
    │   │   ├── auth/                 # ProtectedRoute wrapper
    │   │   ├── projects/             # ProjectCard, ProjectForm, InviteMemberModal
    │   │   └── tasks/                # TaskCard, TaskForm, TaskFilters, TaskBoard, FileUpload
    │   ├── pages/                     # Route-level page components
    │   ├── services/
    │   │   └── api.js                 # Axios instance with base URL + interceptors (auto refresh)
    │   └── utils/
    │       ├── constants.js           # PROJECT_ROLES, STATUS_OPTIONS, PRIORITY_OPTIONS
    │       └── helpers.js             # timeAgo, formatBytes, truncate, etc.
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Setup Instructions

### Prerequisites

- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Gmail account with App Password enabled

### 1. Clone the repositories

```bash
# Backend
git clone https://github.com/gourangabwn98/Webingo_assignment.git
cd Webingo_assignment

# Frontend (separate repo)
git clone https://github.com/gourangabwn98/webingo_frontend.git
cd webingo_frontend
```

### 2. Backend setup

```bash
cd server
npm install

# Copy the example env file and fill in your values
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev        # development with nodemon
# or
npm start          # production
```

The server starts on `http://localhost:5005` by default.

### 3. Frontend setup

```bash
cd client
npm install

# Create frontend env file
cp .env.example .env
```

Set `VITE_API_URL` and `VITE_SOCKET_URL` in `.env`:

```env
VITE_API_URL=http://localhost:5005/api
VITE_SOCKET_URL=http://localhost:5005
```

Then:

```bash
npm run dev        # starts Vite dev server on http://localhost:5173
npm run build      # production build → dist/
```

### 4. Run tests (backend)

```bash
cd server
npm test
```

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | Yes | HTTP server port | `5005` |
| `NODE_ENV` | Yes | Environment mode | `development` / `production` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens | any long random string |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing refresh tokens | any long random string (different from access) |
| `JWT_ACCESS_EXPIRES` | Yes | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES` | Yes | Refresh token TTL | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name | `dp7d403x7` |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | `657227726713375` |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | `yCGya8_9c-...` |
| `SMTP_HOST` | Yes | SMTP mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | Yes | SMTP port | `465` (SSL) or `587` (TLS) |
| `SMTP_USER` | Yes | SMTP login email | `your@gmail.com` |
| `SMTP_PASS` | Yes | Gmail App Password | 16-character app password |
| `EMAIL_FROM` | Yes | Sender display name + address | `"Collab PM <noreply@example.com>"` |
| `CLIENT_URL` | Yes | Frontend origin (for CORS + email links) | `https://webingo-frontend.vercel.app` |

> **Gmail App Password:** Go to Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail". Use that 16-character password as `SMTP_PASS`.

### Frontend (`client/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Yes | Backend REST API base URL | `https://webingo-assignment.onrender.com/api` |
| `VITE_SOCKET_URL` | Yes | Backend Socket.IO origin | `https://webingo-assignment.onrender.com` |

---

## API Documentation

All endpoints are prefixed with `/api`. Authenticated routes require the header:

```
Authorization: Bearer <access_token>
```

Successful responses follow this shape:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

### Auth Routes — `/api/auth`

#### `POST /api/auth/register`

Register a new user.

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
    "accessToken": "eyJ..."
  }
}
```

---

#### `POST /api/auth/login`

**Request body:**
```json
{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "avatar": null },
    "accessToken": "eyJ..."
  }
}
```

> Refresh token is set as an HTTP-only cookie automatically.

---

#### `POST /api/auth/logout`

Clears the refresh token cookie and invalidates the session. No body required. Requires auth.

**Response `200`:**
```json
{ "success": true, "message": "Logged out" }
```

---

#### `POST /api/auth/refresh`

Uses the HTTP-only cookie to issue a new access token. No body required.

**Response `200`:**
```json
{
  "success": true,
  "data": { "accessToken": "eyJ..." }
}
```

---

#### `POST /api/auth/forgot-password`

Sends a password reset email.

**Request body:**
```json
{ "email": "john@example.com" }
```

**Response `200`:**
```json
{ "success": true, "message": "Reset link sent to email" }
```

---

#### `POST /api/auth/reset-password/:token`

**Request body:**
```json
{ "password": "NewStrongPass456" }
```

**Response `200`:**
```json
{ "success": true, "message": "Password reset successful" }
```

---

#### `GET /api/auth/me`

Returns the currently authenticated user. Requires auth.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "avatar": "https://..." }
  }
}
```

---

### Project Routes — `/api/projects`

All project routes require auth.

#### `GET /api/projects`

Returns all projects the authenticated user is a member of.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "proj_id",
        "name": "Website Redesign",
        "description": "...",
        "status": "active",
        "members": [
          { "user": { "_id": "...", "name": "John", "email": "john@example.com" }, "role": "admin" }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `POST /api/projects`

Create a new project. The creator is automatically assigned the `admin` role.

**Request body:**
```json
{
  "name": "Website Redesign",
  "description": "Redesigning the company website"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": { "project": { "_id": "...", "name": "Website Redesign", "status": "active", "members": [...] } }
}
```

---

#### `GET /api/projects/:id`

Get a single project by ID. User must be a member.

**Response `200`:**
```json
{
  "success": true,
  "data": { "project": { "_id": "...", "name": "...", "description": "...", "status": "active", "members": [...] } }
}
```

---

#### `PATCH /api/projects/:id`

Update project name, description, or status. Requires `admin` role.

**Request body (any subset):**
```json
{
  "name": "New Name",
  "description": "Updated description",
  "status": "archived"
}
```

**Response `200`:**
```json
{ "success": true, "data": { "project": { ... } } }
```

---

#### `DELETE /api/projects/:id`

Delete a project and all its tasks. Requires `admin` role.

**Response `200`:**
```json
{ "success": true, "message": "Project deleted" }
```

---

#### `POST /api/projects/:id/invite`

Send an email invitation to join the project. Requires `admin` role.

**Request body:**
```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response `200`:**
```json
{ "success": true, "message": "Invitation sent" }
```

---

#### `POST /api/projects/invite/accept/:token`

Accept a project invitation via the emailed token. Requires auth (the invited user must be logged in).

**Response `200`:**
```json
{ "success": true, "message": "Joined project", "data": { "project": { ... } } }
```

---

#### `DELETE /api/projects/:id/members/:userId`

Remove a member from the project. Requires `admin` role.

**Response `200`:**
```json
{ "success": true, "message": "Member removed" }
```

---

#### `GET /api/projects/:id/activity`

Get the activity log for a project. Requires membership.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "...",
        "user": { "_id": "...", "name": "John" },
        "action": "task_created",
        "meta": { "title": "Fix login bug" },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Task Routes — `/api/projects/:projectId/tasks`

All task routes require auth and membership in the project.

#### `GET /api/projects/:projectId/tasks`

Get tasks for a project. Supports query params for filtering and sorting.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `status` | string | `todo` / `in_progress` / `completed` |
| `priority` | string | `low` / `medium` / `high` |
| `search` | string | Search in task title |
| `sortBy` | string | Field to sort by (e.g. `createdAt`, `dueDate`, `priority`) |
| `sortOrder` | string | `asc` or `desc` |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_id",
      "title": "Fix login bug",
      "description": "...",
      "status": "in_progress",
      "priority": "high",
      "assignees": [{ "_id": "...", "name": "John", "avatar": null }],
      "dueDate": "2024-02-01T00:00:00.000Z",
      "attachments": [],
      "createdAt": "2024-01-10T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/projects/:projectId/tasks`

Create a new task. Requires `admin` or `member` role.

**Request body:**
```json
{
  "title": "Fix login bug",
  "description": "Users can't log in with Google OAuth",
  "status": "todo",
  "priority": "high",
  "assignees": ["user_id_1", "user_id_2"],
  "dueDate": "2024-02-01"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": { "task": { "_id": "...", "title": "Fix login bug", ... } }
}
```

---

#### `GET /api/projects/:projectId/tasks/:taskId`

Get a single task by ID.

**Response `200`:**
```json
{
  "success": true,
  "data": { "task": { "_id": "...", "title": "...", "attachments": [...], ... } }
}
```

---

#### `PATCH /api/projects/:projectId/tasks/:taskId`

Update a task. Requires `admin` or `member` role.

**Request body (any subset):**
```json
{
  "title": "Updated title",
  "status": "completed",
  "priority": "low",
  "assignees": ["user_id_1"],
  "dueDate": "2024-03-01"
}
```

**Response `200`:**
```json
{ "success": true, "data": { "task": { ... } } }
```

---

#### `DELETE /api/projects/:projectId/tasks/:taskId`

Delete a task. Requires `admin` role.

**Response `200`:**
```json
{ "success": true, "message": "Task deleted" }
```

---

#### `PATCH /api/projects/:projectId/tasks/bulk-update`

Update multiple tasks at once. Requires `admin` or `member` role.

**Request body:**
```json
{
  "taskIds": ["task_id_1", "task_id_2"],
  "update": { "status": "completed" }
}
```

**Response `200`:**
```json
{ "success": true, "message": "Tasks updated" }
```

---

#### `DELETE /api/projects/:projectId/tasks/bulk-delete`

Delete multiple tasks. Requires `admin` role.

**Request body:**
```json
{
  "taskIds": ["task_id_1", "task_id_2"]
}
```

**Response `200`:**
```json
{ "success": true, "message": "Tasks deleted" }
```

---

### File Routes — `/api/files`

#### `POST /api/files/upload`

Upload a file attachment. Requires auth. File is sent as `multipart/form-data`.

**Request:** `multipart/form-data` with field `file`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/dp7d403x7/image/upload/...",
    "publicId": "collab-pm/abc123",
    "name": "screenshot.png",
    "size": 204800,
    "type": "image/png"
  }
}
```

---

#### `DELETE /api/files/:publicId`

Delete a file from Cloudinary. Requires auth. The `publicId` must be URL-encoded.

**Response `200`:**
```json
{ "success": true, "message": "File deleted" }
```

---

## WebSocket Events

The app uses Socket.IO. The client connects with the access token:

```js
const socket = io(SOCKET_URL, {
  auth: { token: accessToken }
})
```

### Joining / Leaving a Project Room

```js
// Join
socket.emit('project:join', projectId)

// Leave
socket.emit('project:leave', projectId)
```

### Events Emitted by Server

| Event | Payload | Description |
|---|---|---|
| `task:created` | `{ task }` | A new task was created in the project |
| `task:updated` | `{ task }` | A task was updated |
| `task:deleted` | `{ taskId }` | A task was deleted |
| `project:updated` | `{ project }` | Project metadata changed |
| `member:invited` | `{ email, role }` | New invitation sent |
| `member:removed` | `{ userId }` | A member was removed |

### Events Emitted by Client

| Event | Payload | Description |
|---|---|---|
| `project:join` | `projectId` | Subscribe to project room |
| `project:leave` | `projectId` | Unsubscribe from project room |

---

## Deployment Guide

### Backend — Render

1. Push the `server/` directory to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set the **Build Command** to `npm install` and **Start Command** to `node server.js`.
4. Add all environment variables from the [Environment Variables](#environment-variables) table in the Render dashboard under **Environment**.
5. Set `NODE_ENV=production` and `CLIENT_URL` to your Vercel frontend URL.
6. Deploy. Render gives you a public URL like `https://your-app.onrender.com`.

> **Note:** Render free-tier services spin down after inactivity. The first request after idle may take 30–60 seconds (cold start). Upgrade to a paid plan to avoid this.

### Frontend — Vercel

1. Push the `client/` directory to GitHub.
2. Import the repository on [vercel.com](https://vercel.com).
3. Set the **Framework Preset** to `Vite`.
4. Add environment variables:
   - `VITE_API_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-app.onrender.com`
5. Deploy. Vercel handles the build automatically.

### CORS Configuration

In `server/src/app.js`, the CORS origin must match `CLIENT_URL`:

```js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true   // required for HTTP-only refresh token cookie
}))
```

If you add a custom domain, update `CLIENT_URL` in Render environment variables.

### MongoDB Atlas

1. Create a free cluster on [cloud.mongodb.com](https://cloud.mongodb.com).
2. Under **Network Access**, add `0.0.0.0/0` to allow connections from Render (or restrict to Render's IP range).
3. Create a database user and copy the connection string into `MONGO_URI`.

### Running in Production Locally

```bash
cd server
NODE_ENV=production npm start
```

```bash
cd client
npm run build
npm run preview    # serves the dist/ folder locally
```

---

## Code Comments for Complex Logic

### `generateTokens.js` — Why two tokens?

```js
// Access token: short-lived (15m), stored in memory (Redux state)
// Protects against CSRF — not in a cookie, so no CSRF risk
const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
  expiresIn: process.env.JWT_ACCESS_EXPIRES
})

// Refresh token: long-lived (7d), stored in HTTP-only cookie
// HTTP-only = inaccessible to JavaScript = protected from XSS
const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
  expiresIn: process.env.JWT_REFRESH_EXPIRES
})
```

### `api.js` — Axios interceptor for silent token refresh

```js
// On any 401 response, try to get a new access token using the refresh cookie.
// If refresh succeeds, retry the original request transparently.
// If refresh fails (cookie expired/invalid), redirect to login.
axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post('/auth/refresh', {}, { withCredentials: true })
        store.dispatch(setAccessToken(data.data.accessToken))
        original.headers['Authorization'] = `Bearer ${data.data.accessToken}`
        return axiosInstance(original)   // retry original request
      } catch {
        store.dispatch(logout())
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)
```

### `rbac.middleware.js` — Role hierarchy check

```js
// Roles are stored as strings on the project member subdocument.
// This middleware looks up the requesting user's role in the project's members array.
// It is used as: requireRole('admin') or requireRole('member', 'admin')
// Viewer role can read but all write operations require at minimum 'member'.
const requireRole = (...roles) => async (req, res, next) => {
  const project = await Project.findById(req.params.id)
  const member = project.members.find(m => m.user.toString() === req.user._id.toString())
  if (!member || !roles.includes(member.role)) {
    throw new ApiError(403, 'Insufficient permissions')
  }
  req.projectRole = member.role   // makes role available to controllers downstream
  next()
}
```

### `socket/index.js` — Authenticating socket connections

```js
// Socket connections carry the access token in the handshake auth object.
// This runs before the connection is established — unauthenticated sockets are rejected.
io.use((socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token) return next(new Error('Unauthorized'))
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    socket.userId = decoded.id
    next()
  } catch {
    next(new Error('Invalid token'))
  }
})
```

### `tasksSlice.js` — Why `selectAll` is in Redux

```js
// selectAll dispatches an action that sets selected = all task IDs from current state.
// This avoids prop-drilling the full task list into every component that needs "select all".
// The tasks array in the Redux store is the single source of truth for IDs.
selectAll: (state) => {
  state.selected = state.tasks.map(t => t._id)
}