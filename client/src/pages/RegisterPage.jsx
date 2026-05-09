import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

const WORKOUT_TYPES = ['Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'];

export default function RegisterPage() {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    bio: '',
    fitnessLevel: 'beginner',
    preferredWorkoutTypes: [],
    location: '',
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

  function validate() {
    if (!form.username.trim()) return 'Username is required.';
    if (!form.password) return 'Password is required.';
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email format is invalid.';
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError('');
    setLoading(true);
    register(form)
      .then((user) => {
        setCurrentUser(user);
        navigate('/feed');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h2>Create your FitTogether account</h2>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
          </div>

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
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} />
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

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
