require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const postRoutes = require('./routes/postRoutes');
const messageRoutes = require('./routes/messageRoutes');
const statsRoutes = require('./routes/statsRoutes');
const setupChatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Socket.io — CORS must match Vite origin.
const io = new Server(server, {
  cors: { origin: CLIENT_ORIGIN, credentials: true },
});

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

// Build the session middleware as a variable so we can share it with Socket.io.
const sessionMiddleware = session({
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
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});

app.use(sessionMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/stats', statsRoutes);

// Health check.
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ ok: true, time: new Date().toISOString(), mongoState: mongoose.connection.readyState });
});

app.use(errorMiddleware);

// Pass the session middleware to Socket.io so it can read session.userId.
setupChatSocket(io, sessionMiddleware);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`FitTogether server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
