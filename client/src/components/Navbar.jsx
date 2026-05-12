import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logout } from '../api/authApi.js';

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);   // avatar dropdown
  const [menuOpen, setMenuOpen]   = useState(false);   // mobile hamburger
  const dropdownRef = useRef(null);
  const navRef      = useRef(null);

  // Close avatar dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize back to desktop.
  useEffect(() => {
    function onResize() { if (window.innerWidth > 768) setMenuOpen(false); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function handleLogout() {
    setOpen(false);
    setMenuOpen(false);
    logout()
      .then(() => { setCurrentUser(null); navigate('/login'); })
      .catch(() => { setCurrentUser(null); navigate('/login'); });
  }

  function closeAll() { setOpen(false); setMenuOpen(false); }

  const initials = currentUser
    ? (currentUser.fullName || currentUser.username)
        .split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <>
      <nav className="navbar" ref={navRef}>
        <Link to="/" className="navbar-brand" onClick={closeAll}>FitTogether</Link>

        {/* Desktop links */}
        <div className="navbar-links navbar-desktop">
          {currentUser ? (
            <>
              <Link to="/feed"     onClick={closeAll}>Feed</Link>
              <Link to="/my-posts" onClick={closeAll}>My Posts</Link>
              <Link to="/groups"   onClick={closeAll}>Groups</Link>
              <Link to="/search"   onClick={closeAll}>Search</Link>
              <Link to="/chat"     onClick={closeAll}>Chat</Link>
              <Link to="/stats"    onClick={closeAll}>Stats</Link>
              <Link to="/about"    onClick={closeAll}>About</Link>

              {/* Avatar with dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, borderRadius: '50%',
                    background: open
                      ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
                      : 'linear-gradient(135deg,#4f46e5,#6366f1)',
                    border: '2px solid rgba(255,255,255,0.15)',
                    fontWeight: 700, fontSize: '0.78rem', color: 'white',
                    cursor: 'pointer', flexShrink: 0,
                    boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.4)' : '0 2px 6px rgba(79,70,229,0.4)',
                    transition: 'box-shadow 0.15s, transform 0.15s',
                    transform: open ? 'scale(1.08)' : 'scale(1)',
                    fontFamily: 'inherit',
                  }}
                  aria-label="User menu"
                >
                  {initials}
                </button>

                {open && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 12px 40px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.08)',
                    minWidth: 220,
                    zIndex: 300,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    animation: 'fadeDown 0.15s ease',
                  }}>
                    {/* Avatar + name header */}
                    <div style={{
                      padding: '18px 18px 14px',
                      background: 'linear-gradient(135deg,#eef2ff 0%,#f5f3ff 100%)',
                      borderBottom: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem', color: 'white',
                        flexShrink: 0, boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.3 }}>
                          {currentUser.fullName}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 2 }}>
                          @{currentUser.username}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '8px 6px' }}>
                      <Link
                        to={`/profile/${currentUser._id}`}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px',
                          color: '#0f172a', textDecoration: 'none',
                          fontSize: '0.875rem', fontWeight: 500,
                          borderRadius: 10, transition: 'background 0.12s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '1.05rem' }}>👤</span> View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', textAlign: 'left',
                          padding: '10px 14px', background: 'none', border: 'none',
                          color: '#ef4444', fontSize: '0.875rem', fontWeight: 500,
                          cursor: 'pointer', borderRadius: 10,
                          transition: 'background 0.12s',
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: '1.05rem' }}>🚪</span> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={closeAll}>Login</Link>
              <Link to="/register" onClick={closeAll}>Register</Link>
            </>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          {currentUser ? (
            <>
              {/* User identity strip */}
              <div className="mobile-menu-user">
                <div className="mobile-menu-avatar">{initials}</div>
                <div>
                  <div className="mobile-menu-name">{currentUser.fullName}</div>
                  <div className="mobile-menu-handle">@{currentUser.username}</div>
                </div>
              </div>

              <Link to="/feed"                        onClick={closeAll}>🏠 Feed</Link>
              <Link to="/my-posts"                    onClick={closeAll}>📝 My Posts</Link>
              <Link to="/groups"                      onClick={closeAll}>👥 Groups</Link>
              <Link to="/search"                      onClick={closeAll}>🔍 Search</Link>
              <Link to="/chat"                        onClick={closeAll}>💬 Chat</Link>
              <Link to="/stats"                       onClick={closeAll}>📊 Stats</Link>
              <Link to="/about"                       onClick={closeAll}>ℹ️ About</Link>
              <Link to={`/profile/${currentUser._id}`} onClick={closeAll}>👤 View Profile</Link>
              <button onClick={handleLogout} className="mobile-logout">🚪 Log out</button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={closeAll}>Login</Link>
              <Link to="/register" onClick={closeAll}>Register</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
