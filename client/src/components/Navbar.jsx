import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logout } from '../api/authApi.js';

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setOpen(false);
    logout()
      .then(() => { setCurrentUser(null); navigate('/login'); })
      .catch(() => { setCurrentUser(null); navigate('/login'); });
  }

  const initials = currentUser
    ? (currentUser.fullName || currentUser.username)
        .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">FitTogether</Link>

      <div className="navbar-links">
        {currentUser ? (
          <>
            <Link to="/feed">Feed</Link>
            <Link to="/my-posts">My Posts</Link>
            <Link to="/groups">Groups</Link>
            <Link to="/search">Search</Link>
            <Link to="/chat">Chat</Link>
            <Link to="/stats">Stats</Link>
            <Link to="/about">About</Link>

            {/* Avatar with dropdown */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setOpen((v) => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, borderRadius: '50%',
                  background: open ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  fontWeight: 700, fontSize: '0.75rem', color: 'white',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.15s',
                }}
                aria-label="User menu"
              >
                {initials}
              </button>

              {open && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: 'white', borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  minWidth: 200, zIndex: 200,
                  overflow: 'hidden',
                }}>
                  {/* User info header */}
                  <div style={{
                    padding: '14px 16px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    background: '#f9fafb',
                  }}>
                    <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>
                      {currentUser.fullName}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: 2 }}>
                      @{currentUser.username}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '6px 0' }}>
                    <Link
                      to={`/profile/${currentUser._id}`}
                      onClick={() => setOpen(false)}
                      style={{
                        display: 'block', padding: '9px 16px',
                        color: '#1f2937', textDecoration: 'none',
                        fontSize: '0.9rem', transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      👤 View Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '9px 16px', background: 'none', border: 'none',
                        color: '#dc2626', fontSize: '0.9rem', cursor: 'pointer',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
