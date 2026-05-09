// Reusable form for creating and editing a fitness group.
// Pass initialData to pre-fill (edit mode); omit for create mode.

import { useState } from 'react';

const WORKOUT_TYPES = ['Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'];

export default function GroupForm({ initialData = {}, onSubmit, loading, submitLabel = 'Save' }) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    workoutType: initialData.workoutType || 'Running',
    location: initialData.location || '',
    difficultyLevel: initialData.difficultyLevel || 'beginner',
    isPrivate: initialData.isPrivate || false,
  });
  const [error, setError] = useState('');

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Group name is required.'); return; }
    setError('');
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="form-error">{error}</p>}

      <div className="form-group">
        <label>Group Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Workout Type *</label>
          <select name="workoutType" value={form.workoutType} onChange={handleChange}>
            {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Difficulty Level</label>
          <select name="difficultyLevel" value={form.difficultyLevel} onChange={handleChange}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Location</label>
        <input name="location" value={form.location} onChange={handleChange} />
      </div>

      <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox"
          name="isPrivate"
          id="isPrivate"
          checked={form.isPrivate}
          onChange={handleChange}
          style={{ width: 'auto' }}
        />
        <label htmlFor="isPrivate" style={{ marginBottom: 0 }}>Private group (members join by request only)</label>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
