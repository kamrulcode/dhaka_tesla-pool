# 🚗 TeslaPool

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=flat-square&logo=openstreetmap&logoColor=white" />
  <img src="https://img.shields.io/badge/OSRM-Routing-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Nominatim-Geocoding-orange?style=flat-square" />
</p>

<p align="center">
  <strong>Share a Tesla. Split the fare. Ride smarter.</strong>
</p>

<p align="center">
  A full-stack ride-pooling MVP built with Next.js, MongoDB, TypeScript and Docker.
</p>

---

## ✨ Overview

**TeslaPool** is a ride-pooling application where passengers can share a Tesla and split the fare.

Each Tesla has a maximum capacity of **3 passenger seats**.

The platform supports two roles:

* 👤 **Passenger** — find a Tesla, choose seats, calculate fare, request rides and view history.
* 🚘 **Driver** — go online/offline, receive requests, accept rides and manage the ride lifecycle.

### Core Flow

```text
Passenger
   ↓
Pickup + Destination
   ↓
Choose Seats
   ↓
Calculate Fare
   ↓
Request Tesla
   ↓
Driver Accepts
   ↓
Pick Up
   ↓
Start Ride
   ↓
Complete
   ↓
Ride History
```

---

## 🚀 Features

### 👤 Passenger

* Register / Login
* Pickup & destination selection
* Map and route calculation
* Choose 1–3 seats
* Distance-based fare calculation
* View available drivers
* Request a Tesla
* Cancel eligible rides
* Track ride status
* View ride history

### 🚘 Driver

* Register / Login
* Driver profile
* Tesla ownership information
* Online / Offline availability
* View compatible requests
* Accept rides
* Pick up passengers
* Start rides
* Complete rides
* View ride history

### 💺 Pooling

* Tesla capacity: **3 seats**
* Multiple passengers can share one Tesla
* Server-side capacity validation
* Prevents overbooking
* Remaining seats are calculated from active rides

### 💰 Fare

```text
Base fare = Tk 20

Additional distance:
Tk 15 × each km after the first kilometre

Maximum discount = 30%
```

Example:

```text
Distance = 5 km
Seats    = 2

Base fare = Tk 80
Discount  = 9%

Fare / seat = Tk 72.80
Total       = Tk 145.60
```

---

## 🛠️ Tech Stack

| Category     | Technology              |
| ------------ | ----------------------- |
| ⚡ Framework  | Next.js                 |
| ⚛️ UI        | React                   |
| 🔷 Language  | TypeScript              |
| 🎨 Styling   | Tailwind CSS            |
| 🗄️ Database | MongoDB                 |
| 🟢 Runtime   | Node.js                 |
| 🐳 DevOps    | Docker + Docker Compose |
| 🗺️ Map      | OpenStreetMap           |
| 📍 Geocoding | Nominatim               |
| 🛣️ Routing  | OSRM                    |

---

## 🏗️ Architecture

```text
┌──────────────────────┐
│   Passenger/Driver   │
│       Browser        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Next.js         │
│  App Router + API    │
└──────────┬───────────┘
           │
      ┌────┴─────┐
      ▼          ▼
┌──────────┐  ┌──────────────┐
│ MongoDB  │  │ Maps / OSRM  │
│ Database │  │ / Nominatim  │
└──────────┘  └──────────────┘
```

---

## 🗄️ Database

Main collections:

```text
Users
 ├── Passenger
 └── Driver

Rides
 ├── passengerId
 ├── driverId
 ├── pickup
 ├── destination
 ├── distance
 ├── seats
 ├── fare
 └── status
```

Ride statuses:

```text
REQUESTED
    ↓
ACCEPTED
    ↓
PICKED_UP
    ↓
STARTED
    ↓
COMPLETED
```

---

## 💺 Seat Pooling

Every Tesla has:

```text
Maximum capacity = 3 seats
```

Example:

```text
Passenger A → 2 seats
Passenger B → 1 seat

Total = 3 / 3
```

A new request cannot exceed the remaining capacity.

```text
Available = 3 - active passenger seats
```

Capacity validation is performed on the server rather than relying only on the UI.

---

## 📁 Project Structure

```text
tesla-pool/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── driver/
│   │   ├── drivers/
│   │   ├── history/
│   │   └── rides/
│   ├── driver/
│   ├── history/
│   ├── login/
│   ├── passenger/
│   └── register/
│
├── components/
├── lib/
├── models/
├── public/
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js 22+
* npm
* Git
* Docker Desktop

Check your installation:

```bash
node --version
npm --version
docker --version
docker compose version
```

### 1. Clone the repository

```bash
git clone <your-repository-url>

cd tesla-pool
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env.local
```

Add:

```env
MONGODB_URI=mongodb://localhost:27018/tesla_pool
```

> Never commit `.env.local` or real credentials.

### 4. Start MongoDB

```bash
docker compose up -d mongo
```

Check:

```bash
docker compose ps
```

### 5. Start Next.js

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🐳 Docker

Run the complete application:

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

View logs:

```bash
docker compose logs -f
```

> Do not use `docker compose down -v` unless you intentionally want to delete the MongoDB volume and its data.

---

## 🔌 API

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Driver

```http
POST /api/driver/online
```

### Drivers

```http
GET /api/drivers
```

### Rides

```http
POST /api/rides/request
POST /api/rides/accept
POST /api/rides/cancel
POST /api/rides/status
```

### History

```http
GET /api/history
```

---

## 🧪 Testing

Important business rules tested:

### Seat capacity

```text
Tesla capacity = 3

2 seats + 1 seat = allowed
2 seats + 2 seats = rejected
```

### Ride transitions

```text
REQUESTED → ACCEPTED
ACCEPTED  → PICKED_UP
PICKED_UP → STARTED
STARTED   → COMPLETED
```

Invalid transitions are rejected by the server.

### Authorization

Users cannot modify rides belonging to another user.

### Concurrent requests

If only one seat remains, simultaneous requests must not allow the Tesla to exceed its 3-seat capacity.

---

## 📸 Screenshots

Add screenshots inside:

```text
docs/
├── register.png
├── login.png
├── passenger-dashboard.png
├── driver-dashboard.png
├── map-route.png
├── fare-calculation.png
├── ride-request.png
├── ride-status.png
└── history.png
```

Example:

```md
![Passenger Dashboard](docs/passenger-dashboard.png)
```

---

## 🎥 Demo

Add your final demo video here:

```text
Demo Video: <YOUR-LINK>
```

Recommended demo:

```text
Register
   ↓
Driver goes Online
   ↓
Passenger selects route
   ↓
Fare calculation
   ↓
Seat selection
   ↓
Ride request
   ↓
Driver accepts
   ↓
Pick Up
   ↓
Start
   ↓
Complete
   ↓
History
```

---

## 🤖 AI Usage

AI was used during development for assistance with:

* Project architecture
* Next.js API development
* MongoDB integration
* Authentication
* Docker configuration
* Ride and driver logic
* Fare calculation
* Map integration
* Debugging
* UI implementation
* Documentation

The application was tested and debugged locally, and the main user flows and business rules were verified during development.

Areas I am continuing to improve include:

* Backend architecture
* Database concurrency
* Authentication security
* Distributed systems
* Production-scale ride matching

---

## ⚠️ Known Limitations

This is an **MVP**, so several production features are intentionally excluded:

* 🔸 No real-time GPS tracking
* 🔸 No payment gateway
* 🔸 No push notifications
* 🔸 No advanced route matching
* 🔸 No driver KYC verification
* 🔸 No admin dashboard
* 🔸 No production observability
* 🔸 Public map services are used for development
* 🔸 Polling is used instead of WebSockets
* 🔸 Production-grade rate limiting still needs to be added

---

## 🚀 Future Improvements

### Product

* 📍 Live driver tracking
* 💳 Online payments
* 🔔 Push notifications
* ⭐ Ratings & reviews
* 🪪 Driver verification
* 🎟️ Promo codes
* 🛡️ Cancellation/refund system
* 👨‍💼 Admin dashboard

### Engineering

* ⚡ WebSockets / SSE
* 🔴 Redis caching
* 📦 Queue/event system
* 🗺️ Geospatial driver matching
* 🔐 Stronger authentication
* 🚦 Rate limiting
* 🔑 Idempotency
* 📊 Monitoring & observability
* 🧪 Automated integration tests

---

## 📊 Project Status

| Feature               | Status         |
| --------------------- | -------------- |
| 👤 Passenger Flow     | 🟢 Implemented |
| 🚘 Driver Flow        | 🟢 Implemented |
| 💺 3-Seat Pooling     | 🟢 Implemented |
| 💰 Fare Calculation   | 🟢 Implemented |
| 🗺️ Maps & Routing    | 🟢 Implemented |
| 🐳 Docker + MongoDB   | 🟢 Implemented |
| 📜 Ride History       | 🟢 Implemented |
| 📍 Real-time Tracking | 🟡 Planned     |
| 💳 Payments           | 🟡 Planned     |
| ⚡ Production Matching | 🟡 Planned     |

---

## 🌟 What I Learned

Building TeslaPool helped me practice:

```text
Next.js
TypeScript
React
MongoDB
REST APIs
Authentication
Role-based access
Docker
Database design
Ride state management
Concurrency concepts
Geospatial concepts
API integration
```

---

## 👨‍💻 Author

**Kamrul Islam**

Full-Stack Developer | React | Next.js | MERN

<p>
  <img src="https://img.shields.io/badge/React-Developer-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Next.js-Developer-black?style=flat-square&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MERN-Stack-47A248?style=flat-square&logo=mongodb&logoColor=white" />
</p>

---

## 📄 License

This project is an MVP/demo application created for **learning, portfolio, and interview demonstration purposes**.

Add a license such as MIT if you plan to distribute the project publicly.

---

<p align="center">
  <strong>🚗 TeslaPool</strong>
  <br />
  Share a Tesla. Split the fare. Ride smarter.
  <br /><br />
  Built with ❤️ using Next.js • MongoDB • TypeScript • Tailwind CSS • Docker
</p>
