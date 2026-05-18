import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getGroup, joinGroup, requestJoin, removeMember } from '../api/groupsApi.js';
import { getGroupPosts, createPost } from '../api/postsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import PostForm from '../components/PostForm.jsx';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  function fetchGroup() {
    setLoading(true);
    getGroup(id)
      .then((g) => {
        setGroup(g);
        if (g.isMember || g.isManager) {
          return getGroupPosts(id).then(setPosts).catch(() => {});
        }
      })
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

  function handleLeave() {
    if (!window.confirm('Leave this group?')) return;
    setActionLoading(true);
    removeMember(id, currentUser._id)
      .then(() => navigate('/groups'))
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
            {isMember && !isManager && (
              <button className="btn btn-secondary" onClick={handleLeave} disabled={actionLoading}>
                {actionLoading ? '…' : 'Leave Group'}
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

      {/* Posts */}
      {(isMember || isManager) && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Posts</h2>
            <button className="btn btn-primary" onClick={() => setShowPostForm(!showPostForm)}>
              {showPostForm ? 'Cancel' : '+ New Post'}
            </button>
          </div>

          {showPostForm && (
            <div className="card" style={{ marginBottom: 12 }}>
              <PostForm
                groupId={id}
                onSubmit={(formData) => {
                  setPostLoading(true);
                  createPost(formData)
                    .then((p) => { setPosts([p, ...posts]); setShowPostForm(false); })
                    .catch((err) => alert(err.message))
                    .finally(() => setPostLoading(false));
                }}
                loading={postLoading}
                onCancel={() => setShowPostForm(false)}
              />
            </div>
          )}

          {posts.length === 0 && <p className="meta">No posts yet. Be the first!</p>}
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isGroupManager={isManager}
              onDelete={(deletedId) => setPosts(posts.filter((p) => p._id !== deletedId))}
              onUpdate={(updated) => setPosts(posts.map((p) => p._id === updated._id ? updated : p))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
