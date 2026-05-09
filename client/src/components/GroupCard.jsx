import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { joinGroup, requestJoin } from '../api/groupsApi.js';
import { useState } from 'react';

export default function GroupCard({ group, onJoin }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const isMember = group.members?.some((m) =>
    (m._id || m).toString() === currentUser?._id
  );
  const isManager = group.managerId?._id?.toString() === currentUser?._id ||
    group.managerId?.toString() === currentUser?._id;
  const hasPending = group.pendingRequests?.some((r) =>
    (r._id || r).toString() === currentUser?._id
  );

  function handleJoin() {
    setLoading(true);
    const action = group.isPrivate ? requestJoin(group._id) : joinGroup(group._id);
    action
      .then(() => onJoin && onJoin())
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="group-card card">
      <div className="group-card-info">
        <Link to={`/groups/${group._id}`}>
          <h3>{group.name}</h3>
        </Link>
        <div className="group-meta">
          <span className="badge">{group.workoutType}</span>
          <span className="badge badge-level">{group.difficultyLevel}</span>
          {group.isPrivate && <span className="badge badge-private">Private</span>}
          {group.location && <span className="meta">📍 {group.location}</span>}
        </div>
        {group.description && <p className="bio">{group.description}</p>}
        <p className="meta">
          {group.members?.length ?? group.memberCount ?? 0} members ·
          Manager: {group.managerId?.fullName || group.managerId?.username}
        </p>
      </div>

      <div className="group-card-actions">
        {isManager && (
          <Link to={`/groups/${group._id}/manage`} className="btn btn-secondary">
            Manage
          </Link>
        )}
        {!isMember && !isManager && !hasPending && (
          <button className="btn btn-primary" onClick={handleJoin} disabled={loading}>
            {loading ? '…' : group.isPrivate ? 'Request Access' : 'Join'}
          </button>
        )}
        {hasPending && <span className="badge badge-pending">Pending</span>}
        {isMember && !isManager && <span className="badge badge-member">Joined</span>}
      </div>
    </div>
  );
}
