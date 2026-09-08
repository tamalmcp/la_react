# La React — Application Documentation

A full-stack application with a **Laravel 8** REST API backend (Sanctum auth + Spatie
Laravel-Permission for roles/permissions) and a **React 18 (Vite)** frontend.

- Backend: `backend/`
- Frontend: `react-frontend/`

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Laravel `^8.75` (PHP `^7.3\|^8.0`) |
| API auth | Laravel Sanctum `^2.15` (token-based, `Bearer` header) |
| Roles & permissions | `spatie/laravel-permission` `^6.25` |
| Frontend | React 18 + Vite, React Router `v7` |
| HTTP client | Axios (with interceptors) |
| Database | MySQL (via `DB_CONNECTION=mysql` in `.env`) |

---

## 2. Project Structure

```
la_react/
├── backend/                      Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   └── UserController.php
│   │   │   ├── Kernel.php        Route/global middleware registration
│   │   │   └── Middleware/AdminMiddleware.php
│   │   └── Models/
│   │       ├── User.php          Has legacy `role` column AND Spatie HasRoles trait
│   │       └── Product.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── RolesAndPermissionsSeeder.php
│   └── routes/api.php
│
└── react-frontend/                Vite + React SPA
    └── src/
        ├── api/axiosConfig.js     Axios instance, base URL, token injection
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Login.jsx / Register.jsx
        │   ├── PrivateRoute.jsx
        │   ├── Navigation.jsx
        │   ├── Products.jsx
        │   ├── UserList.jsx
        │   └── Categories.jsx     (placeholder page — not implemented)
        └── App.jsx                Route definitions
```

---

## 3. Authentication Flow

1. `POST /api/register` or `POST /api/login` → returns `{ user, token, message }`.
   - On register, the new user is automatically given the Spatie **`user`** role
     (`$user->assignRole('user')` in `AuthController::register`).
2. The frontend stores `token` in `localStorage` (see `axiosConfig.js`) and attaches
   it as `Authorization: Bearer <token>` on every subsequent request.
3. `GET /api/user` (protected by `auth:sanctum`) returns the current user **and**
   their full permission list:
   ```json
   {
     "user": { "id": 1, "name": "...", "email": "...", "role": "admin" },
     "permissions": ["view products", "edit products", "..."]
   }
   ```
4. `AuthContext.jsx` calls this on load/token-change and exposes `user`,
   `permissions`, `isAuthenticated`, `hasPermission()`, and `hasAnyPermission()`
   to the rest of the app.
5. `PrivateRoute.jsx` redirects to `/login` if `isAuthenticated` is false.
6. `POST /api/logout` revokes the current Sanctum token.

---

## 4. Roles & Permissions (Spatie)

### 4.1 Two separate "role" systems exist — important gotcha

The `User` model has **both**:
- A plain `role` string column (`users.role`, added by
  `add_role_to_users_table` migration), checked by `User::isAdmin()` /
  `User::isUser()`.
- The Spatie `HasRoles` trait, backed by the `roles`, `permissions`,
  `model_has_roles`, and `role_has_permissions` tables.

These are **not automatically kept in sync**. `AdminMiddleware` (route alias
`admin`) checks the **plain column** (`$request->user()->isAdmin()`), while all
`permission:...` route middleware checks the **Spatie tables**. This means a
user can have the Spatie `admin` role assigned but still get blocked by
`AdminMiddleware` if their `role` column isn't literally `"admin"`, and vice
versa. When creating/promoting an admin, set **both**.

### 4.2 Seeded permissions (`RolesAndPermissionsSeeder`)

| Permission | Given to `admin` | Given to `user` |
|---|---|---|
| `view products` | ✅ | ✅ |
| `create products` | ✅ | ❌ |
| `edit products` | ✅ | ❌ |
| `delete products` | ✅ | ❌ |
| `view users` | ✅ | ✅ |
| `create users` | ✅ | ❌ |
| `edit users` | ✅ | ❌ |
| `delete users` | ✅ | ❌ |

Run it with:
```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```
or as part of a full reset:
```bash
php artisan migrate:fresh --seed
```
The seeder is **not idempotent** — running it twice on a database that already
has these permissions/roles will throw a duplicate-entry error. If you need to
re-seed, use `migrate:fresh --seed` instead of calling it again directly.

### 4.3 Assigning/checking roles manually (Tinker)

```bash
php artisan tinker
```
```php
$user = \App\Models\User::where('email', 'someone@example.com')->first();
$user->assignRole('admin');                       // grant Spatie role
$user->getAllPermissions()->pluck('name');         // verify permissions
$user->update(['role' => 'admin']);                // keep legacy column in sync
```

---

## 5. Backend Middleware Reference

Registered in `app/Http/Kernel.php` under `$routeMiddleware`:

| Alias | Class | Checks |
|---|---|---|
| `auth:sanctum` | (Sanctum) | Valid bearer token |
| `admin` | `App\Http\Middleware\AdminMiddleware` | `user()->isAdmin()` — legacy `role` column |
| `permission` | `Spatie\Permission\Middleware\PermissionMiddleware` | Spatie permission tables |
| `role` | `Spatie\Permission\Middleware\RoleMiddleware` | Spatie role tables |
| `role_or_permission` | `Spatie\Permission\Middleware\RoleOrPermissionMiddleware` | Either |

> **Known fix applied:** the Spatie middleware classes must be referenced under
> the `Spatie\Permission\Middleware` namespace (singular). A `Middlewares`
> (plural) typo will throw `BindingResolutionException: Target class ... does
> not exist` on every request that hits a `permission:` or `role:` gated route.

---

## 6. API Routes

All routes are prefixed with `/api`. Defined in `backend/routes/api.php`.

### Public

| Method | Path | Controller@method |
|---|---|---|
| POST | `/register` | `AuthController@register` |
| POST | `/login` | `AuthController@login` |

### Protected (`auth:sanctum`)

| Method | Path | Controller@method | Required permission |
|---|---|---|---|
| POST | `/logout` | `AuthController@logout` | — |
| GET | `/user` | `AuthController@user` | — |
| GET | `/products` | `ProductController@index` | `view products` |
| POST | `/products` | `ProductController@store` | `create products` |
| GET | `/products/{id}` | `ProductController@show` | `view products` |
| PUT | `/products/{id}` | `ProductController@update` | `edit products` |
| DELETE | `/products/{id}` | `ProductController@destroy` | `delete products` |
| GET | `/users` | `UserController@index` | `view users` |
| POST | `/users` | `UserController@store` | `create users` |
| GET | `/users/{id}` | `UserController@show` | `view users` |
| PUT | `/users/{id}` | `UserController@update` | `edit users` |
| DELETE | `/users/{id}` | `UserController@destroy` | `delete users` |
| PUT | `/users/{id}/role` | `UserController@updateRole` | `edit users` |

Note: `UserController`'s constructor **also** applies the `admin` middleware
to everything except `index`/`show` (see §4.1 gotcha) — so `store`, `update`,
`destroy`, and `updateRole` require the user to pass *both* the route's
`permission:` check *and* `AdminMiddleware`'s legacy-column check.

### Products validation rules

```
name        required|string|max:255
description nullable|string
price       required|numeric|min:0
stock       required|integer|min:0
```

### Users validation rules (store/update)

```
name        required|string|max:255           (sometimes on update)
email       required|email|unique:users        (sometimes on update; unique ignores self)
password    required|string|min:8              (sometimes on update)
role        sometimes|exists:roles,name
```

---

## 7. Frontend

### 7.1 Routing (`App.jsx`)

| Path | Component | Access |
|---|---|---|
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/products` | `Products` | `PrivateRoute` (any authenticated user) |
| `/users` | `UserList` | `PrivateRoute` (any authenticated user; UI further gated by role) |
| `/categories` | `Categories` | `PrivateRoute` — **placeholder only**, renders `<div>Category Page</div>` |
| `/` | redirects to `/products` | — |

### 7.2 `AuthContext.jsx`

Exposes:
```js
{
  user,               // current user object or null
  login, register, logout,
  loading,            // true while /user is being fetched
  isAuthenticated,    // !!user
  permissions,        // string[] from /api/user
  hasPermission(p),           // boolean
  hasAnyPermission([p, ...])  // boolean
}
```

### 7.3 `Navigation.jsx` — current gating logic

- **Products** link — shown to any logged-in user (no permission check).
- **Users** link — shown only if `user.role === 'admin'` (legacy column, **not**
  `hasPermission('view users')`).
- **Category** link — shown to any logged-in user, no gating at all.

⚠️ This is inconsistent with `Products.jsx`, which uses real Spatie
permissions (`hasPermission('create products')`, etc.). A user could satisfy
`hasPermission('view users')` via Spatie but still not see the **Users** link
if their legacy `role` column isn't `"admin"`. If you want the nav to reflect
actual permissions, replace the `user?.role === 'admin'` checks with
`hasPermission('view users')` (or `hasAnyPermission([...])`).

### 7.4 `Products.jsx` — permission-gated UI

- "Add New Product" button → requires `create products`.
- Product form (create or edit) → requires `create products` or `edit products`
  respectively.
- Per-row **Edit** button → requires `edit products`.
- Per-row **Delete** button → requires `delete products`.
- If the user lacks `view products` entirely, the list area shows a
  "You do not have permission to view products" message instead of the normal
  empty state.
- `handleSubmit` / `handleDelete` re-check permissions client-side before
  firing the request (defense-in-depth only — the backend `permission:`
  middleware is the actual enforcement layer).

### 7.5 `axiosConfig.js`

- Base URL is hardcoded to `http://127.0.0.1:8000/api`. Change this if your
  backend runs on a different host/port.
- Reads the token from `localStorage.getItem('token')` and attaches it as a
  `Bearer` header on every request.
- On a `401` response, clears the token and hard-redirects to `/login`.

---

## 8. Local Setup

### 8.1 Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# configure DB_* in .env (MySQL), then:
php artisan migrate --seed
php artisan serve   # http://127.0.0.1:8000
```

To create your first admin user, register normally through the frontend (or
`POST /api/register`), then promote it via Tinker:
```bash
php artisan tinker
```
```php
$user = \App\Models\User::where('email', 'you@example.com')->first();
$user->assignRole('admin');
$user->update(['role' => 'admin']);
```

### 8.2 Frontend

```bash
cd react-frontend
npm install
npm run dev   # http://127.0.0.1:5173
```

---

## 9. Known Issues / Rough Edges

1. **Dual role systems** (§4.1) — the plain `users.role` column and Spatie's
   role tables can drift out of sync since only some code paths update both.
2. **Non-idempotent seeder** — re-running `RolesAndPermissionsSeeder` on a
   database that already has the data throws a duplicate-key error; use
   `migrate:fresh --seed` to reset cleanly instead.
3. **Categories page is a stub** — `Categories.jsx` has no data-fetching, form,
   or backend routes/controller/model backing it yet.
4. **Navigation gating is inconsistent** — see §7.3; the nav bar checks the
   legacy `role` column while the actual page content checks real Spatie
   permissions.
5. **Hardcoded API base URL** in `axiosConfig.js` — not environment-driven,
   so switching between local/staging/production requires a code change.
6. **Middleware class must be `Spatie\Permission\Middleware\*`** (singular) in
   `Kernel.php` — a `Middlewares` (plural) typo will break every
   permission-gated route with a `BindingResolutionException`.

---

## 10. Troubleshooting Cheatsheet

| Symptom | Likely cause | Fix |
|---|---|---|
| `SyntaxError: JSON.parse... unexpected non-whitespace character` in the frontend when hitting `/api/products` | Laravel returned an HTML error page instead of JSON (usually a 500 from a bad middleware binding) | Check `storage/logs/laravel.log` or the raw response body; fix the underlying PHP error |
| `Target class [Spatie\Permission\Middlewares\PermissionMiddleware] does not exist` | Namespace typo in `Kernel.php` (`Middlewares` vs `Middleware`) | Fix to `Spatie\Permission\Middleware\...` (see §5), then `php artisan optimize:clear` |
| `403 — User does not have the right permissions` | The authenticated user has no rows in `model_has_permissions` / `model_has_roles` | In Tinker: check `$user->getAllPermissions()`; if empty, `assignRole()` the correct role; if the role itself doesn't exist, seed it first |
| `RoleDoesNotExist: There is no role named 'admin' for guard 'web'` | `RolesAndPermissionsSeeder` was never run against this database | `php artisan db:seed --class=RolesAndPermissionsSeeder` (or `migrate:fresh --seed`) |
| `Call to a member function assignRole() on null` | The `where('email', ...)` lookup didn't match any row (typo, or user doesn't exist) | List users with `\App\Models\User::all(['id','email'])` and confirm the exact email |
| Admin can see Spatie permissions in Tinker but still gets 403 on `/users` write endpoints | `AdminMiddleware` checks the legacy `role` column, not Spatie roles | Also run `$user->update(['role' => 'admin'])` |
