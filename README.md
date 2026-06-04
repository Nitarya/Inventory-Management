# Inventory — Order Management

A full-stack inventory and order management application. **Single container** serves both the FastAPI backend and the React frontend.

## Features

- **Product Management** — CRUD with unique SKU enforcement
- **Customer Management** — CRUD with unique email enforcement
- **Order Management** — Inventory validation, automatic stock reduction
- **Authentication** — JWT-based login (credentials via environment variables)
- **Containerized** — Single Docker image, easy deployment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12 + FastAPI + SQLAlchemy |
| Frontend | React 18 + Vite + Tailwind CSS |
| Database | PostgreSQL 16 |
| Container | Docker + Docker Compose |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/<your-username>/inventory-order-management.git
cd inventory-order-management

# Start everything (PostgreSQL + combined app)
docker compose up --build

# Access the app — one port, one service
# http://localhost:8000
```

## Deployment on Railway (single service)

Railway deployment is **one service** — no separate frontend/backend:

1. Push this repo to **GitHub**
2. Go to **railway.app** → **New Project** → **Provision PostgreSQL**
3. Copy the `DATABASE_URL` from Railway PostgreSQL
4. **New** → **Empty Service** → select your GitHub repo
5. Railway auto-detects the `Dockerfile` — no build/start commands needed
6. Add these **environment variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | From Railway PostgreSQL |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `admin123` |
| `JWT_SECRET` | `your-random-secret` |

7. Click **Deploy** — done!

## Development (standalone)

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (separate dev server with hot reload)
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## API Endpoints

All endpoints except `/api/auth/login` and `/api/health` require a `Bearer` token obtained from login.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Returns JWT token |
| GET | `/api/health` | Health check |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| GET | `/api/customers/{id}` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/{id}` | Get order with items |
| POST | `/api/orders` | Create order (validates stock) |
| PATCH | `/api/orders/{id}` | Update status |
| DELETE | `/api/orders/{id}` | Delete order |

## Business Rules

1. **Unique SKU** — enforced at DB + API level (`409 Conflict`)
2. **Unique Email** — enforced at DB + API level (`409 Conflict`)
3. **Inventory Validation** — order rejected if stock insufficient (`400 Bad Request`)
4. **Auto Stock Reduction** — stock decremented atomically within the order transaction
5. **Auth Required** — all data endpoints protected by JWT

## Project Structure

```
├── backend/
│   └── app/
│       ├── main.py           # FastAPI + serves frontend static files
│       ├── config.py         # Environment variables
│       ├── database.py       # SQLAlchemy engine/session
│       ├── models/           # Product, Customer, Order, OrderItem
│       ├── schemas/          # Pydantic request/response schemas
│       ├── routers/          # API route handlers + auth
│       └── services/         # Business logic layer
├── frontend/
│   └── src/
│       ├── App.jsx           # Router + auth gate
│       ├── api/              # Axios client with token management
│       └── pages/            # Login, Dashboard, Products, Customers, Orders
├── Dockerfile                # Multi-stage: builds frontend, serves via FastAPI
├── docker-compose.yml         # PostgreSQL + combined app
└── README.md
```
