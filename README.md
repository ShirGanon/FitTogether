# FitTogether

A fullstack social network built for fitness communities. Users can join or create fitness groups, post workout updates, follow friends, chat in real time, and explore statistics about their activity — all in one place.

> Final project for the Android 2 course.

---

## Features

- **Authentication** — Register, login, and logout with secure session-based auth (bcrypt + express-session). No JWT.
- **User profiles** — Editable profile with preferred workout type, fitness level, location, and a canvas-rendered activity badge.
- **Fitness groups** — Create public or private groups. Managers approve membership requests, manage members, and moderate posts. Members can leave at any time.
- **Posts & feed** — Share workout updates with your groups and friends. The feed aggregates posts from all your groups and followed users, newest first.
- **Advanced search** — Search groups by name, workout type, location, difficulty, and privacy. Search posts by keyword, type, workout category, difficulty, date range, and group.
- **Real-time chat** — One-on-one messaging powered by Socket.io. Unread message badges update live as messages arrive. Conversation history is persisted in MongoDB.
- **Statistics dashboard** — D3.js charts showing your posts by workout type and activity over time (posts per month).
- **Media** — About page with an embedded HTML5 video. Profile page with an HTML5 canvas fitness badge that reflects your workout level.
- **Online presence** — Live online/offline indicators in the chat sidebar, updated via Socket.io events.

---

## Tech stack

| Layer | Technologies |
|---|---|
| **Server** | Node.js, Express, Mongoose (MongoDB Atlas), Socket.io, express-session, bcrypt, connect-mongo |
| **Client** | React 18, Vite, jQuery Ajax (via `ajaxClient.js`), D3.js, HTML5 canvas, HTML5 video |
| **Architecture** | MVC — thin routes, controller logic, Mongoose models |
| **Auth** | Session cookie (express-session + connect-mongo). No JWT. |
| **CSS** | Custom CSS3 design system — `@font-face`, `text-shadow`, `transition`, multi-column layout, `border-radius`, CSS variables |
| **Testing** | Jest + Supertest + mongodb-memory-server (46 server-side tests) |

---

## Project structure

```
fittogether/
├── server/
│   ├── app.js                  # Express app entry point
│   ├── config/db.js            # MongoDB Atlas connection
│   ├── controllers/            # Business logic
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   ├── middleware/             # Auth, error handling, group permissions
│   ├── sockets/chatSocket.js   # Socket.io event handlers
│   ├── seed/seedData.js        # Seed script (10+ users, groups, posts, messages)
│   └── tests/                  # Jest + Supertest test suites
└── client/
    ├── src/
    │   ├── api/                # jQuery Ajax wrappers (ajaxClient.js + per-resource files)
    │   ├── components/         # Reusable UI components
    │   ├── context/            # AuthContext (React Context)
    │   ├── pages/              # Route-level page components
    │   └── styles/global.css   # Global CSS design system
    └── vite.config.js          # Vite dev server + proxy config
```

---

## Getting started

### Prerequisites

- Node.js ≥ 18
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works fine)

### Installation

1. **Clone** the repository:
   ```bash
   git clone <repo-url>
   cd fittogether
   ```

2. **Install all dependencies** (root + server + client):
   ```bash
   npm run install:all
   ```

3. **Configure environment variables.** Copy the example file and fill in your values:
   ```bash
   cp .env.example server/.env
   ```
   Edit `server/.env`:
   ```
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/fittogether
   SESSION_SECRET=pick-a-long-random-string
   PORT=3000
   ```

4. **Start the dev servers** (Express on `:3000`, Vite on `:5173`):
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies all `/api` and `/socket.io` requests to Express, so the client never needs to hardcode a backend URL.

---

## Seed data

Populate the database with realistic demo data (11 users, 7 groups, 43 posts, 24 messages):

```bash
cd server
npm run seed
```

All seeded users share the password **`Password1!`**. You can log in with any of them to explore the app with real content. The seed includes:

- One **private group** with two pending membership requests
- Multiple **group managers** and regular members
- Posts across all workout types and difficulty levels
- Several active **chat conversations**

---

## Running tests

Server-side tests use Jest, Supertest, and an in-memory MongoDB instance (no Atlas required):

```bash
cd server
npm test
```

The suite covers **46 tests** across 5 modules:

| File | Coverage |
|---|---|
| `auth.test.js` | Register, login, logout, /me |
| `users.test.js` | List, get, update (own vs other), friends, delete |
| `groups.test.js` | Create, list, get, update, delete, join, request/approve/reject |
| `posts.test.js` | Create, feed, my-posts, edit, delete (own vs other) |
| `stats.test.js` | Posts-by-workout-type, posts-by-month, auth guard |

---

## API overview

All client HTTP calls go through `client/src/api/ajaxClient.js` (jQuery Ajax wrapper).

| Resource | Base route |
|---|---|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Groups | `/api/groups` |
| Posts | `/api/posts` |
| Messages | `/api/messages` |
| Statistics | `/api/stats` |
| Health | `/api/health` |

Real-time events (online presence, chat messages) are handled separately via Socket.io.
