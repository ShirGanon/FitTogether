import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { listUsers } from '../api/usersApi.js';
import { searchMessages } from '../api/messagesApi.js';
import ChatBox from '../components/ChatBox.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChatPage() {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Message search state.
  const [msgSearch, setMsgSearch] = useState('');
  const [msgResults, setMsgResults] = useState([]);
  const [msgSearched, setMsgSearched] = useState(false);

  // Connect socket on mount, disconnect on unmount.
  useEffect(() => {
    const sock = io({ withCredentials: true });

    sock.on('online_users', (ids) => setOnlineUsers(ids));
    sock.on('user_online', (id) => setOnlineUsers((prev) => [...new Set([...prev, id])]));
    sock.on('user_offline', (id) => setOnlineUsers((prev) => prev.filter((u) => u !== id)));

    setSocket(sock);
    return () => sock.disconnect();
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

  return (
    <div className="chat-page">
      {/* Left sidebar — user list */}
      <aside className="chat-sidebar">
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
              onClick={() => setSelectedUser(u)}
            >
              <div className="contact-name">{u.fullName || u.username}</div>
              <div className="contact-meta">
                <span className="username">@{u.username}</span>
                {onlineUsers.includes(u._id) && <span className="online-dot" title="Online" />}
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

      {/* Right — chat box */}
      <main className="chat-main">
        <ChatBox socket={socket} otherUser={selectedUser} />
      </main>
    </div>
  );
}
