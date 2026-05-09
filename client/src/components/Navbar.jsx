import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { logout } from '../api/authApi.js';

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout()
      .then(() => {
        setCurrentUser(null);
        navigate('/login');
      })
      .catch(() => {
        setCurrentUser(null);
        navigate('/login');
      });
  }

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
            <Link to={`/profile/${currentUser._id}`}>Profile</Link>
            <button onClick={handleLogout} className="btn-link">Logout</button>
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
