// Real-time chat handler using Socket.io.
// The session middleware is shared with Express so each socket can read
// req.session.userId without trusting user-supplied data.

const Message = require('../models/Message');

function setupChatSocket(io, sessionMiddleware) {
  // Share the Express session with Socket.io so we can read session.userId.
  io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
  });

  // Map userId (string) → socket.id for routing messages to online users.
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    const userId = socket.request.session?.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    onlineUsers.set(userId, socket.id);

    // Let the client know who is currently online.
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // Notify others this user is now online.
    socket.broadcast.emit('user_online', userId);

    // Handle sending a message.
    socket.on('send_message', async ({ receiverId, content }) => {
      if (!content || !receiverId) return;

      try {
        // Persist to MongoDB first.
        const message = await Message.create({ senderId: userId, receiverId, content });
        const populated = await Message.findById(message._id)
          .populate('senderId', 'username fullName')
          .populate('receiverId', 'username fullName');

        // Send to receiver if they are online.
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', populated);
        }

        // Confirm delivery to sender.
        socket.emit('message_sent', populated);
      } catch (err) {
        socket.emit('message_error', { error: 'Failed to send message.' });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user_offline', userId);
    });
  });
}

module.exports = setupChatSocket;
