const { Server } = require('socket.io');

let ioInstance;

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // For development, you can restrict this to your frontend URL in production
      methods: ['GET', 'POST']
    }
  });

  ioInstance = io;

  // Track room state
  const rooms = {};

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a live session room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      
      if (!rooms[roomId]) {
        rooms[roomId] = { viewers: 0, messages: [] };
      }
      rooms[roomId].viewers += 1;

      // Broadcast updated viewer count
      io.to(roomId).emit('viewer_count', rooms[roomId].viewers);
      
      // Send message history to the newly connected user
      socket.emit('chat_history', rooms[roomId].messages);

      console.log(`Socket ${socket.id} joined room ${roomId}. Viewers: ${rooms[roomId].viewers}`);
    });

    // Join the dashboard room to receive global/user-specific real-time updates
    socket.on('join_dashboard', (userId) => {
      // Users can join a general dashboard room, and their own specific room
      socket.join('dashboard_global');
      if (userId) {
        socket.join(`dashboard_user_${userId}`);
      }
      console.log(`Socket ${socket.id} joined dashboard for user ${userId || 'guest'}`);
    });

    // Handle chat message
    socket.on('chat_message', ({ roomId, message }) => {
      if (rooms[roomId]) {
        // Keep only the last 100 messages
        if (rooms[roomId].messages.length > 100) {
          rooms[roomId].messages.shift();
        }
        rooms[roomId].messages.push(message);
      }
      
      // Broadcast to everyone in the room, including sender
      io.to(roomId).emit('chat_message', message);
    });

    // Handle reaction
    socket.on('reaction', ({ roomId, reaction }) => {
      // Broadcast reaction to everyone else in the room
      socket.to(roomId).emit('reaction', reaction);
    });

    // Handle QA messages for Course Viewer
    socket.on('qa_new_question', ({ roomId, question }) => {
      io.to(roomId).emit('qa_new_question', question);
    });

    socket.on('qa_new_reply', ({ roomId, qaId, reply }) => {
      io.to(roomId).emit('qa_new_reply', { qaId, reply });
    });

    // Handle course real-time views
    socket.on('increment_view', ({ courseId }) => {
      // Broadcast to all clients that this course was viewed
      io.emit('view_count_updated', { courseId });
    });

    // Leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      if (rooms[roomId]) {
        rooms[roomId].viewers = Math.max(0, rooms[roomId].viewers - 1);
        io.to(roomId).emit('viewer_count', rooms[roomId].viewers);
      }
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle disconnect
    socket.on('disconnecting', () => {
      // Decrement viewer count for all rooms this socket was in
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id && rooms[roomId]) {
          rooms[roomId].viewers = Math.max(0, rooms[roomId].viewers - 1);
          io.to(roomId).emit('viewer_count', rooms[roomId].viewers);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized');
  }
  return ioInstance;
}

module.exports = { setupSocketIO, getIO };
