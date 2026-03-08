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

## Tech Stack: => MERN for website (I will build app later on with React Native (because it is good for both android and iphones))

## 🚀 DHOOMCHHALLE – Core System Design
🧠 Core Modules
User Module-
- Transport Module
- Route & Traffic Module
- Hotel/Hostel Module
- Feedback & Reviews
- Timings Module (Bus/Train)
- Admin Panel (VERY IMPORTANT)

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
│   │   └── user.validation.js
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
