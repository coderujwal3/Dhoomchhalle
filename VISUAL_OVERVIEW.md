# Dhoomchhalle - Visual Overview

## 1. Project Snapshot

Dhoomchhalle is a full-stack travel and stay planner focused on discovery, hotel browsing, profile management, reviews, favourites, reports, transport logs, and an admin control panel.

Current stack:

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4, Axios, Recharts |
| Backend | Express 5, Mongoose, JWT, bcrypt, express-validator, Helmet, CORS, express-rate-limit |
| Storage | MongoDB |
| Media/Email | Cloudinary, Nodemailer |

---

## 2. High-Level Architecture

```text
                           DHOOMCHHALLE

  +---------------------------------------------------------------+
  |                         CLIENT (React)                        |
  |---------------------------------------------------------------|
  | Public pages                                                  |
  | Auth pages                                                    |
  | User dashboard                                                |
  | Public user profile                                           |
  | Admin panel                                                   |
  +---------------------------+-----------------------------------+
                              |
                              | Axios API client
                              v
  +---------------------------------------------------------------+
  |                      SERVER (Express API)                     |
  |---------------------------------------------------------------|
  | Auth + session routes                                         |
  | Hotels                                                        |
  | Profile                                                       |
  | Reviews                                                       |
  | Favourites                                                    |
  | Reports                                                       |
  | Transport logs                                                |
  | Admin routes                                                  |
  +---------------------------+-----------------------------------+
                              |
                              v
  +---------------------------------------------------------------+
  |                         MongoDB Models                        |
  |---------------------------------------------------------------|
  | User, Profile, Hotel, Review, Report, Favourite,              |
  | TransportLog, TokenBlacklist, and admin-facing aggregates     |
  +---------------------------------------------------------------+
```

---

## 3. Frontend Route Map

Routes currently mounted in the main client router:

```text
/
|-- /                          -> Home
|-- /hotels                    -> Hotels list
|-- /hotels/:id                -> Hotel details
|-- /user/:id                  -> Public user profile
|-- /dashboard                 -> Protected user dashboard
|
|-- /login                     -> Guest-only login
|-- /register                  -> Guest-only register
|-- /forgot-password           -> Guest-only forgot password
|-- /reset-password/:token     -> Guest-only password reset
|
|-- /admin                     -> Protected admin dashboard
|   |-- /admin/users
|   |-- /admin/reviews
|   |-- /admin/reports
|   |-- /admin/analytics
|   `-- /admin/settings
|
`-- *                          -> NotFound
```

Present in the codebase but not currently mounted in the main router:

```text
/transport
/route-planner
/timings
```

---

## 4. Frontend Screen Hierarchy

```text
App
`-- AppRoutes
    |-- MainLayout
    |   |-- Home
    |   |-- Hotels
    |   |-- HotelDetails
    |   |-- UserProfile
    |   `-- ProtectedRoute
    |       `-- UserDashboard
    |
    |-- GuestOnlyRoute
    |   |-- Login
    |   |-- Register
    |   |-- ForgotPassword
    |   `-- ResetPassword
    |
    `-- AdminRouteShell
        `-- ProtectedAdminRoute
            `-- AdminLayout
                |-- AdminDashboard
                |-- AdminUsers
                |-- AdminReviews
                |-- AdminReports
                |-- AdminAnalytics
                `-- AdminSettings
```

User dashboard tabs currently represented in the UI:

```text
User Dashboard
|-- Profile
|-- Favorite Hotels
|-- My Reviews
|-- Transport
|-- Settings
`-- Reports
```

---

## 5. Backend Mounted API Map

These routes are currently registered in `server/app.js`:

```text
/health

/api/v1/auth
|-- GET    /me
|-- GET    /user/:id
|-- POST   /register
|-- POST   /login
|-- POST   /logout
|-- POST   /forgot-password
`-- POST   /reset-password/:token

/api/v1/hotels
|-- GET    /
`-- GET    /:id

/api/v1/profile
|-- GET    /me/profile
|-- PUT    /:userId
|-- PATCH  /me/avatar
`-- GET    /:userId

/api/v1/reviews
|-- GET    /hotel/:hotelId
|-- GET    /hotel/:hotelId/average-rating
|-- GET    /:reviewId
|-- POST   /
|-- GET    /me/reviews
|-- PUT    /:reviewId
|-- DELETE /:reviewId
`-- POST   /:reviewId/helpful

/api/v1/favourites
|-- POST   /
|-- DELETE /:hotelId
|-- GET    /me
|-- GET    /check/:hotelId
`-- GET    /count

/api/v1/reports
|-- POST   /
|-- GET    /me
|-- GET    /admin/all
`-- PUT    /:reportId

/api/v1/transport-logs
|-- POST   /
|-- GET    /me
|-- PUT    /:logId
`-- DELETE /:logId

/api/v1/admin
|-- GET    /dashboard/stats
|-- GET    /dashboard/activities
|-- GET    /dashboard/revenue
|-- GET    /users
|-- GET    /users/:userId
|-- PUT    /users/:userId/role
|-- DELETE /users/:userId
|-- POST   /users/:userId/suspend
|-- POST   /users/:userId/activate
|-- GET    /analytics/users
|-- GET    /analytics/hotels
|-- GET    /analytics/bookings
|-- GET    /analytics/reports
|-- GET    /reviews/pending
|-- POST   /reviews/:reviewId/approve
|-- POST   /reviews/:reviewId/reject
|-- GET    /reports
|-- POST   /reports/:reportId/resolve
|-- GET    /settings
`-- PUT    /settings
```

Backward compatibility:

```text
/api/auth/* -> same user auth router
```

---

## 6. Backend Modules Present But Not Mounted

These modules exist in the server codebase, but are not currently registered in `server/app.js`:

```text
server/modules/transport
server/modules/timing
server/modules/route
```

Meaning:

```text
- The code is present.
- The route handlers exist.
- The APIs are not currently exposed through the live Express app.
- The client also has placeholder pages for transport/timings/route planner that are not mounted.
```

---

## 7. Admin System Overview

The admin panel is now part of the main application router instead of being rendered separately.

```text
Admin access flow

Browser
  -> /admin/*
  -> ProtectedAdminRoute
  -> getSession()
  -> verify logged-in user role === admin
  -> render AdminLayout
  -> page-specific admin API calls
```

Admin screens:

| Route | Purpose |
|---|---|
| `/admin` | Stats, recent activity, chart overview |
| `/admin/users` | Search, filter, role updates, suspend, activate, delete |
| `/admin/reviews` | Pending review moderation |
| `/admin/reports` | Resolve system reports |
| `/admin/analytics` | User, hotel, booking, and report analytics |
| `/admin/settings` | System settings UI |

---

## 8. Security Model

Current security layers in the implemented project:

```text
Layer 1: Client route guards
- GuestOnlyRoute blocks auth pages for logged-in users
- ProtectedRoute blocks /dashboard
- ProtectedAdminRoute blocks /admin/*

Layer 2: Transport and headers
- Helmet enabled
- CORS allowlist enabled
- Cookies enabled with credentials
- JSON and form payload limits set to 5 MB

Layer 3: Auth middleware
- Read token from cookie or Bearer header
- Reject missing token
- Reject blacklisted token
- Verify JWT
- Reject deleted users
- Reject suspended users

Layer 4: Admin authorization
- Admin routes require authSystemUserMiddleware
- Role must be admin

Layer 5: Request validation
- express-validator on auth, reports, favourites, reviews, transport logs, profile updates
- rate limiting on login and forgot-password
- global rate limiting on the Express app
```

Important current hardening already reflected in code:

```text
- Self-registration cannot assign admin or verifier roles.
- New self-registered accounts are forced to role = traveller.
- Suspended users are blocked from login and protected routes.
- Public user lookup returns sanitized public fields instead of the full user document.
```

---

## 9. Core Data Flow

### 9.1 Standard User Flow

```text
Visitor
  -> Home / Hotels / Public profile
  -> Register or Login
  -> token stored client-side + cookie set by backend
  -> /dashboard
  -> Dashboard tabs call protected APIs
     - profile
     - favourites
     - reviews
     - reports
     - transport logs
```

### 9.2 Admin Flow

```text
Admin user
  -> Login
  -> /admin
  -> session check
  -> admin-only API calls
  -> moderation / analytics / user management
```

### 9.3 Password Reset Flow

```text
Forgot password form
  -> POST /api/v1/auth/forgot-password
  -> hashed reset token saved in DB
  -> email sent with client reset URL
  -> /reset-password/:token
  -> POST /api/v1/auth/reset-password/:token
```

---

## 10. Data Model Overview

Core collections represented in the server:

| Collection | Role in system |
|---|---|
| `users` | Accounts, roles, suspension, reset-password state |
| `profiles` | Public and private profile details, avatar data |
| `hotels` | Hotel discovery and details |
| `reviews` | User hotel reviews and moderation status |
| `reports` | User-submitted reports and admin resolutions |
| `favourites` | Saved hotels per user |
| `transportlogs` | User transport activity/log history |
| `tokenblacklists` | Invalidated JWT tokens after logout |

Related supporting models also exist for transport, route optimization, timings, and admin analytics support.

---

## 11. Current Implementation Status

### Actively wired end-to-end

```text
- Public landing page
- Authentication
- Password reset
- Hotels list and hotel details
- Public user profile
- User dashboard shell and dashboard tabs
- Profile API
- Review API
- Favourite API
- Report API
- Transport log API
- Admin panel
- Admin analytics and moderation endpoints
```

### Present in the repo but only partially wired

```text
- Transport public page
- Route planner page
- Timings page
- route / transport / timing backend modules
- AuthContext placeholder
```

### Important notes

```text
- The overview reflects actual mounted routes and server registration.
- Some UI/API areas still need deeper product-level completion, even though the structure exists.
- This project should not be described as "fully production-ready" without broader repo-wide cleanup, testing, and deployment validation.
```

---

## 12. Folder-Level Visual Map

```text
Dhoomchhalle/
|-- client/
|   |-- src/
|   |   |-- components/
|   |   |   |-- Admin/
|   |   |   |-- auth/
|   |   |   |-- common/
|   |   |   |-- hotels/
|   |   |   |-- reviews/
|   |   |   |-- transport/
|   |   |   |-- user-dashboard/
|   |   |   `-- user-profile/
|   |   |-- layouts/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- routes/
|   |   `-- services/
|   `-- package.json
|
`-- server/
    |-- config/
    |-- middlewares/
    |-- modules/
    |   |-- admin/
    |   |-- favourite/
    |   |-- hotel/
    |   |-- profile/
    |   |-- report/
    |   |-- review/
    |   |-- route/
    |   |-- timing/
    |   |-- transport/
    |   |-- transportLog/
    |   `-- user/
    |-- services/
    |-- utils/
    `-- package.json
```

---

## 13. Verification Snapshot

Recent implementation-level checks completed:

```text
- Targeted admin/auth client files pass ESLint
- Client production build succeeds
- Server app loads successfully
- Updated admin routing is wired through the main router
- Admin requests now use the shared API client
- Auth and user exposure rules were tightened on the backend
```

Project-wide follow-up still recommended:

```text
- Run and clean full-repo lint
- Add route-level integration tests
- Add API tests for auth, admin, and reports
- Decide whether transport/timing/route modules should be mounted or removed
- Replace placeholder context pieces with real shared state if needed
```

---

## 14. One-Line Summary

```text
Dhoomchhalle currently operates as a React + Express + MongoDB travel platform with a live public experience, user dashboard, and admin panel, while transport/timing/route features remain present in the repository but not fully wired into the mounted application.
```
