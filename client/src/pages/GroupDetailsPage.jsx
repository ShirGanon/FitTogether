import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getGroup, joinGroup, requestJoin } from '../api/groupsApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  function fetchGroup() {
    setLoading(true);
    getGroup(id)
      .then(setGroup)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchGroup(); }, [id]);

  function handleJoin() {
    setActionLoading(true);
    const action = group.isPrivate ? requestJoin(id) : joinGroup(id);
    action
      .then(fetchGroup)
      .catch((err) => alert(err.message))
      .finally(() => setActionLoading(false));
  }

  if (loading) return <div className="page-content"><p>Loading…</p></div>;
  if (error) return <div className="page-content"><p className="form-error">{error}</p></div>;
  if (!group) return null;

  const userId = currentUser?._id;
  const isMember = group.isMember ?? group.members?.some((m) => (m._id || m).toString() === userId);
  const isManager = group.isManager ?? group.managerId?._id?.toString() === userId;
  const hasPending = group.hasPending ?? group.pendingRequests?.some((r) => (r._id || r).toString() === userId);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 6px' }}>{group.name}</h1>
            <div className="group-meta">
              <span className="badge">{group.workoutType}</span>
              <span className="badge badge-level">{group.difficultyLevel}</span>
              {group.isPrivate && <span className="badge badge-private">Private</span>}
              {group.location && <span className="meta">📍 {group.location}</span>}
            </div>
            {group.description && <p style={{ marginTop: 12 }}>{group.description}</p>}
            <p className="meta">
              Manager: <strong>{group.managerId?.fullName || group.managerId?.username}</strong>
              {' · '}{group.members?.length ?? group.memberCount ?? 0} members
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {isManager && (
              <Link to={`/groups/${id}/manage`} className="btn btn-secondary">Manage</Link>
            )}
            {!isMember && !isManager && !hasPending && (
              <button className="btn btn-primary" onClick={handleJoin} disabled={actionLoading}>
                {actionLoading ? '…' : group.isPrivate ? 'Request Access' : 'Join Group'}
              </button>
            )}
            {hasPending && <span className="badge badge-pending">Request Pending</span>}
          </div>
        </div>
      </div>

      {/* Private group non-member view */}
      {group.isPrivate && !isMember && !isManager && (
        <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
          <p>This is a private group. Join to see posts and members.</p>
        </div>
      )}

      {/* Members */}
      {(isMember || isManager) && group.members?.length > 0 && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Members ({group.members.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.members.map((m) => (
              <Link key={m._id} to={`/profile/${m._id}`} className="friend-chip">
                {m.fullName || m.username}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts placeholder — filled in Phase 4 */}
      {(isMember || isManager) && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Posts</h2>
          <p className="meta">Posts will appear here in Phase 4.</p>
        </div>
      )}
    </div>
  );
}
