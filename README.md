# DHOOMCHHALLE - Travelling WebApp
I am planning to build a webapp with my legend team, building this for travellers named as "dhoomchhalle" which means latchers (who roam around).
Planning to give some facilities regarding the travel (currently planned only for 1 city "Varanasi").

## Problems:
- The travellers don't know the actual price of public transport (easily get trapped by these public transport drivers)
- Don't know the best routes for destination with effective cost and less time taken.
- Best hotels based on their budget, including some details like - phone numbers, photos of hotels, and many more (including previous users feedbacks)
- Public transport timings (AC electric city bus, Non-AC bus, janrath bus timings, trains timings)

## Solutions: Providing a platform which has-
- actual cost of public transport (including petrol auto, CNG auto, E-rikshaw, buses, ropeways)
- providing the live traffic analysed best route for the destination
- best hostels according to their choice and budget
- Public transport timings (buses and trains timings)

## Tech Stack:

### Frontend (Client)
- **Framework**: React 19.2.0 with Vite bundler
- **Routing**: React Router DOM 7.13.1
- **Styling**: Tailwind CSS 4.1.18 with dark theme support
- **UI Components**: Lucide React icons, React Hot Toast notifications
- **Charts & Visualization**: Recharts 2.12.0, Chart.js 4.4.0
- **Animations**: GSAP 3.14.2, Framer Motion (motion 12.35.0), Lenis smooth scrolling
- **Media**: Lottie animations (.json), React QR Code
- **HTTP Client**: Axios 1.13.5 with custom interceptors
- **Loading States**: React Spinners 0.17.0
- **Analytics**: Vercel Analytics & Speed Insights

### Backend (Server)
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.2.1 ODM
- **Authentication**: JWT (jsonwebtoken 9.0.3), Bcrypt 6.0.0 password hashing
- **Security**: Helmet.js, express-mongo-sanitize, express-rate-limit
- **Upload**: Multer 2.1.1 with Cloudinary integration
- **Email**: Nodemailer 8.0.4 for password reset flows
- **Input Validation**: Express Validator 7.3.1
- **Middleware**: Cookie Parser, CORS, Morgan logging
- **XSS Protection**: XSS library 1.0.15

### Mobile (Future)
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Emulator Support**: Android Studio (Pixel 5, 7 Pro, Tablet)

## 🚀 DHOOMCHHALLE – Core System Design
🧠 Core Modules
- **User Module** - Authentication, JWT, sessions, profiles
- **Admin Panel** - Dashboard, user management, moderation, analytics (NEW!)
- **Transport Module** - Prices, types, fare calculations
- **Route & Traffic Module** - Best routes, traffic analysis
- **Hotel/Hostel Module** - Listings, filters, details, verification
- **Feedback & Reviews** - User reviews, ratings, moderation
- **Timings Module** - Bus/Train schedules, real-time updates
- **Reports Module** - Issue reporting and tracking

## Authentication, session & user dashboard - (recent update)

### User dashboard
- Logged-in users can open **`/dashboard`** (protected route; requires a valid session).
- The dashboard loads profile data from **`GET /api/v1/auth/me`** (name, email, phone, role, member since).
- Quick links to browse hotels and return home; **Log out** calls **`POST /api/v1/auth/logout`** and clears the client-side token.
- Dashboard tabs are backed by dedicated APIs (profile, favourites, reviews, transport logs) and load lazily when a tab is opened.

### Features built today (what + 1-line working)
- **User Profile page (`/profile/:id`)**: fetches public user info + profile info in parallel and renders a rich profile UI (falls back to safe defaults if profile isn’t found).
- **Profile settings (bio/location/stats/preferences)**: dashboard calls **`PUT /api/v1/profile/:id`** (upsert) to create/update a single profile document per user.
- **Saved Hotels (Favourites)**: dashboard uses **`POST /api/v1/favourites`** and **`GET /api/v1/favourites/me`** so users can save/unsave hotels and see them with populated hotel fields.
- **My Reviews (create/list/delete)**: dashboard uses **`POST /api/v1/reviews`**, **`GET /api/v1/reviews/me`**, **`DELETE /api/v1/reviews/:id`** to manage reviews (ownership enforced server-side).
- **Transport History logs**: dashboard uses **`POST /api/v1/transport-logs`** and **`GET /api/v1/transport-logs/me`** to store and display per-user travel fare records.
- **Issue reports (transport/hotel)**: backend provides **`POST /api/v1/reports`** and **`GET /api/v1/reports/me`** to let users submit and view their own reports.
- **Avatar upload (Cloudinary)**: dashboard uploads `FormData(avatar)` to **`PATCH /api/v1/auth/me/avatar`** which stores the image on Cloudinary via multer storage and saves the URL on the user.
- **Change password (in-session)**: dashboard uses **`POST /api/v1/auth/change-password`** and then clears local token to force re-login with the new password.
- **Forgot/Reset password flow**: client uses **`POST /api/v1/auth/forgot-password`** to send a reset link and **`POST /api/v1/auth/reset-password/:token`** to set a new password securely.

### Why tokens alone are not enough (admin / DB access)
- JWTs are **stateless**: if an account is **removed from MongoDB** (e.g. admin or moderation action), the old JWT can still verify until it expires.
- **Fix:** `auth.middleware` verifies the JWT, then **loads the user from the database**. If **`findById` returns nothing** → **`401`** with a clear message (token is “valid” cryptically, but the user no longer exists).
- On that response, the server can also **clear the httpOnly `token` cookie** so the browser does not keep sending a dead session.

### Token blacklisting (logout)
- On **logout**, the current token is stored in a **`tokenBlacklist`** MongoDB collection so it cannot be reused.
- Entries use a **TTL index** on `createdAt` so blacklist documents expire automatically after a short window (aligned with token lifetime).

### Auto logout & client behaviour
- The **axios client** attaches **`Authorization: Bearer …`** from `localStorage` (and sends cookies with `credentials`).
- On **`401`** (expired/invalid/blacklisted token, or user deleted in DB), the client **removes the token** from `localStorage`.
- **Protected areas** (e.g. **`/dashboard`**): user is sent to **`/login`** so they cannot stay on a gated screen without a session.
- **Public pages** (e.g. **Home `/`**, hotels): the user **stays on the page** after a failed session check; the navbar is updated via a **`dhoom-auth-changed`** event so “logged in” UI does not linger incorrectly.
- Failed **login/register** attempts are **not** treated as a global logout (those `401`s are ignored for the redirect logic).

### Session check on app load
- If a token exists, the app may call **`GET /auth/me`** once on startup to align the session with the server; invalid sessions are cleared without forcing public visitors off the landing page.

## 📊 ER DIAGRAM (Level 1 – Logical View)
```
USER
-----
- _id
- name
- email
- password
- phone
- role (traveller/admin)
- createdAt


TRANSPORT_TYPE
--------------
- _id
- type_name (Petrol Auto, CNG Auto, E-Rickshaw, AC Bus, Ropeway)


TRANSPORT_PRICE
---------------
- _id
- source_location
- destination_location
- transport_type_id (FK)
- actual_price
- approx_time
- distance


ROUTE
-----
- _id
- source
- destination
- distance
- estimated_time
- estimated_cost
- traffic_status
- google_map_link


HOTEL
-----
- _id
- name
- location
- price_per_night
- category (budget/mid/luxury/hostel)
- contact_number
- photos[]
- amenities[]
- description


REVIEW
------
- _id
- user_id (FK)
- hotel_id (FK)
- rating
- comment
- createdAt


PUBLIC_TRANSPORT_TIMING
------------------------
- _id
- transport_type
- route_name
- departure_time
- arrival_time
- frequency
- station_name
```

## ER Diagram
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/7456db3d-7de5-4f08-9eb0-3982487166b4" />

## 🧨 Future Monetization (Think Big 😏)
- Hotel promotions
- Transport advertisement
- Premium route planner
- Affiliate booking

## Folder Structure -
### Client side Folder Structure (Vite + React)
```
client/
│
├── public/
│   └── logo.png
│
├── src/
│   ├── assets/                 # static assets (images/icons) if used
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── GuestOnlyRoute.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ui/             # small UI building blocks (animations, reveal, etc.)
│   │   │
│   │   ├── Admin/              # ADMIN PANEL COMPONENTS (NEW!)
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminRouteShell.jsx
│   │   │   ├── ProtectedAdminRoute.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── DashboardCharts.jsx
│   │   │   └── RecentActivityFeed.jsx
│   │   │
│   │   ├── hotels/
│   │   │   ├── HotelCard.jsx
│   │   │   ├── HotelFilter.jsx
│   │   │   └── HotelDetails.jsx
│   │   │
│   │   ├── transport/
│   │   │   ├── TransportCard.jsx
│   │   │   └── RouteSelector.jsx
│   │   │
│   │   ├── reviews/
│   │   │   └── ReviewForm.jsx
│   │   │
│   │   ├── user-dashboard/     # dashboard tabs + sidebar
│   │   │   ├── DashboardAccountSidebar.jsx
│   │   │   ├── DashboardTabsBar.jsx
│   │   │   ├── DashboardProfileTab.jsx
│   │   │   ├── DashboardSavedHotelsTab.jsx
│   │   │   ├── DashboardReviewsTab.jsx
│   │   │   ├── DashboardTransportTab.jsx
│   │   │   ├── DashboardRecentTab.jsx
│   │   │   └── DashboardSettingsTab.jsx
│   │   │
│   │   └── user-profile/       # public profile UI sections
│   │       ├── UserProfileHeader.jsx
│   │       ├── UserProfileCard.jsx
│   │       ├── UserProfileBioSection.jsx
│   │       ├── UserProfileEditControls.jsx
│   │       ├── UserProfileFeedbackSection.jsx
│   │       └── UserProfileSkeleton.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Hotels.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── UserProfile.jsx
│   │   ├── Transport.jsx
│   │   ├── RoutePlanner.jsx
│   │   ├── Timings.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── AdminDashboard.jsx        # NEW - Admin pages
│   │   ├── AdminUsers.jsx             # NEW
│   │   ├── AdminReviews.jsx            # NEW
│   │   ├── AdminReports.jsx            # NEW
│   │   ├── AdminAnalytics.jsx          # NEW
│   │   ├── AdminSettings.jsx           # NEW
│   │   └── NotFound.jsx
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   └── custom hooks for reusability
│   │
│   ├── lib/
│   │   └── apiClient.js         # axios client + auth/401 handling
│   │
│   ├── services/                # API calls (client ↔ server)
│   │   ├── api/
│   │   │   ├── auth.service.js
│   │   │   ├── hotel.service.js
│   │   │   ├── transport.service.js
│   │   │   ├── userId.service.js
│   │   │   ├── profile.service.js
│   │   │   ├── favourite.service.js
│   │   │   ├── review.service.js
│   │   │   ├── transportLog.service.js
│   │   │   └── adminAPI.js          # NEW - Centralized admin API service
│   │   │
│   │
│   ├── utils/
│   │   └── ScrollToTop.jsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── adminRoutes.jsx        # NEW - Admin routing
│   │
│   ├── DB/
│   │   └── hotelDB.json
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
├── eslint.config.js
└── tailwind.config.js
```

### Server Side Folder Structure (Express + MongoDB)
```
server/
│
├── config/
│   ├── db.js                    # MongoDB connection
│   ├── env.js                   # Environment variables
│   └── cloudinary.js            # Cloudinary SDK config
│
├── modules/
│   ├── user/
│   │   ├── user.model.js
│   │   ├── user.controller.js
│   │   ├── user.routes.js
│   │   ├── user.validation.js
│   │   └── tokenBlacklist.model.js
│   │
│   ├── admin/                   # NEW - Admin Module
│   │   ├── admin.routes.js      # 18 admin endpoints
│   │   └── admin.controller.js  # Admin business logic
│   │
│   ├── hotel/
│   │   ├── hotel.model.js
│   │   ├── hotel.controller.js
│   │   ├── hotel.routes.js
│   │   ├── hotel.service.js
│   │   └── hotel.validation.js
│   │
│   ├── profile/
│   │   ├── profile.model.js
│   │   ├── profile.controller.js
│   │   └── profile.routes.js
│   │
│   ├── review/
│   │   ├── review.model.js
│   │   ├── review.controller.js
│   │   └── review.routes.js
│   │
│   ├── favourite/
│   │   ├── favourite.model.js
│   │   ├── favourite.controller.js
│   │   └── favourite.routes.js
│   │
│   ├── transportLog/
│   │   ├── transportLog.model.js
│   │   ├── transportLog.controller.js
│   │   └── transportLog.routes.js
│   │
│   ├── report/
│   │   ├── report.model.js
│   │   ├── report.controller.js
│   │   └── report.routes.js
│   │
│   ├── transport/
│   │   ├── transportType.model.js
│   │   ├── transportPrice.model.js
│   │   ├── transportReport.model.js
│   │   ├── transport.controller.js
│   │   ├── transport.routes.js
│   │   ├── transport.service.js
│   │   └── transport.validation.js
│   │
│   ├── route/
│   │   ├── route.model.js
│   │   ├── route.controller.js
│   │   ├── route.routes.js
│   │   ├── route.service.js
│   │   └── routeOptimizer.js
│   │
│   └── timing/
│       ├── timing.model.js
│       ├── timing.controller.js
│       ├── timing.routes.js
│       └── timing.service.js
│
├── middlewares/
│   ├── auth.middleware.js
│   ├── upload.middleware.js         # multer + Cloudinary storage for image uploads
│   ├── role.middleware.js
│   ├── roleBasedAccess.middleware.js # NEW - RBAC with 3 authorization strategies
│   ├── error.middleware.js
│   └── validate.middleware.js
│
├── utils/
│   ├── generateToken.js
│   ├── responseFormatter.js
│   └── constants.js
│
├── seed/
│   └── seedVaranasi.js
│
├── app.js
└── server.js
```

## Functionalities (current)
- **Authentication & sessions**
  - **Register/Login/Logout** with JWT + cookie support; axios attaches `Authorization: Bearer <token>` and sends cookies with `withCredentials`.
  - **Token blacklisting** on logout via `tokenBlacklist` collection (prevents reuse).
  - **Session validation** checks token *and* loads the user from DB (handles deleted users / revoked tokens).
  - **Forgot/Reset/Change password** flows supported via auth endpoints and client pages.

- **User dashboard (`/dashboard`)**
  - **Profile tab** shows profile snapshot for the logged-in user.
  - **Saved Hotels tab** manages favourites (save/unsave + list).
  - **My Reviews tab** lets users create/list/delete their own reviews.
  - **Transport History tab** shows saved fare logs (estimated vs actual).
  - **Recent Searches tab** reads/writes `localStorage` to show recently viewed hotels.
  - **Settings tab** updates profile fields and uploads avatar to Cloudinary.

- **Hotels**
  - Browse hotels and view details; (API-driven with reusable service layer).

- **Transport**
  - Transport pages + route planner pages exist (module continues evolving).

- **Reports**
  - Users can submit issues (transport/hotel) and view their own submitted reports.

- **Admin Panel (`/admin`)** - NEW! ✨
  - **Dashboard** - Real-time statistics (users, hotels, reviews, reports), charts with 30-day trends
  - **User Management** - Search, filter, paginate users; update roles, suspend/activate accounts
  - **Review Moderation** - View pending reviews, approve/reject with optional reasons
  - **Report Management** - View reported issues, resolve with detailed notes
  - **Analytics** - Advanced analytics dashboard with time period selection (30/90/365 days)
    - User growth trends
    - Hotel registration metrics
    - Booking analytics & revenue tracking
    - Report statistics & trends
  - **Settings** - System configuration, feature flags (2FA, social login, multi-language)
  - **Charts & Visualizations** - Line charts, bar charts, pie charts, area charts with Recharts
  - **Role-Based Access Control (RBAC)** - Admin-only with 3 middleware strategies
    - Strict admin verification
    - Flexible role-based access
    - Permission-based authorization matrix

## Run Website
- Clone Repo
```
git clone https://github.com/coderujwal3/Dhoomchhalle.git
cd Dhoomchhalle
```
- for frontend
```
cd client
npm install
npm run dev
```
- for backend
```
cd server
npm install
npm run dev
```

## Website landing page
<img width="1919" height="1019" alt="image" src="https://github.com/user-attachments/assets/64dbee39-b5a6-40bd-8546-4c5ebd34f9bf" />

## User Profile QR Code - (Scan to view my profile)
<img width="380" height="329" alt="image" src="https://github.com/user-attachments/assets/fada03bb-f03c-47cf-ad16-e80b5e762af3" />

## User Dashboard Look
<img width="1919" height="1065" alt="image" src="https://github.com/user-attachments/assets/c4937e0c-8ebb-4ec5-bee1-1be1b071c83b" />

## User Profile Look
<img width="1919" height="1053" alt="image" src="https://github.com/user-attachments/assets/3479e0b6-ccf5-4ea2-8946-740f9006bce1" />


# Mobile App Dhoomchhalle
## NOTE => This will be added soon in this repo again (it has been removed from here, because it has several high risk vulnerabilites in it, after fixation it will be deployed again. Thank you for understanding).
## Mobile Landing page
<img height="840" alt="image" src="https://github.com/user-attachments/assets/91ff65d4-779f-4fbc-976e-cb024a530834" />

# App Dev requirements
- Android Studio
- Emulators (`pixel 5`,`pixel 7 pro`,`pixel tablet`)
- React-Native
- expo bundler
- typescript

## download packages
```
cd mobile
npm install
```

## Start app in emulator
```
npm run android    -     (for android - you can run using expo command - expo start --android)
npm run ios        -     (for ios - you can run using expo command - expo start --ios)
npm run tablet     -     (for tablet - you can run using expo command - expo start --tablet)
```
