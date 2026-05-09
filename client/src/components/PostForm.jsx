// Used for both creating and editing a post.
// Pass groupId (fixed, e.g. from GroupDetailsPage) OR groups[] (selectable, e.g. from FeedPage).

import { useState } from 'react';

const POST_TYPES = ['Question', 'Tip', 'Workout Plan', 'Looking for Partner', 'Progress Update', 'Event'];
const WORKOUT_TYPES = ['Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'];

export default function PostForm({ groupId, groups = [], initialData = {}, onSubmit, loading, submitLabel = 'Post', onCancel }) {
  const [form, setForm] = useState({
    groupId: initialData.groupId?._id || initialData.groupId || groupId || (groups[0]?._id ?? ''),
    content: initialData.content || '',
    postType: initialData.postType || 'Question',
    workoutType: initialData.workoutType || '',
    difficultyLevel: initialData.difficultyLevel || '',
    location: initialData.location || '',
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.content.trim()) { setError('Post content cannot be empty.'); return; }
    if (!form.groupId) { setError('Please select a group.'); return; }
    setError('');
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <p className="form-error">{error}</p>}

      {/* Group selector — only shown when multiple groups are available and no fixed groupId */}
      {!groupId && groups.length > 0 && (
        <div className="form-group">
          <label>Post in group</label>
          <select name="groupId" value={form.groupId} onChange={handleChange}>
            <option value="">Select a group…</option>
            {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Content *</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          rows={3}
          placeholder="What's on your mind?"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Post Type</label>
          <select name="postType" value={form.postType} onChange={handleChange}>
            {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Workout Type</label>
          <select name="workoutType" value={form.workoutType} onChange={handleChange}>
            <option value="">General</option>
            {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Difficulty</label>
          <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange}>
            <option value="">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="form-group">
          <label>Location</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="Optional" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
