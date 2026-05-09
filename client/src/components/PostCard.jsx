import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePost, updatePost } from '../api/postsApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PostForm from './PostForm.jsx';

export default function PostCard({ post, onDelete, onUpdate, isGroupManager }) {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const isAuthor = currentUser?._id === post.authorId?._id?.toString() ||
    currentUser?._id === post.authorId?.toString();
  const canEdit = isAuthor;
  const canDelete = isAuthor || isGroupManager;

  function handleDelete() {
    if (!window.confirm('Delete this post?')) return;
    deletePost(post._id)
      .then(() => onDelete && onDelete(post._id))
      .catch((err) => alert(err.message));
  }

  function handleUpdate(formData) {
    setSaveLoading(true);
    updatePost(post._id, formData)
      .then((updated) => {
        setEditing(false);
        onUpdate && onUpdate(updated);
      })
      .catch((err) => alert(err.message))
      .finally(() => setSaveLoading(false));
  }

  return (
    <div className="post-card card">
      {editing ? (
        <PostForm
          initialData={post}
          groupId={post.groupId?._id || post.groupId}
          onSubmit={handleUpdate}
          loading={saveLoading}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="post-header">
            <div>
              <Link to={`/profile/${post.authorId?._id}`} className="post-author">
                {post.authorId?.fullName || post.authorId?.username}
              </Link>
              {post.groupId && (
                <span className="post-group">
                  {' → '}
                  <Link to={`/groups/${post.groupId?._id}`}>{post.groupId?.name}</Link>
                </span>
              )}
            </div>
            <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="post-content">{post.content}</p>

          <div className="post-meta">
            <span className="badge">{post.postType}</span>
            {post.workoutType && <span className="badge">{post.workoutType}</span>}
            {post.difficultyLevel && <span className="badge badge-level">{post.difficultyLevel}</span>}
            {post.location && <span className="meta">📍 {post.location}</span>}
          </div>

          {(canEdit || canDelete) && (
            <div className="post-actions">
              {canEdit && (
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                  onClick={() => setEditing(true)}>Edit</button>
              )}
              {canDelete && (
                <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                  onClick={handleDelete}>Delete</button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
