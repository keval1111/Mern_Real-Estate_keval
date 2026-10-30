import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  RefreshCw,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useTheme } from '../context/ThemeContext';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const playChimeSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (err) {
    console.warn('Audio chime notice:', err);
  }
};

const LiveChat = () => {
  const { isDark } = useTheme();

  // Socket & Live Chat State
  const [socketConnected, setSocketConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationToast, setNotificationToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Quick replies presets
  const quickReplies = [
    'Hello! Yes, this property is available for site tour.',
    'Would you like me to schedule a private walkthrough?',
    'I can share the complete brochure and pricing breakdown.',
    'Our legal team has verified all documents & approvals.'
  ];

  // 1. Fetch live chat conversations from backend
  const loadConversations = async () => {
    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/chat/admin/all`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setConversations(data.data);
        if (!activeRoomId && data.data.length > 0) {
          selectConversation(data.data[0].roomId);
        }
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  // 2. Socket.io Connection Setup
  useEffect(() => {
    loadConversations();

    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      socket.emit('join_room', { roomId: 'admin_broadcast', role: 'admin' });
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Listen to incoming messages in real-time
    socket.on('receive_message', (msg) => {
      setChatMessages((prev) => [...prev, msg]);

      setConversations((prev) =>
        prev.map((c) =>
          c.roomId === msg.roomId
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.timestamp || new Date() }
            : c
        )
      );
    });

    // Customer typing indicator
    socket.on('typing', ({ sender, isTyping }) => {
      if (sender === 'customer') {
        setIsCustomerTyping(isTyping);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        if (isTyping) {
          typingTimerRef.current = setTimeout(() => {
            setIsCustomerTyping(false);
          }, 3500);
        }
      }
    });

    // Sound alert & instant customer notification
    socket.on('new_admin_notification', (data) => {
      if (soundEnabled) {
        playChimeSound();
      }
      setNotificationToast(data);
      setTimeout(() => setNotificationToast(null), 7000);
      loadConversations();
    });

    return () => {
      socket.disconnect();
    };
  }, [soundEnabled]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isCustomerTyping]);

  // Select a conversation room
  const selectConversation = async (roomId) => {
    setActiveRoomId(roomId);
    setIsCustomerTyping(false);

    if (socketRef.current) {
      socketRef.current.emit('join_room', { roomId, role: 'admin' });
    }

    try {
      const res = await fetch(`${SOCKET_SERVER_URL}/api/chat/history/${roomId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setChatMessages(data.data);
      }
      // Mark read in DB
      await fetch(`${SOCKET_SERVER_URL}/api/chat/${roomId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'admin' })
      });
      // Decrement unread in local state
      setConversations((prev) =>
        prev.map((c) => (c.roomId === roomId ? { ...c, unreadAdminCount: 0 } : c))
      );
    } catch (err) {
      console.warn('Error fetching chat history:', err);
    }
  };

  // Send message from Admin
  const handleSendMessage = (textToSend = null) => {
    const text = (textToSend || replyText).trim();
    if (!text || !activeRoomId || !socketRef.current) return;

    const currentConvo = conversations.find((c) => c.roomId === activeRoomId);

    const payload = {
      roomId: activeRoomId,
      sender: 'agent',
      senderName: 'Real Estate Advisor',
      text,
      propertyTitle: currentConvo?.propertyTitle || 'General Inquiry'
    };

    socketRef.current.emit('send_message', payload);
    setReplyText('');

    socketRef.current.emit('typing', {
      roomId: activeRoomId,
      sender: 'agent',
      isTyping: false
    });
  };

  // Handle typing debounce
  const handleInputChange = (e) => {
    setReplyText(e.target.value);
    if (!socketRef.current || !activeRoomId) return;

    socketRef.current.emit('typing', {
      roomId: activeRoomId,
      sender: 'agent',
      isTyping: true
    });

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', {
        roomId: activeRoomId,
        sender: 'agent',
        isTyping: false
      });
    }, 1500);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.customerName || '').toLowerCase().includes(q) ||
      (c.propertyTitle || '').toLowerCase().includes(q) ||
      (c.lastMessage || '').toLowerCase().includes(q)
    );
  });

  const activeConvo = conversations.find((c) => c.roomId === activeRoomId);
  const totalUnreadChats = conversations.reduce((sum, c) => sum + (c.unreadAdminCount || 0), 0);

  return (
    <div className={`space-y-6 max-w-7xl mx-auto transition-colors duration-200 ${
      isDark ? 'bg-black text-white' : 'text-slate-900'
    }`}>
      {/* Top Banner Alert Toast */}
      {notificationToast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce duration-300">
          <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3">
            <Sparkles size={20} className="animate-spin text-amber-300" />
            <div>
              <div className="font-extrabold text-xs">🔔 New Buyer Message!</div>
              <div className="text-xs opacity-90 truncate max-w-xs font-medium">
                <span className="font-bold underline">{notificationToast.customerName}</span>: {notificationToast.lastMessage}
              </div>
            </div>
            <button
              onClick={() => {
                if (notificationToast.roomId) {
                  selectConversation(notificationToast.roomId);
                }
                setNotificationToast(null);
              }}
              className="ml-2 bg-white text-emerald-800 text-[11px] font-black px-2.5 py-1 rounded-lg cursor-pointer hover:bg-emerald-50"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Real-Time Live Chat
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              socketConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <Radio size={12} className={socketConnected ? 'animate-pulse text-emerald-600' : 'text-rose-500'} />
              {socketConnected ? 'Socket Live' : 'Connecting...'}
            </span>
            {totalUnreadChats > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {totalUnreadChats} unread
              </span>
            )}
          </div>
          <p className={`text-xs font-medium mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Direct two-way instant live messaging with buyers browsing properties on the storefront.
          </p>
        </div>

        {/* Sound toggle & refresh button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title={soundEnabled ? 'Mute incoming chat sound' : 'Enable incoming chat sound alert'}
          >
            {soundEnabled ? <Volume2 size={15} className="text-amber-600" /> : <VolumeX size={15} />}
            <span>{soundEnabled ? 'Alert Sound ON' : 'Muted'}</span>
          </button>

          <button
            onClick={loadConversations}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 border-white text-white hover:bg-neutral-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Refresh All Chats"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* DEDICATED REAL-TIME LIVE CHAT INTERFACE */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 h-[700px] rounded-3xl border overflow-hidden shadow-xs transition-colors ${
        isDark ? 'bg-neutral-950 border-white' : 'bg-white border-slate-200'
      }`}>
        {/* Left Column: Conversations List (4 cols) */}
        <div className={`lg:col-span-4 flex flex-col border-r h-full ${
          isDark ? 'border-white bg-black' : 'border-slate-200 bg-slate-50/50'
        }`}>
          {/* Search conversations */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search buyer chats..."
                className={`w-full text-xs font-medium rounded-xl pl-8 pr-3 py-2 border transition-all focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 text-white placeholder-gray-500 border-white'
                    : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:border-brand'
                }`}
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((convo) => {
                const isSelected = convo.roomId === activeRoomId;
                const timeStr = convo.lastMessageAt
                  ? new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={convo.roomId}
                    onClick={() => selectConversation(convo.roomId)}
                    className={`p-3.5 transition-all cursor-pointer relative ${
                      isSelected
                        ? isDark
                          ? 'bg-neutral-900 border-l-4 border-l-brand'
                          : 'bg-white shadow-xs border-l-4 border-l-brand'
                        : isDark
                        ? 'hover:bg-neutral-900/60'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${
                          isSelected
                            ? 'bg-brand text-white border-brand'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}>
                          {(convo.customerName || 'B').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`text-xs font-black truncate max-w-[130px] ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {convo.customerName || 'Valued Buyer'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                            {convo.propertyTitle || 'Property Inquiry'}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-slate-400 font-medium">{timeStr}</span>
                        {convo.unreadAdminCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                            {convo.unreadAdminCount}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className={`text-[11px] truncate mt-1 font-medium ${
                      isSelected
                        ? isDark ? 'text-gray-200' : 'text-slate-800'
                        : isDark ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                      {convo.lastMessage || 'Click to open conversation'}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold">No active conversations yet</p>
                <p className="text-[11px] mt-1">
                  When buyers click "Chat with Agent" on the storefront, discussions will appear here in real time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Chat Thread (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white">
          {activeConvo ? (
            <>
              {/* Chat Top Bar */}
              <div className={`px-5 py-3 border-b flex items-center justify-between transition-colors ${
                isDark ? 'bg-black border-white' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center font-black text-sm">
                    {(activeConvo.customerName || 'B').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`text-xs font-black flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {activeConvo.customerName}
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-3">
                      {activeConvo.customerEmail && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} className="text-brand" /> {activeConvo.customerEmail}
                        </span>
                      )}
                      {activeConvo.customerPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} className="text-brand" /> {activeConvo.customerPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-xl border text-[11px] font-bold ${
                  isDark ? 'bg-neutral-900 border-white text-gray-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <span className="text-brand font-black">Property:</span> {activeConvo.propertyTitle || 'General'}
                </div>
              </div>

              {/* Messages Thread Body */}
              <div className={`flex-1 p-4 overflow-y-auto space-y-3.5 transition-colors ${
                isDark ? 'bg-neutral-950' : 'bg-slate-50/40'
              }`}>
                {chatMessages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'agent' || msg.sender === 'admin';
                  const timeStr = msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-slate-400 font-medium px-1 mb-1">
                        {isAdmin ? 'You (Real Estate Advisor)' : activeConvo.customerName || 'Buyer'}
                      </div>
                      <div
                        className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-xs ${
                          isAdmin
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <div className="text-[9px] text-slate-400 px-1 mt-1 font-medium flex items-center gap-1">
                        <span>{timeStr}</span>
                        {isAdmin && <CheckCircle2 size={10} className="text-emerald-500" />}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isCustomerTyping && (
                  <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-xl text-slate-500 text-xs w-max animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
                    <span>{activeConvo.customerName || 'Buyer'} is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Preset Chips */}
              <div className={`px-4 py-2 border-t flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs ${
                isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] font-black uppercase text-slate-400">Quick Replies:</span>
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(qr)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                      isDark
                        ? 'bg-neutral-900 border-white hover:bg-neutral-800 text-gray-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-brand hover:text-white text-slate-700'
                    }`}
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className={`p-3 border-t flex items-center gap-2 ${
                  isDark ? 'bg-black border-white' : 'bg-white border-slate-200'
                }`}
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={handleInputChange}
                  placeholder={`Reply to ${activeConvo.customerName || 'buyer'} in real-time...`}
                  className={`flex-1 text-xs font-medium rounded-xl px-4 py-2.5 border transition-all focus:outline-none ${
                    isDark
                      ? 'bg-neutral-900 text-white placeholder-gray-500 border-white focus:border-brand'
                      : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200 focus:bg-white focus:border-brand'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    replyText.trim()
                      ? 'bg-brand text-white shadow-xs hover:bg-brand/90'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Send</span>
                  <Send size={13} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare size={44} className="opacity-30 mb-3" />
              <h3 className="font-bold text-sm text-slate-700">Select a Conversation</h3>
              <p className="text-xs max-w-sm mt-1">
                Choose a buyer chat from the left panel to begin live messaging and schedule inspections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
