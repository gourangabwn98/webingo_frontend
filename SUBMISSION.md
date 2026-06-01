# Submission — CollabPM

**Candidate**: Gouranga
**Assignment**: MERN Stack Senior Developer Technical Assessment
**Company**: Webingo

---

## 🔗 Submission Links

| Item | URL |
|------|-----|
| 🌐 Live Frontend | https://webingo-frontend.vercel.app |
| ⚙️ Live Backend | https://webingo-assignment.onrender.com |
| 🏥 API Health | https://webingo-assignment.onrender.com/api/health |
| 📁 GitHub Backend Repo | https://github.com/gourangabwn98/Webingo_assignment |
| 📁 GitHub Frontend Repo | https://github.com/gourangabwn98/webingo_frontend |
 

---

## 🏗️ Key Architectural Decisions

### 1. Clean Architecture — Controllers → Services → Models
Controllers only handle HTTP request/response (status codes, JSON).
All business logic is in Services (auth.service.js, project.service.js, etc.).
This separation makes each layer independently testable and easy to modify.
Adding a new feature means writing a service method and wiring it — not touching controllers.

### 2. JWT with Refresh Token Rotation
Access tokens expire in 15 minutes — short enough to limit damage if stolen.
Refresh tokens (7 days) are httpOnly cookies — not accessible via JavaScript.
On every refresh, the old refresh token is invalidated and a new one is issued (rotation).
The Axios interceptor handles 401s silently — users are never unexpectedly logged out.
A request queue prevents race conditions when multiple calls fail simultaneously.

### 3. Room-based Socket.io Architecture
Users emit `join:project` when opening a project page and `leave:project` on unmount.
Server broadcasts events only to that project's room — not to all connected users.
Socket.io connections are authenticated via JWT in the handshake `auth` object.
This is efficient and secure — users only receive events for projects they are members of.

### 4. RBAC Enforced at Two Layers
Backend: `loadProjectMember` middleware attaches the user's role to `req.memberRole`.
`requireRole(...roles)` middleware then guards each route independently.
Frontend: `useProjectRole()` hook reads the project's member list and derives permissions.
UI elements (buttons, checkboxes) are conditionally rendered based on the role.
Security is never dependent on the frontend — the backend enforces rules regardless.

### 5. Cloudinary via multer-storage-cloudinary
Files go directly from the request to Cloudinary — no disk I/O on the server.
File type whitelist and 5MB limit enforced in multer config before upload.
Cloudinary `public_id` is stored in the Task model for later deletion.
On file delete, the Cloudinary asset is destroyed before removing from MongoDB.

### 6. In-memory Caching with node-cache
Project list endpoints are cached per user for 30 seconds.
Cache is invalidated (deleted) on any create, update, or delete operation.
This reduces MongoDB queries significantly for users who frequently switch views.
Chose node-cache over Redis for simplicity — Redis would be better for multi-instance.

---

## ⚡ Technical Challenges & Solutions

### Challenge 1: MongoDB DNS on Windows with Node v22
**Problem**: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.mkalv.mongodb.net`
MongoDB Atlas uses SRV DNS records. Windows DNS resolver + Node v22 has a bug
where it tries IPv6 first, fails, and doesn't fall back to IPv4.
**Solution**: Added `dns.setServers(["1.1.1.1"])` in `server.js` before any imports.
This forces Cloudflare's DNS resolver which correctly handles SRV records.

### Challenge 2: Tailwind CSS v4 Breaking Changes
**Problem**: Installed Tailwind v4 but used v3 config (`tailwind.config.js`,
`@tailwind base/components/utilities`). The CLI command `npx tailwindcss init`
failed because v4 removed it entirely.
**Solution**: Switched to `@tailwindcss/vite` plugin, replaced config with
`@theme {}` block in CSS, and used `@import "tailwindcss"` syntax.
No separate config file needed in v4.

### Challenge 3: Axios Token Refresh Race Condition
**Problem**: When the access token expires, multiple concurrent API calls all
return 401 simultaneously. Without handling, this triggers multiple refresh
requests which invalidates tokens and logs the user out.
**Solution**: Implemented a request queue in the Axios response interceptor.
The first 401 sets `isRefreshing = true` and makes one refresh call.
All subsequent 401s push a resolver into a queue array.
Once refresh completes, all queued requests retry with the new token.

### Challenge 4: Real-time State Consistency
**Problem**: When User A updates a task, User A's local Redux state updates
immediately (optimistic). But User B needs to see the same update via Socket.io.
If both update state from different sources, they can diverge.
**Solution**: Standardized on socket events as the source of truth.
After an API call succeeds, the server emits a socket event to the project room.
All clients (including the one who made the call) update Redux from the socket event.
This guarantees everyone sees the same state from the same data source.

### Challenge 5: Email on Windows Dev Environment
**Problem**: `Connection closed` error on SMTP port 587 — Windows firewall and
ISP-level blocking of outgoing SMTP ports is common.
**Solution**: Switched to Ethereal Email for development (auto-creates test accounts).
Email "sends" succeed and a preview URL is logged to the console.
In production (Render), real Gmail SMTP works because cloud servers aren't blocked.

---

## ⚖️ Trade-offs Due to Time Constraints

| Decision | What I Did | What I'd Do With More Time |
|----------|-----------|---------------------------|
| Caching | node-cache (in-memory) | Redis for persistence + multi-instance |
| Email queue | Synchronous in request | Bull queue for async background processing |
| File progress | No real-time progress | WebSocket-based upload progress bar |
| Testing | Critical path only | Full service unit tests + E2E with Playwright |
| Socket scaling | Single server | Socket.io Redis adapter for horizontal scaling |
| Access token | Returned in response body | httpOnly cookie only for better XSS protection |
| Role management | Set on invite only | UI to change member roles after joining |

---

## 🔮 What I Would Improve Given More Time

1. **Redis** — distributed caching + Socket.io adapter for horizontal scaling
2. **Bull Queue** — background jobs for emails, notifications, file processing
3. **Task Comments** — threaded comments with @mentions and real-time delivery
4. **Drag & Drop Kanban** — drag tasks between status columns
5. **Export** — download tasks as CSV or JSON
6. **Analytics Dashboard** — task counts by status, burndown chart, member activity
7. **Task Dependencies** — blocking relationships between tasks
8. **Notifications Center** — persistent notification history in the UI
9. **Docker** — containerized dev environment with docker-compose
10. **E2E Tests** — Playwright tests for critical user journeys

---

## 🧪 How to Test Real-time Features

1. Open **https://webingo-frontend.vercel.app** in Chrome
2. Open the same URL in Firefox (or an incognito window)
3. Register two different accounts
4. User A creates a project and invites User B
5. User B accepts the invitation via email link
6. Both users open the same project
7. User A creates a task → **User B sees it instantly**
8. User A updates the task status → **User B sees the change instantly**
9. User A deletes a task → **User B's list updates instantly**

No page refresh needed at any step.

---

## 📊 Performance Decisions

| Area | Implementation |
|------|---------------|
| DB Indexes | `userId`, `projectId`, `status`, `priority`, `dueDate`, `assignees`, `email` |
| API Caching | Project list cached 30s per user via node-cache |
| Pagination | All list endpoints paginated (default 20 items) |
| Code Splitting | Every route lazy-loaded with React.lazy + Suspense |
| Search | Debounced 400ms to prevent excessive API calls |
| DB Queries | `.lean()` for read-only queries, `.select()` to limit fields |
| File CDN | Cloudinary CDN for all uploaded files |
| Socket Rooms | Events scoped to project rooms — no global broadcasts |