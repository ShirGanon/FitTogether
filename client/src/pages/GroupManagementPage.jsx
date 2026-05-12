import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroup, updateGroup, deleteGroup, approveRequest, rejectRequest, removeMember,
} from '../api/groupsApi.js';
import { searchPosts } from '../api/postsApi.js';
import GroupForm from '../components/GroupForm.jsx';
import PostCard from '../components/PostCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const POST_TYPES = ['', 'Question', 'Tip', 'Workout Plan', 'Looking for Partner', 'Progress Update', 'Event'];
const WORKOUT_TYPES = ['', 'Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'];

export default function GroupManagementPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [section, setSection] = useState('edit'); // 'edit' | 'requests' | 'members' | 'search'

  // Extended post search state
  const [postFilters, setPostFilters] = useState({ content: '', postType: '', workoutType: '' });
  const [postResults, setPostResults] = useState([]);
  const [postSearched, setPostSearched] = useState(false);
  const [postSearchLoading, setPostSearchLoading] = useState(false);

  function fetchGroup() {
    setLoading(true);
    getGroup(id)
      .then((g) => {
        // Redirect non-managers away from this page.
        if (!g.isManager) { navigate(`/groups/${id}`); return; }
        setGroup(g);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchGroup(); }, [id]);

  function handleUpdate(formData) {
    setSaveLoading(true);
    updateGroup(id, formData)
      .then(fetchGroup)
      .catch((err) => alert(err.message))
      .finally(() => setSaveLoading(false));
  }

  function handleDelete() {
    if (!window.confirm('Delete this group permanently?')) return;
    deleteGroup(id)
      .then(() => navigate('/groups'))
      .catch((err) => alert(err.message));
  }

  function handleApprove(userId) {
    approveRequest(id, userId).then(fetchGroup).catch((err) => alert(err.message));
  }
  function handleReject(userId) {
    rejectRequest(id, userId).then(fetchGroup).catch((err) => alert(err.message));
  }
  function handleRemove(userId) {
    if (!window.confirm('Remove this member from the group?')) return;
    removeMember(id, userId).then(fetchGroup).catch((err) => alert(err.message));
  }

  function handlePostSearch(e) {
    e.preventDefault();
    setPostSearchLoading(true);
    const active = Object.fromEntries(Object.entries(postFilters).filter(([, v]) => v !== ''));
    searchPosts({ ...active, groupId: id })
      .then((results) => { setPostResults(results); setPostSearched(true); })
      .catch((err) => alert(err.message))
      .finally(() => setPostSearchLoading(false));
  }

  if (loading) return <div className="page-content"><p>Loading…</p></div>;
  if (error) return <div className="page-content"><p className="form-error">{error}</p></div>;
  if (!group) return null;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Manage: {group.name}</h2>
        <button className="btn btn-danger" onClick={handleDelete}>Delete Group</button>
      </div>

      <div className="tab-bar">
        <button className={`tab ${section === 'edit' ? 'active' : ''}`} onClick={() => setSection('edit')}>Edit Details</button>
        <button className={`tab ${section === 'requests' ? 'active' : ''}`} onClick={() => setSection('requests')}>
          Requests {group.pendingRequests?.length > 0 && `(${group.pendingRequests.length})`}
        </button>
        <button className={`tab ${section === 'members' ? 'active' : ''}`} onClick={() => setSection('members')}>Members</button>
        <button className={`tab ${section === 'search' ? 'active' : ''}`} onClick={() => setSection('search')}>Search Posts</button>
      </div>

      {/* Edit group */}
      {section === 'edit' && (
        <div className="card">
          <GroupForm
            initialData={group}
            onSubmit={handleUpdate}
            loading={saveLoading}
            submitLabel="Save Changes"
          />
        </div>
      )}

      {/* Pending join requests */}
      {section === 'requests' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Pending Requests</h3>
          {group.pendingRequests?.length === 0 && <p className="meta">No pending requests.</p>}
          {group.pendingRequests?.map((user) => (
            <div key={user._id} className="member-row">
              <span>{user.fullName} <span className="username">@{user.username}</span></span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={() => handleApprove(user._id)}>Approve</button>
                <button className="btn btn-secondary" onClick={() => handleReject(user._id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Extended post search */}
      {section === 'search' && (
        <div>
          <form className="card" onSubmit={handlePostSearch} style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>Search Posts in This Group</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Keywords</label>
                <input
                  type="text"
                  placeholder="Search post content…"
                  value={postFilters.content}
                  onChange={(e) => setPostFilters({ ...postFilters, content: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Post Type</label>
                <select
                  value={postFilters.postType}
                  onChange={(e) => setPostFilters({ ...postFilters, postType: e.target.value })}
                >
                  {POST_TYPES.map((t) => <option key={t} value={t}>{t || 'Any type'}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Workout Type</label>
              <select
                value={postFilters.workoutType}
                onChange={(e) => setPostFilters({ ...postFilters, workoutType: e.target.value })}
              >
                {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t || 'Any workout'}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={postSearchLoading}>
              {postSearchLoading ? 'Searching…' : 'Search'}
            </button>
          </form>

          {postSearched && postResults.length === 0 && (
            <p className="meta">No posts match your filters.</p>
          )}
          {postResults.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              isGroupManager={true}
              onDelete={(deletedId) => setPostResults(postResults.filter((p) => p._id !== deletedId))}
              onUpdate={(updated) => setPostResults(postResults.map((p) => p._id === updated._id ? updated : p))}
            />
          ))}
        </div>
      )}

      {/* Members list */}
      {section === 'members' && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Members ({group.members?.length})</h3>
          {group.members?.map((member) => {
            const isManager = member._id === group.managerId?._id?.toString() ||
              member._id?.toString() === currentUser?._id;
            return (
              <div key={member._id} className="member-row">
                <span>
                  {member.fullName} <span className="username">@{member.username}</span>
                  {member._id?.toString() === currentUser?._id && ' (you)'}
                  {member._id?.toString() === group.managerId?._id?.toString() && ' 👑'}
                </span>
                {member._id?.toString() !== currentUser?._id && (
                  <button className="btn btn-danger" style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                    onClick={() => handleRemove(member._id)}>
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
