const Chat = require('../models/Chat');

exports.getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    let chat = await Chat.findOne({ roomId });

    if (!chat) {
      return res.json({
        success: true,
        data: {
          roomId,
          messages: [],
          lastMessage: '',
        },
      });
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, message: 'Failed to load chat history', error: error.message });
  }
};

exports.getAllAdminChats = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { propertyTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const chats = await Chat.find(query).sort({ lastMessageAt: -1 });

    const totalUnread = chats.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);

    res.json({
      success: true,
      count: chats.length,
      totalUnread,
      data: chats,
    });
  } catch (error) {
    console.error('Error fetching admin chats:', error);
    res.status(500).json({ success: false, message: 'Failed to load admin chats', error: error.message });
  }
};

exports.markChatRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { role } = req.body; // 'admin' or 'customer'

    const chat = await Chat.findOne({ roomId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    if (role === 'admin') {
      chat.unreadAdminCount = 0;
    } else {
      chat.unreadCustomerCount = 0;
    }

    // Mark messages as read
    chat.messages.forEach((m) => {
      if ((role === 'admin' && m.sender === 'customer') || (role === 'customer' && m.sender !== 'customer')) {
        m.read = true;
      }
    });

    await chat.save();
    res.json({ success: true, message: 'Chat marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark read', error: error.message });
  }
};
