const Chat = require('../models/Chat');

const initChatSocket = (io) => {
  console.log('⚡ Socket.io real-time chat service initialized');

  io.on('connection', (socket) => {
    // console.log(`🔌 Client connected to socket: ${socket.id}`);

    // Join a specific room (either customer or admin for that specific buyer)
    socket.on('join_room', async ({ roomId, userRole, userName }) => {
      if (!roomId) return;
      socket.join(roomId);
      // console.log(`👤 ${userName || userRole} joined room: ${roomId}`);

      // Notify other participants in the room
      socket.to(roomId).emit('participant_joined', {
        userRole,
        userName,
        socketId: socket.id,
        timestamp: new Date(),
      });
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const {
          roomId,
          sender,
          senderName,
          text,
          customerName,
          customerEmail,
          customerPhone,
          propertyTitle,
          propertySlug,
          propertyImage,
          propertyPrice,
        } = data;

        if (!roomId || !text || !sender) return;

        const newMsg = {
          sender,
          senderName: senderName || (sender === 'customer' ? 'Buyer' : 'Senior Property Specialist'),
          text: text.trim(),
          timestamp: new Date(),
          read: false,
        };

        // Find or create Chat in MongoDB
        let chat = await Chat.findOne({ roomId });

        if (!chat) {
          chat = new Chat({
            roomId,
            customerName: customerName || 'Interested Buyer',
            customerEmail: customerEmail || 'buyer@example.com',
            customerPhone: customerPhone || '',
            propertyTitle: propertyTitle || 'Luxury Real Estate',
            propertySlug: propertySlug || '',
            propertyImage: propertyImage || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
            propertyPrice: propertyPrice || '',
            messages: [newMsg],
            lastMessage: newMsg.text,
            lastMessageAt: newMsg.timestamp,
            unreadAdminCount: sender === 'customer' ? 1 : 0,
            unreadCustomerCount: sender !== 'customer' ? 1 : 0,
          });
        } else {
          chat.messages.push(newMsg);
          chat.lastMessage = newMsg.text;
          chat.lastMessageAt = newMsg.timestamp;
          if (sender === 'customer') {
            chat.unreadAdminCount = (chat.unreadAdminCount || 0) + 1;
          } else {
            chat.unreadCustomerCount = (chat.unreadCustomerCount || 0) + 1;
          }
        }

        await chat.save();

        // Broadcast to everyone in the room (both buyer and admin)
        io.to(roomId).emit('receive_message', {
          ...newMsg,
          roomId,
        });

        // If customer sent the message, broadcast sound alert notification to Admin dashboard
        if (sender === 'customer') {
          io.emit('new_admin_notification', {
            type: 'incoming_chat',
            roomId,
            customerName: chat.customerName,
            customerEmail: chat.customerEmail,
            propertyTitle: chat.propertyTitle,
            text: newMsg.text,
            timestamp: newMsg.timestamp,
            playSound: true,
          });
        }
      } catch (err) {
        console.error('Socket message processing error:', err);
      }
    });

    // Typing Indicator
    socket.on('typing', ({ roomId, sender, isTyping }) => {
      if (!roomId) return;
      socket.to(roomId).emit('user_typing', { sender, isTyping });
    });

    // Mark as read
    socket.on('mark_read', async ({ roomId, role }) => {
      if (!roomId) return;
      try {
        const chat = await Chat.findOne({ roomId });
        if (chat) {
          if (role === 'admin') chat.unreadAdminCount = 0;
          if (role === 'customer') chat.unreadCustomerCount = 0;
          await chat.save();
          io.to(roomId).emit('messages_marked_read', { roomId, role });
        }
      } catch (e) {
        console.warn('Error marking read:', e.message);
      }
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });
};

module.exports = initChatSocket;
