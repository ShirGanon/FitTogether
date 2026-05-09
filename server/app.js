// FitTogether server entry point.
// Wires up Express, session middleware, MongoDB connection, and the (currently
// minimal) /api/health route. As the project grows we will mount additional
// route files (auth, users, groups, posts, messages, stats) and the Socket.io
// chat handler from sockets/chatSocket.js.

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

app.use(
  session({
    name: 'fittogether.sid',
    secret: process.env.SESSION_SECRET || 'dev-only-change-me',
    resave: false,
    saveUninitialized: false,
    store: process.env.MONGO_URI
      ? MongoStore.create({ mongoUrl: process.env.MONGO_URI })
      : undefined,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // one week
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check — proves end-to-end wiring (client → Vite proxy → Express → Mongo).
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    ok: true,
    time: new Date().toISOString(),
    mongoState: mongoose.connection.readyState, // 1 === connected
  });
});

// Central error handler — must be last middleware.
app.use(errorMiddleware);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FitTogether server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
