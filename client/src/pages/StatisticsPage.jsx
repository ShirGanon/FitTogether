import { useEffect, useState } from 'react';
import { getPostsByWorkoutType, getPostsByMonth } from '../api/statsApi.js';
import D3PostsByWorkoutTypeChart from '../components/D3PostsByWorkoutTypeChart.jsx';
import D3PostsByMonthChart from '../components/D3PostsByMonthChart.jsx';

export default function StatisticsPage() {
  const [workoutData, setWorkoutData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getPostsByWorkoutType(), getPostsByMonth()])
      .then(([workout, month]) => {
        setWorkoutData(workout);
        setMonthData(month);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><p>Loading statistics…</p></div>;
  if (error) return <div className="page-content"><p className="form-error">{error}</p></div>;

  const totalPosts = workoutData.reduce((s, d) => s + d.postCount, 0);
  const topWorkout = workoutData[0]?.workoutType ?? '—';
  const totalMonths = monthData.length;

  return (
    <div className="page-content">
      <h2>Statistics Dashboard</h2>
      <p className="meta">Live data from MongoDB — charts update as content is added.</p>

      {/* Summary cards */}
      <div className="stats-summary">
        <div className="stat-card card">
          <div className="stat-value">{totalPosts}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{workoutData.length}</div>
          <div className="stat-label">Workout Types</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{topWorkout}</div>
          <div className="stat-label">Most Popular</div>
        </div>
        <div className="stat-card card">
          <div className="stat-value">{totalMonths}</div>
          <div className="stat-label">Active Months</div>
        </div>
      </div>

      {/* Chart 1 — Posts by Workout Type (bar chart) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Posts by Workout Type</h3>
        {workoutData.length === 0 ? (
          <p className="meta">No post data yet. Create some posts to see this chart.</p>
        ) : (
          <D3PostsByWorkoutTypeChart data={workoutData} />
        )}
      </div>

      {/* Chart 2 — Posts by Month (line chart) */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Posts by Month</h3>
        {monthData.length === 0 ? (
          <p className="meta">No post data yet. Create some posts to see this chart.</p>
        ) : (
          <D3PostsByMonthChart data={monthData} />
        )}
      </div>
    </div>
  );
}
