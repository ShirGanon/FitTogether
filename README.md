# FitTogether

Social network for fitness communities. Final project for the Android 2 course.

See [FitTogether_Project_Plan_AI_Prompt_EN.md](FitTogether_Project_Plan_AI_Prompt_EN.md) for the full specification (models, screens, defense checklist).

## Stack

- **Server:** Node.js, Express, MongoDB (Mongoose), Socket.io, express-session + bcrypt (no JWT).
- **Client:** React (Vite), jQuery + Ajax (centralized in `client/src/api/ajaxClient.js`), CSS3, D3.js, HTML video, HTML canvas.
- **Architecture:** MVC.

## Project layout

```
fittogether/
  server/   Express + Mongoose + Socket.io
  client/   React (Vite) + jQuery
```

## Quickstart

1. **Clone** the repo.
2. **Install** dependencies for root, server, and client:
   ```bash
   npm run install:all
   ```
3. **Configure environment.** Copy `.env.example` to `server/.env` and fill in your MongoDB Atlas URI and a session secret:
   ```bash
   cp .env.example server/.env
   ```
4. **Run dev servers** (Express on `:3000`, Vite on `:5173`):
   ```bash
   npm run dev
   ```
5. Open <http://localhost:5173>.

The Vite client proxies `/api` and `/socket.io` to the Express server, so client code can call `/api/health` directly without worrying about CORS.

## Phase progress

This project is being built phase-by-phase. Each phase ends with a commit:

- [x] **Phase 1** — Skeleton (Express + Vite + Mongo + jQuery Ajax health check)
- [ ] **Phase 2** — User auth and profile
- [ ] **Phase 3** — Fitness groups + manager permissions
- [ ] **Phase 4** — Posts and feed
- [ ] **Phase 5** — Advanced search
- [ ] **Phase 6** — Realtime chat (Socket.io)
- [ ] **Phase 7** — D3 statistics
- [ ] **Phase 8** — Video, Canvas, CSS3 polish
- [ ] **Phase 9** — Seed data + defense prep
