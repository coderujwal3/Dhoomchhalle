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
- => MERN for website (I will build app later on with React Native (because it is good for both android and iphones)); with tailwindcss, Lenis Scrolling, lottiefiles (for 2D animated icons), framer motion (clean and beautiful animation) for best interacting user experience.

## 🚀 DHOOMCHHALLE – Core System Design
🧠 Core Modules
User Module-
- Transport Module
- Route & Traffic Module
- Hotel/Hostel Module
- Feedback & Reviews
- Timings Module (Bus/Train)
- Admin Panel (VERY IMPORTANT)

## Authentication, session & user dashboard - (recent update)

### User dashboard
- Logged-in users can open **`/dashboard`** (protected route; requires a valid session).
- The dashboard loads profile data from **`GET /api/v1/auth/me`** (name, email, phone, role, member since).
- Quick links to browse hotels and return home; **Log out** calls **`POST /api/v1/auth/logout`** and clears the client-side token.

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
### Client side Folder Structure
```
client/
│
├── public/
│   └── logo.png
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── GuestOnlyRoute.jsx
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Loader.jsx
│   │   │
│   │   ├── hotels/
│   │   │   ├── HotelCard.jsx
│   │   │   └── HotelFilter.jsx
│   │   │
│   │   ├── transport/
│   │   │   ├── TransportCard.jsx
│   │   │   └── RouteSelector.jsx
│   │   │
│   │   └── reviews/
│   │       └── ReviewForm.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Hotels.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── Transport.jsx
│   │   ├── RoutePlanner.jsx
│   │   ├── Timings.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── AdminDashboard.jsx
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx
│   │
│   ├── hooks/
│   │   └── useAuth.js
│   │
│   ├── services/          # API calls
│   │   ├── api.js
│   │   ├── hotelService.js
│   │   ├── transportService.js
│   │   └── authService.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── utils/
│   │   └── helpers.js
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
└── vite.config.js
```

### Server Side Folder Structure
```
server/
│
├── config/
│   ├── db.js
│   └── env.js
│
├── modules/
│   ├── user/
│   │   ├── user.model.js
│   │   ├── user.controller.js
│   │   ├── user.routes.js
│   │   ├── user.service.js
│   │   ├── user.validation.js
│   │   └── tokenBlacklist.model.js
│   │
│   ├── hotel/
│   │   ├── hotel.model.js
│   │   ├── hotel.controller.js
│   │   ├── hotel.routes.js
│   │   ├── hotel.service.js
│   │   └── hotel.validation.js
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
│   ├── role.middleware.js
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

## User Dashboard - (for now it look something like this)
<img width="1752" height="782" alt="image" src="https://github.com/user-attachments/assets/78b23d07-76b6-48fb-89aa-e1d099c3b1d0" />

## User Profile Section - (demo look)
<img width="1919" height="1019" alt="image" src="https://github.com/user-attachments/assets/054d5cf8-5ac1-49a7-846a-eeba39b5821f" />


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
