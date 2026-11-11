# Mini Project Manager

A small project-management web app: sign up, create projects, and manage tasks inside each project.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + Next.js 14 (App Router) |
| State | Redux Toolkit (`auth`, `projects`, `tasks` slices) |
| Backend | Next.js API route handlers (Node.js) — RESTful endpoints |
| Database | MongoDB (local or Atlas) via Mongoose |
| Auth | JWT (7 day expiry), passwords hashed with bcrypt |

## Features

- Signup / login with email & password
- JWT stored in an **httpOnly cookie** (not readable by JS, safer against XSS). The token is also returned in the login response and the API accepts `Authorization: Bearer <token>`, so you can test with Postman/curl.
- Protected routes: `src/middleware.js` guards the pages (`/dashboard`, `/projects/*`) and every API route verifies the JWT
- Projects (`title`, `description`): create / edit / delete, each user only sees their own
- Tasks (`title`, `description`, `status` = `todo | in-progress | done`, `dueDate`): create / edit / delete, quick status change
- Filter tasks by status, sort by due date / status / created date (asc or desc)

## Setup (frontend + backend are one Next.js app)

**Prerequisites:** Node.js 18.17+ and MongoDB (local install, or a free MongoDB Atlas cluster).

```bash
# 1. install dependencies
npm install

# 2. create your env file
cp  .env.local

# 3. run in development
npm run dev
#    open http://localhost:3000

# production build
npm run build && npm start
```

### Environment variables (`.env.example`)

| Name | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Long random string used to sign JWTs |

## API reference

All routes except `signup` and `login` need a valid JWT.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password }` |
| POST | `/api/auth/login` | `{ email, password }` |
| POST | `/api/auth/logout` | clears the cookie |
| GET | `/api/auth/me` | current user |
| GET | `/api/projects` | list my projects |
| POST | `/api/projects` | `{ title, description }` |
| GET / PUT / DELETE | `/api/projects/:id` | read / update / delete (deleting also removes its tasks) |
| GET | `/api/projects/:id/tasks?status=todo&sortBy=dueDate&order=asc` | list tasks. `status`: `all/todo/in-progress/done`; `sortBy`: `dueDate/status/createdAt`; `order`: `asc/desc` |
| POST | `/api/projects/:id/tasks` | `{ title, description, status, dueDate }` |
| PUT / DELETE | `/api/tasks/:id` | update / delete a task |

## Implementation notes

- Ownership is enforced on the server: every project/task query includes the logged-in user's id, so one user can never read or change another user's data (returns 404).
- Sorting puts tasks **without a due date last**, and status sorts in workflow order (todo → in-progress → done), not alphabetically.
- Overdue (past due and not done) tasks are highlighted.
- Next.js is used for both frontend and backend to keep setup to a single `npm install` / `npm run dev`.
