import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { addFriend, removeFriend } from '../api/usersApi.js';
import { useState } from 'react';

export default function UserCard({ user, onFriendChange }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const isSelf = currentUser && currentUser._id === user._id;
  const isFriend = currentUser && currentUser.friends && currentUser.friends.includes(user._id);

  function handleFriendToggle() {
    setLoading(true);
    const action = isFriend ? removeFriend(user._id) : addFriend(user._id);
    action
      .then(() => onFriendChange && onFriendChange())
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="user-card card">
      <div className="user-card-info">
        <Link to={`/profile/${user._id}`}>
          <strong>{user.fullName}</strong> <span className="username">@{user.username}</span>
        </Link>
        {user.location && <p className="meta">{user.location}</p>}
        {user.fitnessLevel && <p className="meta">Level: {user.fitnessLevel}</p>}
        {user.bio && <p className="bio">{user.bio}</p>}
      </div>

      {currentUser && !isSelf && (
        <button
          className={`btn ${isFriend ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleFriendToggle}
          disabled={loading}
        >
          {loading ? '…' : isFriend ? 'Unfriend' : 'Add Friend'}
        </button>
      )}
    </div>
  );
}
