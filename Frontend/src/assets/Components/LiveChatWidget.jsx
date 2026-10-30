import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Phone,
  Building2,
  CheckCheck,
  Minimize2,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useCustomerAuth } from '../Context/CustomerAuthContext';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const LiveChatWidget = () => {
  const { customer, isLoggedIn } = useCustomerAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [agentTyping, setAgentTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Customer identity
  const [customerName, setCustomerName] = useState('Guest Buyer');
  const [customerEmail, setCustomerEmail] = useState('guest@modernrealestate.com');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Sync with logged in customer
  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name || customer.firstName || 'Valued Buyer');
      setCustomerEmail(customer.email || 'buyer@example.com');
      setCustomerPhone(customer.phone || '+91 98765 43210');
    } else {
      const savedEmail = localStorage.getItem('guest_chat_email') || `guest_${Math.random().toString(36).substring(2, 7)}@example.com`;
      localStorage.setItem('guest_chat_email', savedEmail);
      setCustomerEmail(savedEmail);
      setCustomerName(localStorage.getItem('guest_chat_name') || 'Guest Visitor');
    }
  }, [customer]);

  const roomId = `room_${customerEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', {
        roomId,
        userRole: 'customer',
        userName: customerName,
      });
    });

    // Listen for incoming messages
    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpen && msg.sender !== 'customer') {
        setUnreadCount((cnt) => cnt + 1);
      }
    });

    // Listen for agent typing indicator
    socket.on('user_typing', ({ sender, isTyping }) => {
      if (sender !== 'customer') {
        setAgentTyping(isTyping);
      }
    });

    // Fetch initial chat history from backend
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${SOCKET_SERVER_URL}/api/chat/history/${roomId}`);
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.messages)) {
          if (data.data.messages.length > 0) {
            setMessages(data.data.messages);
          } else {
            // Default greeting
            setMessages([
              {
                sender: 'agent',
                senderName: 'Vikram Malhotra',
                text: `Hello ${customerName}! 🏛️ I'm Vikram Malhotra, Senior Property Specialist. How may I assist you with site visits, floor plans, or booking terms today?`,
                timestamp: new Date(),
              },
            ]);
          }
        }
      } catch (e) {
        console.warn('Chat history load failed:', e);
      }
    };

    fetchHistory();

    return () => {
      socket.disconnect();
    };
  }, [customerEmail, roomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
      if (socketRef.current) {
        socketRef.current.emit('mark_read', { roomId, role: 'customer' });
      }
    }
  }, [messages, isOpen, roomId]);

  // Handle Input Typing
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (socketRef.current) {
      socketRef.current.emit('typing', {
        roomId,
        sender: 'customer',
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', {
          roomId,
          sender: 'customer',
          isTyping: false,
        });
      }, 1500);
    }
  };

  // Send Message
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      roomId,
      sender: 'customer',
      senderName: customerName,
      text,
      customerName,
      customerEmail,
      customerPhone,
      propertyTitle: 'Modern Luxury Estates Marketplace',
    });

    setInputMessage('');

    if (socketRef.current) {
      socketRef.current.emit('typing', {
        roomId,
        sender: 'customer',
        isTyping: false,
      });
    }
  };

  const handleQuickQuestion = (q) => {
    handleSendMessage(q);
  };

  return (
    <div className={`fixed bottom-3 right-3 sm:bottom-5 sm:right-5 select-none font-sans ${isOpen ? 'z-[9995]' : 'z-40'}`}>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-dark hover:bg-black text-white p-3 sm:p-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-2 border-white/20"
          aria-label="Open Live Chat"
        >
          <MessageCircle size={20} className="text-white sm:w-5.5 sm:h-5.5" />
          
          {/* Active pulse dot */}
          <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
              {unreadCount}
            </span>
          )}

          {/* Tooltip on hover */}
          <span className="hidden group-hover:flex absolute right-16 top-1/2 -translate-y-1/2 bg-dark/95 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg border border-white/10 items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            <span>Chat Live with Property Specialist</span>
          </span>
        </button>
      )}

      {/* Live Chat Window Card */}
      {isOpen && (
        <div className="w-[calc(100vw-24px)] max-w-[380px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-black/10 flex flex-col overflow-hidden animate-fade-in text-dark">
          {/* Header */}
          <div className="bg-gradient-to-r from-dark to-neutral-900 text-white p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Advisor"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-dark rounded-full" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 leading-tight">
                  <span>Vikram Malhotra</span>
                  <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
                </h4>
                <p className="text-[10px] text-gray-300 truncate">Senior Property Advisor • Online</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <Minimize2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Property Context Banner */}
          <div className="bg-[#faede3]/70 px-3.5 py-2 border-b border-black/5 flex items-center justify-between text-[11px]">
            <span className="font-bold text-dark flex items-center gap-1">
              <Building2 size={12} className="text-dark" />
              <span>Real-Time Inquiries & Tour Desk</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full">
              Live Socket.io ✓
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-neutral-50/50">
            {messages.map((m, idx) => {
              const isMe = m.sender === 'customer';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <span className="text-[9px] text-gray-400 px-1">
                    {isMe ? 'You' : m.senderName || 'Advisor'} •{' '}
                    {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : 'bg-white text-dark border border-black/8 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {/* Agent Typing Indicator */}
            {agentTyping && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-2.5 rounded-2xl border border-black/5 w-fit">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[10px] font-semibold">Advisor is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-black/5 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {[
              '🗓️ Book private site visit',
              '💰 How does token advance work?',
              '📑 Is RERA verified?',
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-dark text-[10px] font-semibold transition-colors cursor-pointer border border-black/5 shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Ask anything about properties or tours..."
              className="flex-1 bg-neutral-100 border border-black/10 rounded-full px-4 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-dark transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-8 h-8 rounded-full bg-dark hover:bg-black text-white flex items-center justify-center cursor-pointer transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <Send size={13} className="translate-x-px" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;
