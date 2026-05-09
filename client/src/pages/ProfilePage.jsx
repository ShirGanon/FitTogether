import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUser, addFriend, removeFriend, deleteUser } from '../api/usersApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfilePage() {
  const { id } = useParams();
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friendLoading, setFriendLoading] = useState(false);

  const isSelf = currentUser && currentUser._id === id;
  const isFriend =
    currentUser && Array.isArray(currentUser.friends) && currentUser.friends.includes(id);

  useEffect(() => {
    setLoading(true);
    getUser(id)
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function handleFriendToggle() {
    setFriendLoading(true);
    const action = isFriend ? removeFriend(id) : addFriend(id);
    action
      .then(() => {
        const updatedFriends = isFriend
          ? currentUser.friends.filter((f) => f !== id)
          : [...(currentUser.friends || []), id];
        setCurrentUser({ ...currentUser, friends: updatedFriends });
      })
      .catch((err) => alert(err.message))
      .finally(() => setFriendLoading(false));
  }

  function handleDelete() {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    deleteUser(id)
      .then(() => {
        setCurrentUser(null);
        navigate('/login');
      })
      .catch((err) => alert(err.message));
  }

  if (loading) return <div className="page-content"><p>Loading profile…</p></div>;
  if (error) return <div className="page-content"><p className="form-error">{error}</p></div>;
  if (!user) return null;

  return (
    <div className="page-content">
      <div className="profile-header card">
        <div className="profile-info">
          <h1>{user.fullName}</h1>
          <p className="username">@{user.username}</p>
          {user.location && <p className="meta">📍 {user.location}</p>}
          <p className="meta">Fitness level: <strong>{user.fitnessLevel}</strong></p>
          {user.preferredWorkoutTypes?.length > 0 && (
            <p className="meta">Workouts: {user.preferredWorkoutTypes.join(', ')}</p>
          )}
          {user.bio && <p className="bio">{user.bio}</p>}
        </div>

        <div className="profile-actions">
          {isSelf ? (
            <>
              <Link to="/profile/edit" className="btn btn-primary">Edit Profile</Link>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Account</button>
            </>
          ) : currentUser ? (
            <button
              className={`btn ${isFriend ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleFriendToggle}
              disabled={friendLoading}
            >
              {friendLoading ? '…' : isFriend ? 'Unfriend' : 'Add Friend'}
            </button>
          ) : null}
        </div>
      </div>

      {user.friends?.length > 0 && (
        <section className="profile-friends">
          <h2>Friends ({user.friends.length})</h2>
          <div className="user-list">
            {user.friends.map((f) => (
              <Link key={f._id} to={`/profile/${f._id}`} className="friend-chip">
                {f.fullName || f.username}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
