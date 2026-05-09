import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.username || !form.password) {
      setError('Please enter your username and password.');
      return;
    }

    setLoading(true);
    login(form)
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
        <h1 className="hero-title">FitTogether</h1>
        <h2>Login</h2>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
