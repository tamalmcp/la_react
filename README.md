# La React

A CRUD application with a **Laravel 8** REST API backend (Sanctum auth +
Spatie Laravel-Permission for roles/permissions) and a **React 18 (Vite)**
frontend.

- `backend/` — Laravel API
- `react-frontend/` — React (Vite) SPA

For a deeper dive into architecture, routes, roles/permissions, and known
issues, see [`DOCUMENTATION.md`](./docs/DOCUMENTATION.md).

---

## Requirements

- PHP `^7.3 | ^8.0` with Composer
- MySQL (or another database supported by Laravel — update `.env` accordingly)
- Node.js `18+` and npm

---

## Getting Started

### 1. Backend (Laravel API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Open `.env` and set your database connection:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=la_react
DB_USERNAME=root
DB_PASSWORD=
```

Create the database, then run migrations and seed the default roles/permissions:

```bash
php artisan migrate --seed
```

Start the API server:

```bash
php artisan serve
```

The API will be available at `http://127.0.0.1:8000/api`.

### 2. Frontend (React)

```bash
cd react-frontend
npm install
npm run dev
```

The app will be available at `http://127.0.0.1:5173`.

> The frontend's API base URL is hardcoded in `src/api/axiosConfig.js` to
> `http://127.0.0.1:8000/api`. If your backend runs elsewhere, update that
> file.

---

## Creating Your First Admin User

1. Register a normal account through the frontend (`/register`) or via
   `POST /api/register`. New accounts are automatically given the `user` role.
2. Promote it to admin using Tinker:

   ```bash
   cd backend
   php artisan tinker
   ```

   ```php
   $user = \App\Models\User::where('email', 'you@example.com')->first();
   $user->assignRole('admin');       // Spatie role (drives `permission:` checks)
   $user->update(['role' => 'admin']); // legacy column (drives the `admin` middleware)
   ```

   Both steps are needed — see [`DOCUMENTATION.md`](./DOCUMENTATION.md#4-roles--permissions-spatie)
   for why the app has two separate role mechanisms.

---

## Default Roles & Permissions

Seeded by `database/seeders/RolesAndPermissionsSeeder.php`:

| Role | Permissions |
|---|---|
| `admin` | all permissions (products + users, full CRUD) |
| `user` | `view products`, `view users` |

Re-seed with:

```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

⚠️ This seeder is not idempotent — running it twice on data that already
exists will throw a duplicate-key error. To reset cleanly, use:

```bash
php artisan migrate:fresh --seed
```

(this wipes all data, including existing users).

---

## Troubleshooting

If something breaks after setup (e.g. `403` errors, permission middleware
errors, or JSON parse errors in the frontend), check the
[Troubleshooting Cheatsheet](./DOCUMENTATION.md#10-troubleshooting-cheatsheet)
in `DOCUMENTATION.md` — it covers the most common setup issues and their fixes.

---

## Project Structure

```
la_react/
├── backend/            Laravel API (routes, controllers, models, migrations)
├── react-frontend/      React (Vite) SPA
├── DOCUMENTATION.md    Full technical documentation
└── README.md           This file
```