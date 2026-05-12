import { useState, useEffect, useRef } from 'react';
import { getConversation } from '../api/messagesApi.js';
import MessageBubble from './MessageBubble.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChatBox({ socket, otherUser, compact = false }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // Load conversation history via Ajax whenever the selected user changes.
  useEffect(() => {
    if (!otherUser) return;
    setLoading(true);
    getConversation(otherUser._id)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [otherUser?._id]);

  // Listen for incoming real-time messages from the selected user.
  useEffect(() => {
    if (!socket || !otherUser) return;

    function handleReceive(msg) {
      const senderId = msg.senderId?._id || msg.senderId?.toString();
      if (senderId === otherUser._id) {
        setMessages((prev) => [...prev, msg]);
      }
    }

    socket.on('receive_message', handleReceive);
    return () => socket.off('receive_message', handleReceive);
  }, [socket, otherUser?._id]);

  // After our own message is confirmed sent, append it.
  useEffect(() => {
    if (!socket) return;
    function handleSent(msg) {
      setMessages((prev) => [...prev, msg]);
    }
    socket.on('message_sent', handleSent);
    return () => socket.off('message_sent', handleSent);
  }, [socket]);

  // Scroll to bottom when messages change.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('send_message', { receiverId: otherUser._id, content: text.trim() });
    setText('');
  }

  function handleDelete(id) {
    setMessages((prev) => prev.filter((m) => m._id !== id));
  }

  if (!otherUser) {
    return (
      <div className="chatbox-empty">
        <p>Select a user from the list to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="chatbox">
      <div className="chatbox-header" style={compact ? { padding: '10px 14px' } : {}}>
        <strong style={{ fontSize: compact ? '0.9rem' : undefined }}>{otherUser.fullName || otherUser.username}</strong>
        <span className="username">@{otherUser.username}</span>
      </div>

      <div className="chatbox-messages">
        {loading && <p className="meta" style={{ textAlign: 'center' }}>Loading…</p>}
        {!loading && messages.length === 0 && (
          <p className="meta" style={{ textAlign: 'center' }}>No messages yet. Say hi!</p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} onDelete={handleDelete} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="chatbox-input" onSubmit={handleSend}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Send</button>
      </form>
    </div>
  );
}
