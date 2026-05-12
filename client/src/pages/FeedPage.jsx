import { useEffect, useState } from 'react';
import { getFeed, createPost } from '../api/postsApi.js';
import { listGroups } from '../api/groupsApi.js';
import PostCard from '../components/PostCard.jsx';
import PostForm from '../components/PostForm.jsx';
import ChatPanel from '../components/ChatPanel.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function FeedPage() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  function fetchFeed() {
    setLoading(true);
    getFeed()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchFeed();
    listGroups()
      .then((all) =>
        setMyGroups(
          all.filter((g) =>
            g.members?.some((m) => (m._id || m).toString() === currentUser?._id) ||
            g.managerId?._id?.toString() === currentUser?._id ||
            g.managerId?.toString() === currentUser?._id
          )
        )
      )
      .catch(() => {});
  }, []);

  function handleCreate(formData) {
    setPostLoading(true);
    createPost(formData)
      .then((newPost) => {
        setPosts([newPost, ...posts]);
        setShowForm(false);
      })
      .catch((err) => alert(err.message))
      .finally(() => setPostLoading(false));
  }

  function handleDelete(id) {
    setPosts(posts.filter((p) => p._id !== id));
  }

  function handleUpdate(updated) {
    setPosts(posts.map((p) => (p._id === updated._id ? updated : p)));
  }

  return (
    <div className="feed-layout">
      {/* ── Main feed column ── */}
      <div className="feed-main">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>My Feed</h2>
          {myGroups.length > 0 && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Post'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <PostForm
              groups={myGroups}
              onSubmit={handleCreate}
              loading={postLoading}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading && <p>Loading feed…</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Your feed is empty. Join groups or add friends to see posts here.</p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {/* ── Chat sidebar ── */}
      <aside className="feed-chat-sidebar">
        <ChatPanel />
      </aside>
    </div>
  );
}
