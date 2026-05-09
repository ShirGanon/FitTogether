import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUser } from '../api/usersApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const WORKOUT_TYPES = ['Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'];

export default function EditProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    fitnessLevel: currentUser?.fitnessLevel || 'beginner',
    preferredWorkoutTypes: currentUser?.preferredWorkoutTypes || [],
    location: currentUser?.location || '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleWorkoutToggle(type) {
    const current = form.preferredWorkoutTypes;
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    setForm({ ...form, preferredWorkoutTypes: updated });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Full name and email are required.');
      return;
    }

    setError('');
    setLoading(true);
    updateUser(currentUser._id, form)
      .then((updated) => {
        setCurrentUser({ ...currentUser, ...updated });
        navigate(`/profile/${currentUser._id}`);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="page-content">
      <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2>Edit Profile</h2>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fitness Level</label>
              <select name="fitnessLevel" value={form.fitnessLevel} onChange={handleChange}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Preferred Workout Types</label>
            <div className="checkbox-group">
              {WORKOUT_TYPES.map((type) => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.preferredWorkoutTypes.includes(type)}
                    onChange={() => handleWorkoutToggle(type)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/profile/${currentUser._id}`)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
