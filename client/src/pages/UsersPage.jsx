import { useState, useEffect } from 'react';
import { listUsers, searchUsers } from '../api/usersApi.js';
import UserCard from '../components/UserCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function UsersPage() {
  const { currentUser, setCurrentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    username: '', fullName: '', location: '', fitnessLevel: '', workoutType: '',
  });

  function fetchAll() {
    setLoading(true);
    listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  function handleSearch(e) {
    e.preventDefault();
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    if (!Object.keys(active).length) { fetchAll(); return; }

    setLoading(true);
    searchUsers(active)
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function handleChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleFriendChange() {
    // Re-fetch currentUser's friends list is handled locally in UserCard via context;
    // this callback triggers a re-render so button labels update.
    setCurrentUser({ ...currentUser });
  }

  return (
    <div className="page-content">
      <h2>Find People</h2>

      <form className="search-form card" onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>Username</label>
            <input name="username" value={filters.username} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Full Name</label>
            <input name="fullName" value={filters.fullName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={filters.location} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Fitness Level</label>
            <select name="fitnessLevel" value={filters.fitnessLevel} onChange={handleChange}>
              <option value="">Any</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Workout Type</label>
            <input name="workoutType" value={filters.workoutType} onChange={handleChange} placeholder="e.g. Running" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary">Search</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setFilters({ username:'', fullName:'', location:'', fitnessLevel:'', workoutType:'' }); fetchAll(); }}>Reset</button>
        </div>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && users.length === 0 && <p>No users found.</p>}

      <div className="user-list">
        {users.filter(u => u._id !== currentUser?._id).map((u) => (
          <UserCard key={u._id} user={u} onFriendChange={handleFriendChange} />
        ))}
      </div>
    </div>
  );
}
