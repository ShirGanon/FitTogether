import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getGroup, updateGroup, deleteGroup, approveRequest, rejectRequest, removeMember,
} from '../api/groupsApi.js';
import GroupForm from '../components/GroupForm.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function GroupManagementPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [section, setSection] = useState('edit'); // 'edit' | 'requests' | 'members'

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
