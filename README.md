# TeslaPool

A simple Tesla car-pooling MVP built with Next.js App Router, Tailwind CSS, daisyUI, MongoDB, JWT cookies, and Docker.

## Features

- Passenger registration: name, email, phone, password.
- Driver registration: name, email, Tesla ownership/hire, password.
- Login redirects by role.
- Passenger enters pickup, destination and 1–3 seats.
- Online drivers are filtered by pickup area and available capacity.
- One Tesla has exactly 3 seats.
- A passenger can request a driver; driver accepts or ignores.
- Driver online/offline controls passenger visibility.
- Driver workflow: Accept → Pick up → Start → Complete.
- Passenger can cancel an active ride.
- Completed rides appear in passenger and driver history.
- Dashboards poll every few seconds to keep the MVP simple without WebSockets.

## Run with Docker

1. Copy `.env.example` to `.env.local` if running outside Docker.
2. Start everything:

```bash
docker compose up --build
```

3. Open `http://localhost:3000`.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

For local development, use `MONGODB_URI=mongodb://localhost:27017/tesla_pool`.

## Important MVP limitation

"Same area" currently means the pickup text matches case-insensitively. For production, replace this with latitude/longitude and MongoDB geospatial queries. Also add payment, driver verification, rate limiting, stronger authorization, and a real-time transport such as WebSockets/SSE before production use.


## Fare calculation

The MVP uses this simple fare rule:

- 1 km = Tk 20 base fare
- Every additional km = +Tk 15
- 1 km discount = 5%
- Each additional km adds 1 percentage point to the discount
- Maximum discount = 30%
- The discounted fare is calculated per seat, then multiplied by the number of booked seats
- Distance is currently entered by the passenger as an estimated whole number of kilometres.

Examples:

| Distance | Base | Discount | Per-seat fare | 2 seats |
|---:|---:|---:|---:|---:|
| 1 km | Tk 20 | 5% | Tk 19 | Tk 38 |
| 2 km | Tk 35 | 6% | Tk 32.90 | Tk 65.80 |
| 5 km | Tk 80 | 9% | Tk 72.80 | Tk 145.60 |
| 26 km | Tk 395 | 30% | Tk 276.50 | Tk 553 |
| 30 km | Tk 455 | 30% max | Tk 318.50 | Tk 637 |

For a production version, replace the manual distance field with GPS/Maps distance calculation.
