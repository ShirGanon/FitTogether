// Compact chat panel — embedded in the feed sidebar.
// Manages its own socket connection so it works standalone.

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { listUsers } from '../api/usersApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChatBox from './ChatBox.jsx';

export default function ChatPanel() {
  const { currentUser } = useAuth();
  const [socket, setSocket]           = useState(null);
  const [users, setUsers]             = useState([]);
  const [selected, setSelected]       = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [search, setSearch]           = useState('');

  // Socket lifecycle
  useEffect(() => {
    const sock = io({ withCredentials: true });
    sock.on('online_users', (ids) => setOnlineUsers(ids));
    sock.on('user_online',  (id)  => setOnlineUsers((p) => [...new Set([...p, id])]));
    sock.on('user_offline', (id)  => setOnlineUsers((p) => p.filter((u) => u !== id)));
    setSocket(sock);
    return () => sock.disconnect();
  }, []);

  useEffect(() => {
    listUsers()
      .then((all) => setUsers(all.filter((u) => u._id !== currentUser?._id)))
      .catch(() => {});
  }, []);

  const filtered = users.filter((u) =>
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%',
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
      overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 100%)',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: 8 }}>
          💬 Messages
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users…"
          style={{
            width: '100%', padding: '7px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff', fontSize: '0.82rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Contact list */}
      <ul style={{
        listStyle: 'none', margin: 0, padding: 0,
        overflowY: 'auto',
        flexShrink: 0,
        maxHeight: selected ? '180px' : '100%',
        borderBottom: selected ? '1px solid var(--border)' : 'none',
        transition: 'max-height 0.25s ease',
      }}>
        {filtered.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          const isActive = selected?._id === u._id;
          return (
            <li
              key={u._id}
              onClick={() => setSelected(isActive ? null : u)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', cursor: 'pointer',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--bg)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: isActive
                  ? 'linear-gradient(135deg,var(--primary),#6366f1)'
                  : 'linear-gradient(135deg,#94a3b8,#cbd5e1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.72rem', color: '#fff',
                position: 'relative',
              }}>
                {(u.fullName || u.username).split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                {isOnline && (
                  <span style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 9, height: 9, borderRadius: '50%',
                    background: 'var(--success)',
                    border: '2px solid #fff',
                  }} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {u.fullName || u.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: isOnline ? 'var(--success)' : 'var(--text-muted)' }}>
                  {isOnline ? 'Online' : `@${u.username}`}
                </div>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No users found
          </li>
        )}
      </ul>

      {/* Chatbox — only shown when a user is selected */}
      {selected && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <ChatBox socket={socket} otherUser={selected} compact />
        </div>
      )}

      {/* Idle state */}
      {!selected && users.length > 0 && filtered.length > 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: '0.85rem', gap: 6, padding: 20,
        }}>
          <span style={{ fontSize: '1.8rem' }}>👆</span>
          Select someone to chat
        </div>
      )}
    </div>
  );
}
