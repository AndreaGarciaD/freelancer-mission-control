# Freelancer Mission Control - Backend API

A RESTful API for freelancers to manage clients, projects, phases, and documents. Built with a modular, production-style architecture using Node.js, Express, and TypeScript.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Language:** TypeScript
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt

---

## Architecture

The codebase follows a strict separation of concerns across dedicated layers:

```
src/
├── config/          # Environment variable loading and validation
├── controllers/     # HTTP request/response handling
├── db/              # Database connection pool and schema
├── middleware/      # Authentication and error handling
├── routes/          # Route definitions
├── services/        # Business logic
├── types/           # Shared TypeScript interfaces
└── utils/           # Shared utilities (AppError)
```


---

## Getting Started

### Prerequisites

- Node.js v18+
- MySQL 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/AndreaGarciaD/freelancer-mission-control.git
cd freelancer-mission-control

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=freelancer_control

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Database Setup

Run the schema against your MySQL instance:

```bash
mysql -u root -p < src/db/schema.sql
```

### Running the App

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start
```

On startup, the server validates all required environment variables and tests the database connection before accepting any traffic.

---

## API Reference

All protected routes require the following header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| POST | `/api/auth/register` | Public | Create a new account |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| GET | `/api/auth/me` | Protected | Get current user info |

**Register**
```json
POST /api/auth/register
{
  "name": "Ana Lopez",
  "email": "ana@example.com",
  "password": "securepassword"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "ana@example.com",
  "password": "securepassword"
}
```
Returns: `{ "token": "eyJ...", "user": { ... } }`

---

### Clients

All routes protected. Users can only access their own clients.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clients` | Create a client |
| GET | `/api/clients` | Get all clients |
| GET | `/api/clients/:id` | Get a client by ID |
| PUT | `/api/clients/:id` | Update a client |
| DELETE | `/api/clients/:id` | Delete a client |

**Query Parameters for GET /api/clients**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by name, company, or email |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

---

### Projects

All routes protected. Users can only access their own projects.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create a project |
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get a project by ID |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project |

**Query Parameters for GET /api/projects**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Filter by title, description, or client name |
| `status` | string | Filter by `active`, `completed`, `on_hold`, `cancelled` |
| `priority` | string | Filter by `low`, `medium`, `high` |
| `client_id` | number | Filter by client |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |

**Project fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Project title |
| `client_id` | number | No | Associated client |
| `description` | string | No | Project description |
| `status` | string | No | `active` (default), `completed`, `on_hold`, `cancelled` |
| `priority` | string | No | `low`, `medium`, `high` (default) |
| `deadline` | date | No | Project deadline (YYYY-MM-DD) |
| `rate` | number | No | Hourly rate |
| `budget` | number | No | Project budget |

---

### Phases

Phases belong to a project and represent timeline steps.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:projectId/phases` | Create a phase |
| GET | `/api/projects/:projectId/phases` | Get all phases (ordered by timeline) |
| GET | `/api/projects/:projectId/phases/:id` | Get a phase by ID |
| PUT | `/api/projects/:projectId/phases/:id` | Update a phase |
| PUT | `/api/projects/:projectId/phases/reorder` | Reorder phases |
| DELETE | `/api/projects/:projectId/phases/:id` | Delete a phase |

**Reorder phases**
```json
PUT /api/projects/1/phases/reorder
{
  "orderedIds": [3, 1, 2]
}
```
Accepts an array of phase IDs in the desired order. Returns the updated phase list.

**Phase status values:** `pending`, `in_progress`, `completed`

---

### Documents

Documents are links attached to a project (Google Docs, Zoom recordings, Figma files, etc).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:projectId/documents` | Attach a document |
| GET | `/api/projects/:projectId/documents` | Get all documents |
| GET | `/api/projects/:projectId/documents/:id` | Get a document by ID |
| PUT | `/api/projects/:projectId/documents/:id` | Update a document |
| DELETE | `/api/projects/:projectId/documents/:id` | Delete a document |

**Document fields**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Display name |
| `url` | string | Yes | Valid URL |
| `type` | string | No | `doc`, `meeting`, `design`, `other` (default) |

---

## Key Design Decisions

**Fail-fast startup**. The server validates all environment variables and tests the database connection before accepting any requests. Missing config crashes immediately with a clear message rather than failing silently at runtime.

**Ownership enforced at the database layer**. Every query includes `user_id = ?` as a condition. It is structurally impossible for a user to access another user's data, regardless of how requests are constructed.

**Centralized error handling**. A single error handler middleware catches all errors. Controllers pass errors via `next(error)` rather than handling them individually, keeping HTTP logic clean and error formatting consistent across the entire API.

**Nested resource URLs**. Phases and documents live under `/api/projects/:projectId/...`, which reflects their ownership chain and makes the API structure self-documenting.

**Generic error messages for auth**. Login returns `"Invalid email or password"` regardless of which field is wrong, preventing user enumeration attacks.

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 204 | Success, no content (deletes) |
| 400 | Bad request / missing fields |
| 401 | Unauthorized / invalid token |
| 404 | Resource not found |
| 409 | Conflict (e.g. email already in use) |
| 500 | Internal server error |

---

## Health Check

```
GET /health
```

Returns server status and timestamp. No authentication required.