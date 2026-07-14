# QuickDrop 🛵

QuickDrop is a full-stack food delivery web application built as a learning project to practice
building a real-world app with a **Laravel REST API backend** and a **React (Vite) frontend**.

It follows the same basic *workflow* as apps like Toters/Uber Eats (browse restaurants → build a
cart → check out → track order status) but the branding, design, database schema, and every line
of code are original — no code, assets, or images were copied from any existing product.

- **Repository:** https://github.com/adnankhalil22/quickdrop
- **Author:** Adnan Khalil
- **Type:** Personal learning project (built step-by-step, one feature/phase at a time)

---

## 1. What the app does

QuickDrop has three user roles, each with their own dashboard and permissions:

| Role | Can do |
|---|---|
| **Customer** | Register/login, browse & search restaurants, view menus, manage a cart (one restaurant at a time), manage delivery addresses, check out (cash on delivery), view order history, cancel a pending order |
| **Restaurant Manager** | Manage their own restaurant's profile (hours, fees, image), manage menu categories & items (price, availability, image), view & progress incoming orders through a status workflow (accept → prepare → out for delivery → delivered), reject orders |
| **Administrator** | Platform-wide dashboard (user/restaurant/order stats, revenue), full CRUD on users (create/edit/delete, assign roles), full CRUD on restaurants (assign managers, activate/deactivate), view & override the status of **any** order (including force-cancel) |

Payment is cash-on-delivery only — there is no payment gateway, live map/driver tracking, coupons,
or ratings system in this version (intentionally out of scope, to keep the project focused).

---

## 2. Tech stack

**Backend**
- PHP 8.2 / Laravel 12
- MySQL (via XAMPP in local dev)
- Laravel Sanctum — token-based API authentication
- Form Request validation classes, API Resources, Eloquent Policies, custom middleware
- PHPUnit feature tests (SQLite in-memory, isolated from the dev database)

**Frontend**
- React 19 + Vite 8
- React Router v7 (nested routes, protected route guards per role)
- Axios (with interceptors for auth token + 401 handling)
- Plain CSS with a small custom design system (no UI framework) — dark theme, fully responsive

**Tooling**
- Composer, npm
- Postman collection for manual API testing (`postman/`)
- Git / GitHub

---

## 3. Project structure

```
quickdrop/
├── backend/                 Laravel API (PHP)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/         Public & customer controllers
│   │   │   ├── Controllers/Api/Manager/ Restaurant manager controllers
│   │   │   ├── Controllers/Api/Admin/   Administrator controllers
│   │   │   ├── Requests/                Form Request validation classes
│   │   │   └── Resources/               API Resource (JSON shape) classes
│   │   ├── Models/                      Eloquent models
│   │   └── Policies/                    Authorization policies
│   ├── database/
│   │   ├── migrations/                  9 domain tables + Sanctum tokens
│   │   ├── factories/                   Model factories (demo data incl. real photos)
│   │   └── seeders/DatabaseSeeder.php    Seeds admin/managers/customers + restaurants
│   ├── routes/api.php                   All API routes (public/customer/manager/admin)
│   └── tests/Feature/                   73 PHPUnit feature tests
│
├── frontend/                 React app (Vite)
│   └── src/
│       ├── api/               Axios client + error helpers
│       ├── context/           AuthContext (login/register/logout, persisted session)
│       ├── components/        Navbar, Layout, ProtectedRoute, cards, forms
│       ├── pages/              Public, customer/, manager/, admin/ pages (22 pages total)
│       └── utils/              Shared helpers (order status state machine, mirrors backend)
│
├── docs/API.md               Full API endpoint reference
├── postman/                  Postman collection + environment for manual API testing
└── README.md                 This file
```

---

## 4. Database design

9 core tables, designed around a few explicit business rules that are enforced **server-side**
(never trust the frontend for money/availability logic):

- `users` (role: customer / manager / admin), `addresses`, `restaurants`
- `menu_categories`, `menu_items`
- `carts`, `cart_items` — a cart can only ever hold items from **one** restaurant at a time
- `orders`, `order_items` — item name & price are **snapshotted** at order time (so a later menu
  price change never rewrites the price of a past order)

Key rules enforced by the backend:
- You cannot add an unavailable item, or an item from a second restaurant, to your cart.
- You cannot order from an inactive restaurant.
- Order totals are always calculated server-side inside a DB transaction — the cart is atomically
  converted into an order and cleared, so nothing is left half-done if something fails.
- Order status can only move through a fixed state machine (`pending → accepted → preparing →
  out_for_delivery → delivered`, with `rejected`/`cancelled` branches) — both the backend
  (`Order::canTransitionTo()`) and the frontend UI respect the same rules, so the UI never even
  offers an action the API would reject.

---

## 5. Getting started

### Prerequisites
- PHP 8.2+, Composer
- Node.js 18+, npm
- MySQL/MariaDB (e.g. via XAMPP)

### Backend setup
```bash
cd backend
composer install
cp .env.example .env        # then set DB_DATABASE/DB_USERNAME/DB_PASSWORD to match your MySQL
php artisan key:generate
php artisan migrate --seed  # creates tables + demo data (see accounts below)
php artisan serve           # http://127.0.0.1:8000
```

### Frontend setup
```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL should point at the backend above
npm run dev                 # http://localhost:5173
```

Open `http://localhost:5173` in a browser once both servers are running.

### Seeded demo accounts
Every seeded account uses the password **`password`**.

| Role | Email |
|---|---|
| Admin | `admin@quickdrop.test` |
| Manager (×3, each with their own restaurant + menu) | `manager1@quickdrop.test` … `manager3@quickdrop.test` |
| Customer (×5, each with a default address) | `customer1@quickdrop.test` … `customer5@quickdrop.test` |

---

## 6. Testing

**Backend:** 73 automated PHPUnit feature tests (171 assertions) covering auth, cart rules, order
creation/transactions, role middleware, and every role's CRUD endpoints, run against an isolated
in-memory SQLite database.

```bash
cd backend
php artisan test
```

**API (manual):** Import `postman/QuickDrop.postman_collection.json` and
`postman/QuickDrop.postman_environment.json` into Postman. The collection chains tokens/IDs
automatically between requests (login → use token → create resource → use its ID, etc.).

**Frontend:** No automated test suite (out of scope for this project) — verified manually through
the browser against the real API, and by re-checking the JSON shape returned by every endpoint
against what each page expects.

Full endpoint reference: [`docs/API.md`](docs/API.md).

---

## 7. Design notes

- **Dark, modern UI** with a small custom CSS design system (CSS variables for color/spacing,
  no Bootstrap/Tailwind) — teal accent color, card-based layouts, fluid typography.
- **Fully responsive**: a collapsible hamburger navbar below ~860px, and list/CRUD rows that
  reflow from a two-column layout into a stacked one on narrow screens, down to phone width.
- **Real images**: restaurant and menu item photos are genuine, individually-verified stock
  photography (not placeholder/random noise), and managers/admins can set their own image URL
  per restaurant or menu item from the UI.

---

## 8. What this project was built to practice

- Structuring a Laravel API properly: Form Requests, API Resources, Policies, middleware,
  route groups per role, and DB transactions for multi-step writes.
- Designing a relational schema with real constraints (single-restaurant cart, price snapshotting,
  status state machines) instead of just CRUD tables.
- Consuming a REST API from React with a token-based auth flow, protected routes per role, and
  keeping the frontend's business rules (e.g. which order status transitions are allowed) in sync
  with the backend so the UI never lies to the user.
- Writing an automated test suite alongside the API instead of only testing manually.
- Iterating in small, reviewable steps rather than generating the whole app at once.
