import { useEffect, useState } from 'react';
import { getMyPosts } from '../api/postsApi.js';
import PostCard from '../components/PostCard.jsx';

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getMyPosts()
      .then((data) => { setPosts(data); setFiltered(data); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e) {
    const q = e.target.value;
    setSearch(q);
    if (!q.trim()) { setFiltered(posts); return; }
    const lower = q.toLowerCase();
    setFiltered(posts.filter((p) =>
      p.content.toLowerCase().includes(lower) ||
      p.postType?.toLowerCase().includes(lower) ||
      p.workoutType?.toLowerCase().includes(lower)
    ));
  }

  function handleDelete(id) {
    const updated = posts.filter((p) => p._id !== id);
    setPosts(updated);
    setFiltered(updated.filter((p) =>
      !search.trim() || p.content.toLowerCase().includes(search.toLowerCase())
    ));
  }

  function handleUpdate(updated) {
    const newPosts = posts.map((p) => (p._id === updated._id ? updated : p));
    setPosts(newPosts);
    setFiltered(newPosts);
  }

  return (
    <div className="page-content">
      <h2>My Posts</h2>

      <div className="card search-form">
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Filter by content, type, or workout…"
          style={{ maxWidth: 400 }}
        />
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p>{posts.length === 0 ? "You haven't posted yet." : 'No posts match your filter.'}</p>
      )}

      {filtered.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
