# Seamless

Seamless is a multi-tenant, QR-based restaurant ordering system. A permanent QR identifies a restaurant table; an active dining session opened by staff authorizes customers to order. The app minimizes unnecessary waiter interaction while keeping staff in control of menu availability, orders, bills, and table closure.

## Included workflow

1. Staff signs in and opens a table session.
2. A customer scans that table's permanent QR and receives a temporary customer session token.
3. The customer browses the live menu, adds item and order notes, and places an order.
4. Staff confirm, prepare, mark ready, and serve the order through enforced transitions.
5. The customer requests the table bill and completes a simulated payment (or waits for a physical bill).
6. Staff settle the bill and close the table. The customer token is immediately invalidated.

## Local setup

Requirements: Python 3.10+ and Node.js 18+.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py generate_qr
python manage.py runserver 8000
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the staff dashboard at `http://localhost:5173/staff`.

| Demo login | Value |
|---|---|
| Username | `demo_staff` |
| Password | `demo1234` |

Open a table first, then use **Copy QR URL** on the Tables tab (or open a PNG from the `qr/` folder) to begin the customer flow.

## Architecture

- Django + Django REST Framework API with Django Channels WebSockets
- React/Vite client (mobile-first customer UI + staff operations dashboard)
- Modular monolith: Restaurant, StaffUser, Table, DiningSession, CustomerSession, Category, MenuItem, Order, OrderItem, Bill
- JWT-protected staff endpoints and session-token-protected customer endpoints
- SQLite by default for local development (Postgres/Redis via `.env` when needed)

## Verification

```powershell
python manage.py test
cd frontend; npm run build
```

## QR routes

Permanent table routes look like:

```text
/r/<restaurant-slug>/t/<table-uuid>
```

Menu updates never require regenerating QR codes. A QR only identifies the table; the server requires an active DiningSession before issuing a customer token.

## Deployment

A docker-compose.yml is provided for running the backend with PostgreSQL and Redis. To deploy:

`powershell
docker-compose up -d --build
`
