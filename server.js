require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:XcwnkUsJQNgnSDoOSvTZMPiUybslouYx@hopper.proxy.rlwy.net:25743', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Message Model
const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  color: { type: String, default: '#007bff' }
});

const Message = mongoose.model('Message', messageSchema);

// Express setup
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io
io.on('connection', (socket) => {
  console.log('New user connected');

  // Load last 50 messages
  Message.find().sort({ timestamp: 1 }).limit(50).exec((err, messages) => {
    if (err) return console.error(err);
    socket.emit('init', messages);
  });

  // Handle new message
  socket.on('chat message', async (msg) => {
    try {
      const newMessage = new Message(msg);
      await newMessage.save();
      io.emit('chat message', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Handle user typing
  socket.on('typing', (user) => {
    socket.broadcast.emit('typing', user);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
