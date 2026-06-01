## Key Architectural Decisions
- Chose Clean Architecture for better maintainability under time pressure.
- Used Socket.io rooms per project for efficient real-time updates.
- Implemented RBAC middleware to enforce permissions on every protected route.

## Technical Challenges & Solutions
- Real-time synchronization: Used optimistic updates on frontend + Socket.io broadcasting.
- Role management: Stored member roles inside Project model as array of objects.
- File security: Validated ownership before serving files.

## Trade-offs (Due to 48-hour limit)
- Skipped advanced analytics and task comments.
- Used Cloudinary instead of AWS S3 for faster setup.
- Focused heavily on core real-time and RBAC.

## What I Would Improve with More Time
- Add task comments with mentions
- Implement Redis for caching and rate limiting
- Add background jobs for email notifications
- Write more comprehensive tests

## Real-time Handling
Used project-based rooms and handled disconnects gracefully with reconnect logic.

Thank you for the opportunity!