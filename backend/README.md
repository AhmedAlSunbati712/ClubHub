# ClubHub Backend - 

ReadMe largely by Claude

Flask REST for ClubHub; Backend supporting services needed for app

## Stack

- **Python / Flask** — web framework
- **MySQL** — database (via `mysql-connector-python`)
- **Pydantic** — request body validation
- **PyJWT + bcrypt** — authentication

## Project Structure

```
backend/
├── app.py                      # app factory, registers all blueprints
├── config/
│   ├── env.py                  # loads env vars into an ENV class
│   └── db.py                   # get_connection() helper
├── models/
│   └── enums.py                # shared enums (UserRole, EventStatus, RSVPStatus, etc.)
├── routes/
│   ├── users.py                # /api/users
│   ├── events.py               # /api/events and /api/clubs/:clubId/events
│   ├── rsvps.py                # /api/events/:eventId/rsvps
│   └── checkins.py             # /api/events/:eventId/checkins
├── controllers/
│   ├── user_controller.py      # request parsing and responses for users
│   ├── event_controller.py     # request parsing and responses for events
│   ├── rsvp_controller.py      # RSVP logic including waitlist promotion
│   └── checkin_controller.py   # check-in logic (officer/admin only)
├── services/
│   ├── auth_service.py         # password hashing, JWT encode/decode
│   ├── user_service.py         # SQL queries for users
│   ├── event_service.py        # SQL queries for events + club role lookups
│   ├── rsvp_service.py         # SQL queries for RSVPs
│   └── checkin_service.py      # updates CheckedIn/CheckInTime on the RSVP row
├── schemas/
│   ├── user.py                 # Pydantic models for user requests
│   ├── event.py                # Pydantic models for event requests
│   └── rsvp.py                 # Pydantic model for RSVP status update
└── middleware/
    └── auth.py                 # @require_auth() decorator
```

The request flow is: **route → controller → service → database**.

## Setup

1. Copy `.env.example` to `.env` and fill in your values.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Make sure your MySQL database is running and the `clubhub` schema exists.
4. Run the server:
   ```
   python app.py
   ```

The server starts on port `5000` by default.

## Environment Variables

| Variable           | Required | Default     | Description                  |
|--------------------|----------|-------------|------------------------------|
| `PORT`             | no       | `5000`      | Port the server listens on   |
| `DB_HOST`          | no       | `localhost` | MySQL host                   |
| `DB_PORT`          | no       | `3306`      | MySQL port                   |
| `DB_USER`          | yes      | —           | MySQL username               |
| `DB_PASSWORD`      | yes      | —           | MySQL password               |
| `DB_NAME`          | no       | `clubhub`   | MySQL database name          |
| `JWT_SECRET`       | yes      | —           | Secret key for signing JWTs  |
| `JWT_EXPIRY_HOURS` | no       | `24`        | How long tokens stay valid   |

## Authentication

Protected routes require a `Bearer` token in the `Authorization` header. Tokens are JWTs signed with `JWT_SECRET`. The `@require_auth()` decorator injects the decoded payload into `g.current_user` — use `g.current_user["sub"]` for the user ID and `g.current_user["role"]` for the global role.

Pass `admin_only=True` to restrict a route to admins only. For officer-level checks (events, RSVPs, check-ins), the controller queries the `Memberships` table to confirm the user is an Officer or President of the relevant club.

## Endpoints

### Users

| Method | Path                 | Auth          | Description              |
|--------|----------------------|---------------|--------------------------|
| POST   | `/api/users/`        | none          | Create a new user        |
| GET    | `/api/users/:userId` | user or admin | Get a user by ID         |
| GET    | `/api/users/`        | admin only    | List / search users      |
| PUT    | `/api/users/:userId` | user or admin | Update a user            |
| DELETE | `/api/users/:userId` | user or admin | Delete a user            |

### Events

| Method | Path                        | Auth            | Description                        |
|--------|-----------------------------|-----------------|------------------------------------|
| POST   | `/api/events/`              | officer / admin | Create an event                    |
| GET    | `/api/events/:eventId`      | none            | Get one event                      |
| GET    | `/api/events/`              | none            | List / filter events               |
| PUT    | `/api/events/:eventId`      | officer / admin | Update event details or status     |
| DELETE | `/api/events/:eventId`      | officer / admin | Delete an event                    |
| GET    | `/api/clubs/:clubId/events` | none            | List all events for a club         |

Query params for `GET /api/events`: `clubId`, `status`, `title`.

Event capacity may not exceed the location's capacity. Events with status `Cancelled` or `Completed` do not accept new RSVPs.

### RSVPs

| Method | Path                                   | Auth            | Description                              |
|--------|----------------------------------------|-----------------|------------------------------------------|
| POST   | `/api/events/:eventId/rsvps`           | any user        | RSVP — confirmed or waitlisted by capacity |
| GET    | `/api/events/:eventId/rsvps`           | officer / admin | List all RSVPs for an event              |
| PUT    | `/api/events/:eventId/rsvps/:userId`   | user or admin   | Update RSVP status (e.g. cancel)         |
| DELETE | `/api/events/:eventId/rsvps/:userId`   | user or admin   | Remove an RSVP                           |

When a confirmed RSVP is cancelled or deleted, the oldest waitlisted RSVP (by `RequestedAt`) is automatically promoted to confirmed.

### Check-ins

| Method | Path                                      | Auth            | Description               |
|--------|-------------------------------------------|-----------------|---------------------------|
| POST   | `/api/events/:eventId/checkins/:userId`   | officer / admin | Check a user in           |
| DELETE | `/api/events/:eventId/checkins/:userId`   | officer / admin | Undo a check-in           |
| GET    | `/api/events/:eventId/checkins`           | officer / admin | List checked-in attendees |

Check-in data (`CheckedIn`, `CheckInTime`) is stored directly on the RSVP row — there is no separate check-ins table. A user must have a non-cancelled RSVP to be checked in.

## Adding a New Resource

Follow this pattern (copy from users as a template):

1. `schemas/<resource>.py` — Pydantic model for the request body
2. `services/<resource>_service.py` — SQL queries, no Flask imports
3. `controllers/<resource>_controller.py` — parse request, auth check, return response
4. `routes/<resource>.py` — Blueprint with URL rules and auth decorators
5. Register the blueprint in `routes/__init__.py`
