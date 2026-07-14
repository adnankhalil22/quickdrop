# QuickDrop API Documentation

Base URL (local development): `http://127.0.0.1:8000/api`

A ready-to-import Postman collection covering every endpoint below lives in [`postman/QuickDrop.postman_collection.json`](../postman/QuickDrop.postman_collection.json), paired with [`postman/QuickDrop.postman_environment.json`](../postman/QuickDrop.postman_environment.json).

## Authentication

QuickDrop uses **Laravel Sanctum** personal access tokens (not cookies). After registering or logging in, every subsequent request must include the token as a Bearer header:

```
Authorization: Bearer <token>
Accept: application/json
```

All request/response bodies are JSON. Send `Content-Type: application/json` on any request with a body.

## Roles

Every user has exactly one role: `customer`, `manager`, or `admin`. Routes are grouped by the role required to access them (see below). A request from the wrong role receives `403 Forbidden`; an unauthenticated request receives `401 Unauthenticated`.

- **customer** — the only role that can self-register. Browses restaurants, manages their own addresses/cart/orders.
- **manager** — assigned to exactly one restaurant by an admin (`restaurants.manager_id`). Manages that restaurant's profile, menu, and incoming orders. A manager with no restaurant assigned gets `404` on every `/manager/*` route.
- **admin** — full account/restaurant/order oversight. Only admins can create manager or admin accounts, or activate/deactivate restaurants.

## Response Shape Conventions

- **Reads** (`GET`) return the resource under a descriptive key, e.g. `{"user": {...}}`, `{"restaurant": {...}}`, with no `message`.
- **Writes** (`POST`/`PUT`/`DELETE`) return `{"message": "...", "<resource>": {...}}` (delete responses omit the resource key).
- **Paginated lists** (restaurants, orders) return Laravel's standard shape: `{"data": [...], "links": {...}, "meta": {...}}`.
- **Validation errors** (`422`): `{"message": "...", "errors": {"field": ["..."]}}`.
- **Business-rule errors** (`422`/`409`): `{"message": "human-readable reason"}`.
- **Not found** (`404`): `{"message": "The requested resource was not found."}` — this is deliberately generic and never leaks internal class/table names.
- **Auth errors**: `401 {"message": "Unauthenticated."}`, `403 {"message": "This action is unauthorized."}`.

All error responses stay in this exact shape whether `APP_DEBUG` is on or off — no stack traces ever reach the client in production.

## Seeded Test Accounts

Password for every seeded account is `password`.

| Role | Email |
|---|---|
| Admin | `admin@quickdrop.test` |
| Manager | `manager1@quickdrop.test`, `manager2@quickdrop.test`, `manager3@quickdrop.test` |
| Customer | `customer1@quickdrop.test` … `customer5@quickdrop.test` |

---

## Auth (Public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a customer account. `role` is always forced to `customer` server-side and cannot be set by the client. |
| POST | `/login` | Authenticate and receive a token. Rate-limited to 5 attempts per email+IP combo. |
| POST | `/logout` | *(auth required, any role)* Revoke the token used for this request only. |

**Register** — body: `name`, `email` (unique), `phone` (optional), `password` (min 8, `confirmed`).
**Login** — body: `email`, `password`. Returns `{"message", "user", "token"}` on success; `422` with a generic "credentials do not match" message on failure (doesn't reveal whether the email exists).

---

## Public — Restaurants & Menus

No authentication required. Inactive restaurants are invisible here (404 on direct access, excluded from listing/search) so their existence isn't leaked to the public.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/restaurants` | Paginated, searchable list of **active** restaurants. Query params: `search` (name match), `per_page` (max 50, default 12). |
| GET | `/restaurants/{restaurant}` | Single restaurant detail. |
| GET | `/restaurants/{restaurant}/menu` | Restaurant + all menu categories + all menu items (including unavailable ones, flagged via `is_available` so the frontend can grey them out). |

---

## Customer (role: customer)

### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | `/profile` | View your own account. |
| PUT | `/profile` | Update `name`, `email` (unique excluding self), `phone`. |

### Addresses

Full CRUD, always scoped to the authenticated customer (`403` on any other customer's address).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/addresses` | List your addresses, default-first. |
| POST | `/addresses` | Create. The very first address is forced `is_default: true`; setting `is_default: true` on any address automatically unsets it on all your others. |
| GET | `/addresses/{address}` | View one. |
| PUT | `/addresses/{address}` | Update (full replace). |
| DELETE | `/addresses/{address}` | Delete. If it was your default, the next most recent address is auto-promoted to default. |

Fields: `label`, `city`, `area`, `street`, `building` (all required), `floor`, `details` (optional), `is_default` (optional boolean).

### Cart

A customer has at most one cart at a time, and it can only ever hold items from a single restaurant.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | View your current cart (`{"cart": null}` if empty), with live-computed `subtotal`/`delivery_fee`/`total`. |
| POST | `/cart/items` | Add an item. Body: `menu_item_id`, `quantity` (min 1), `notes` (optional). |
| PUT | `/cart/items/{cartItem}` | Set an exact quantity (not increment). Body: `quantity`, `notes`. |
| DELETE | `/cart/items/{cartItem}` | Remove one line item. Deletes the cart entirely if it was the last item. |
| DELETE | `/cart` | Clear the whole cart. |

**Business rules enforced on add:**
- Unavailable items are rejected (`422`).
- Items from an inactive restaurant are rejected (`422`).
- Adding an item from a **different** restaurant than what's already in your cart is rejected (`409`) — call `DELETE /cart` first to switch restaurants.
- Adding an item already in the cart increments its quantity rather than erroring.
- The menu item's **current** price is copied into the cart line every time it's added (a stale price never lingers past the next add action).

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/orders` | Paginated order history (most recent first), summary only (no line items). |
| POST | `/orders` | Place an order from your current cart. Body: `address_id` (must be your own), `customer_notes` (optional). |
| GET | `/orders/{order}` | Full order detail including line items. |
| POST | `/orders/{order}/cancel` | Cancel — **only while `status` is `pending`** (`422` otherwise). |

**Order creation is fully re-validated at checkout time** (not just trusted from the cart): rejects an empty cart, a now-inactive restaurant, any item that's gone unavailable since being added, and a subtotal below the restaurant's `minimum_order` — all `422`. `subtotal`, `delivery_fee`, and `total` are always computed server-side; any of those fields sent in the request body are silently ignored. The whole operation (order + order_items + cart clearing) runs inside a single database transaction.

Order status values: `pending → accepted → preparing → out_for_delivery → delivered`, or `pending → rejected`, or customer-cancelled from `pending`.

---

## Manager (role: manager)

Every route below requires the authenticated user to have a restaurant assigned (`restaurants.manager_id`); otherwise every route in this group returns `404`. All resources are automatically scoped to the manager's own restaurant — attempting to touch another restaurant's category, item, or order returns `403`.

### Restaurant

| Method | Endpoint | Description |
|---|---|---|
| GET | `/manager/restaurant` | View your assigned restaurant. |
| PUT | `/manager/restaurant` | Update its info. **Cannot** set `is_active` or `manager_id` — those are admin-only fields, structurally absent from this endpoint's accepted fields. |

Fields: `name`, `address`, `opening_time`/`closing_time` (`HH:MM`, closing after opening), `delivery_fee`, `minimum_order` (all required), `description`, `phone`, `image` (optional).

### Menu Categories — `CRUD /manager/categories`

Fields: `name` (required), `description` (optional).

### Menu Items — `CRUD /manager/menu-items`

Fields: `menu_category_id` (must belong to your own restaurant), `name`, `price` (required), `description`, `image` (optional), `is_available` (boolean — this is how items get marked available/unavailable; there's no separate toggle endpoint).

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/manager/orders` | Paginated list of your restaurant's orders. |
| GET | `/manager/orders/{order}` | Full detail. |
| PUT | `/manager/orders/{order}/status` | Advance the order status. |

Accepted `status` values: `accepted`, `rejected`, `preparing`, `out_for_delivery`, `delivered`. Transitions follow a strict forward-only state machine — you cannot skip a step (e.g. `pending → preparing` directly) or move a terminal order (`delivered`/`cancelled`/`rejected`) anywhere else. Invalid transitions return `422` naming the specific `from`/`to` states attempted.

---

## Administrator (role: admin)

No per-record ownership restrictions — an admin can act on any user, restaurant, or order. Authorization is enforced entirely by the `role:admin` route middleware.

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Aggregate counts: users by role, restaurants by active/inactive, orders by every status, and total revenue (sum of `delivered` orders' totals). |

### Users — `CRUD /admin/users`

Doubles as "manage restaurant managers," since a manager is just a user with `role: manager`. Supports `?role=customer|manager|admin` filtering on the list endpoint.

Fields (create): `name`, `email` (unique), `phone` (optional), `password` (min 8), `role` (`customer`/`manager`/`admin`). Fields (update): same minus `password`.

Two safety guards: an admin **cannot delete their own account** or **change their own role away from admin** (both return `422`) — there's no separate account-recovery path in this app, so either action would be an unrecoverable lockout.

### Restaurants — `CRUD /admin/restaurants`

Unlike the public/manager views, this endpoint shows **all** restaurants regardless of `is_active`. This is also where restaurants get created, assigned a manager, and activated/deactivated.

Fields: everything the manager's own update accepts, **plus** `manager_id` (nullable — must reference an existing user with `role: manager`, and that manager cannot already be assigned to a different restaurant) and `is_active` (boolean).

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/orders` | Paginated list across **every** restaurant. |
| GET | `/admin/orders/{order}` | Full detail. |
| PUT | `/admin/orders/{order}/status` | Advance status, or override-cancel. |

Accepts everything the manager endpoint does, **plus** `cancelled` as a target status — an admin can cancel from any non-terminal state (not just `pending`, unlike the customer's own cancel endpoint), covering "cancel orders when necessary."

---

## Postman Usage

1. Import both files from `postman/` into Postman.
2. Select the **QuickDrop Local** environment (sets `base_url`).
3. Open the **Auth** folder and run **Login as Customer** / **Login as Manager** / **Login as Admin** — each saves its token into a collection variable (`customer_token`, `manager_token`, `admin_token`) that every request in the corresponding folder already references via Bearer auth. You never need to copy a token by hand.
4. Requests that create a resource (address, cart item, order, category, menu item, user, restaurant) auto-capture the new ID into a collection variable (`address_id`, `cart_item_id`, `order_id`, etc.) that subsequent "Get/Update/Delete" requests in the same folder already use.
5. Login bodies default to the seeded accounts, so the whole collection works immediately against a freshly seeded database (`php artisan migrate:fresh --seed`).
