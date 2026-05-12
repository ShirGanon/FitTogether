import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { listUsers } from '../api/usersApi.js';
import { searchMessages, getUnreadCounts } from '../api/messagesApi.js';
import ChatBox from '../components/ChatBox.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChatPage() {
  const { currentUser } = useAuth();
  const [socket, setSocket]           = useState(null);
  const [users, setUsers]             = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userSearch, setUserSearch]   = useState('');
  const [unread, setUnread]           = useState({}); // { [senderId]: count }
  const selectedRef = useRef(null);    // avoids stale closure in socket handler

  // Message search state.
  const [msgSearch, setMsgSearch]     = useState('');
  const [msgResults, setMsgResults]   = useState([]);
  const [msgSearched, setMsgSearched] = useState(false);

  // Connect socket on mount, disconnect on unmount.
  useEffect(() => {
    const sock = io({ withCredentials: true });

    sock.on('online_users', (ids) => setOnlineUsers(ids));
    sock.on('user_online',  (id)  => setOnlineUsers((prev) => [...new Set([...prev, id])]));
    sock.on('user_offline', (id)  => setOnlineUsers((prev) => prev.filter((u) => u !== id)));

    // Increment unread badge when a message arrives and that conversation isn't open.
    sock.on('receive_message', (msg) => {
      const senderId = (msg.senderId?._id || msg.senderId)?.toString();
      if (selectedRef.current?._id !== senderId) {
        setUnread((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
      }
    });

    setSocket(sock);
    return () => sock.disconnect();
  }, []);

  // Keep ref in sync so the socket handler always sees the current selected user.
  useEffect(() => { selectedRef.current = selectedUser; }, [selectedUser]);

  // Load initial unread counts, then poll every 30 s as a safety net.
  useEffect(() => {
    getUnreadCounts().then(setUnread).catch(() => {});
    const interval = setInterval(
      () => getUnreadCounts()
              .then((fresh) => setUnread((prev) => {
                const merged = { ...fresh };
                // Don't re-add a badge for the currently open conversation.
                if (selectedRef.current) delete merged[selectedRef.current._id];
                return merged;
              }))
              .catch(() => {}),
      30_000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    listUsers()
      .then((all) => setUsers(all.filter((u) => u._id !== currentUser?._id)))
      .catch(() => {});
  }, []);

  function handleMsgSearch(e) {
    e.preventDefault();
    if (!msgSearch.trim()) return;
    searchMessages({ content: msgSearch })
      .then((results) => { setMsgResults(results); setMsgSearched(true); })
      .catch(() => {});
  }

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // On mobile, toggle between contact list and chatbox.
  // showChat = true when a user is selected AND we're on mobile.
  const showChat = !!selectedUser;

  return (
    <div className="chat-page">
      {/* Left sidebar — user list.
          On mobile: visible when no conversation is open. */}
      <aside className={`chat-sidebar ${showChat ? 'mobile-hidden' : ''}`}>
        <h3>Messages</h3>
        <input
          className="chat-search"
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          placeholder="Search users…"
        />
        <ul className="user-contact-list">
          {filteredUsers.map((u) => (
            <li
              key={u._id}
              className={`contact-item ${selectedUser?._id === u._id ? 'active' : ''}`}
              onClick={() => {
                setSelectedUser(u);
                // Clear the unread badge for this conversation.
                setUnread((prev) => { const n = { ...prev }; delete n[u._id]; return n; });
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div className="contact-name">{u.fullName || u.username}</div>
                  <div className="contact-meta">
                    <span className="username">@{u.username}</span>
                    {onlineUsers.includes(u._id) && <span className="online-dot" title="Online" />}
                  </div>
                </div>

                {/* Unread badge */}
                {unread[u._id] > 0 && (
                  <div style={{
                    minWidth: 20, height: 20, borderRadius: 10,
                    background: 'linear-gradient(135deg,#6366f1,#818cf8)',
                    color: '#fff',
                    fontSize: '0.7rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px', flexShrink: 0,
                  }}>
                    {unread[u._id] > 99 ? '99+' : unread[u._id]}
                  </div>
                )}
              </div>
            </li>
          ))}
          {filteredUsers.length === 0 && <li className="meta" style={{ padding: '12px' }}>No users found.</li>}
        </ul>

        {/* Message search */}
        <div className="msg-search-section">
          <h4>Search Messages</h4>
          <form onSubmit={handleMsgSearch} style={{ display: 'flex', gap: 4 }}>
            <input
              value={msgSearch}
              onChange={(e) => setMsgSearch(e.target.value)}
              placeholder="Search text…"
              className="chat-search"
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Go</button>
          </form>
          {msgSearched && (
            <div className="msg-results">
              {msgResults.length === 0 && <p className="meta">No results.</p>}
              {msgResults.map((m) => (
                <div key={m._id} className="msg-result-item"
                  onClick={() => {
                    const other = m.senderId?._id === currentUser?._id ? m.receiverId : m.senderId;
                    const found = users.find((u) => u._id === (other?._id || other));
                    if (found) setSelectedUser(found);
                  }}>
                  <span className="meta">{m.senderId?.fullName}: </span>
                  <span>{m.content.slice(0, 40)}{m.content.length > 40 ? '…' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Right — chat box.
          On mobile: visible only when a conversation is open. */}
      <main className={`chat-main ${!showChat ? 'mobile-hidden' : ''}`}>
        <ChatBox
          socket={socket}
          otherUser={selectedUser}
          onBack={() => setSelectedUser(null)}
        />
      </main>
    </div>
  );
}
