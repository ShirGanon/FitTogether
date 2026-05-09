import { useState, useEffect } from 'react';
import { listGroups, searchGroups, createGroup } from '../api/groupsApi.js';
import GroupCard from '../components/GroupCard.jsx';
import GroupForm from '../components/GroupForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const WORKOUT_TYPES = ['Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'];

export default function GroupsPage() {
  const { currentUser } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [tab, setTab] = useState('all'); // 'all' | 'mine'

  const [filters, setFilters] = useState({
    name: '', workoutType: '', location: '', difficultyLevel: '', isPrivate: '',
  });

  function fetchGroups() {
    setLoading(true);
    listGroups()
      .then(setGroups)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchGroups(); }, []);

  function handleSearch(e) {
    e.preventDefault();
    const active = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    if (!Object.keys(active).length) { fetchGroups(); return; }
    setLoading(true);
    searchGroups(active)
      .then(setGroups)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function handleCreateSubmit(formData) {
    setCreateLoading(true);
    createGroup(formData)
      .then(() => { setShowCreate(false); fetchGroups(); })
      .catch((err) => alert(err.message))
      .finally(() => setCreateLoading(false));
  }

  const displayed = tab === 'mine'
    ? groups.filter((g) =>
        g.members?.some((m) => (m._id || m).toString() === currentUser?._id) ||
        g.managerId?._id?.toString() === currentUser?._id
      )
    : groups;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Fitness Groups</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ Create Group'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginTop: 0 }}>New Group</h3>
          <GroupForm onSubmit={handleCreateSubmit} loading={createLoading} submitLabel="Create Group" />
        </div>
      )}

      {/* Search bar */}
      <form className="search-form card" onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Workout Type</label>
            <select value={filters.workoutType} onChange={(e) => setFilters({ ...filters, workoutType: e.target.value })}>
              <option value="">Any</option>
              {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Difficulty</label>
            <select value={filters.difficultyLevel} onChange={(e) => setFilters({ ...filters, difficultyLevel: e.target.value })}>
              <option value="">Any</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>Privacy</label>
            <select value={filters.isPrivate} onChange={(e) => setFilters({ ...filters, isPrivate: e.target.value })}>
              <option value="">Any</option>
              <option value="false">Public</option>
              <option value="true">Private</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary">Search</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setFilters({ name:'', workoutType:'', location:'', difficultyLevel:'', isPrivate:'' }); fetchGroups(); }}>Reset</button>
        </div>
      </form>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All Groups</button>
        <button className={`tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>My Groups</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && displayed.length === 0 && <p>No groups found.</p>}

      <div className="group-list">
        {displayed.map((g) => (
          <GroupCard key={g._id} group={g} onJoin={fetchGroups} />
        ))}
      </div>
    </div>
  );
}
