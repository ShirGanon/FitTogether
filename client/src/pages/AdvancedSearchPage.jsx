// Advanced Search — satisfies the course requirement of at least 2 search
// queries each with at least 3 user-defined parameters.
//
// Search 1 (Groups): name, workoutType, location, difficultyLevel, isPrivate  → 5 params
// Search 2 (Posts):  content, postType, workoutType, difficultyLevel, location, dateFrom, dateTo, groupId → 8 params

import { useState, useEffect } from 'react';
import { searchGroups } from '../api/groupsApi.js';
import { searchPosts, createPost } from '../api/postsApi.js';
import { listGroups } from '../api/groupsApi.js';
import GroupCard from '../components/GroupCard.jsx';
import PostCard from '../components/PostCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const WORKOUT_TYPES = ['Running', 'Gym', 'Yoga', 'CrossFit', 'Cycling', 'Swimming', 'Home Workout', 'Other'];
const POST_TYPES = ['Question', 'Tip', 'Workout Plan', 'Looking for Partner', 'Progress Update', 'Event'];

const EMPTY_GROUP_FILTERS = { name: '', workoutType: '', location: '', difficultyLevel: '', isPrivate: '' };
const EMPTY_POST_FILTERS  = { content: '', postType: '', workoutType: '', difficultyLevel: '', location: '', dateFrom: '', dateTo: '', groupId: '' };

export default function AdvancedSearchPage() {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState('groups');

  // ── Group search state ──
  const [groupFilters, setGroupFilters] = useState(EMPTY_GROUP_FILTERS);
  const [groupResults, setGroupResults] = useState([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [groupSearched, setGroupSearched] = useState(false);

  // ── Post search state ──
  const [postFilters, setPostFilters] = useState(EMPTY_POST_FILTERS);
  const [postResults, setPostResults] = useState([]);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState('');
  const [postSearched, setPostSearched] = useState(false);
  const [allGroups, setAllGroups] = useState([]);

  useEffect(() => {
    listGroups().then(setAllGroups).catch(() => {});
  }, []);

  // ── Group search ──
  function handleGroupSearch(e) {
    e.preventDefault();
    const active = Object.fromEntries(Object.entries(groupFilters).filter(([, v]) => v !== ''));
    setGroupError('');
    setGroupLoading(true);
    setGroupSearched(true);
    searchGroups(active)
      .then(setGroupResults)
      .catch((err) => setGroupError(err.message))
      .finally(() => setGroupLoading(false));
  }

  function resetGroupSearch() {
    setGroupFilters(EMPTY_GROUP_FILTERS);
    setGroupResults([]);
    setGroupSearched(false);
    setGroupError('');
  }

  // ── Post search ──
  function handlePostSearch(e) {
    e.preventDefault();
    const active = Object.fromEntries(Object.entries(postFilters).filter(([, v]) => v !== ''));
    setPostError('');
    setPostLoading(true);
    setPostSearched(true);
    searchPosts(active)
      .then(setPostResults)
      .catch((err) => setPostError(err.message))
      .finally(() => setPostLoading(false));
  }

  function resetPostSearch() {
    setPostFilters(EMPTY_POST_FILTERS);
    setPostResults([]);
    setPostSearched(false);
    setPostError('');
  }

  return (
    <div className="page-content">
      <h2>Advanced Search</h2>

      <div className="tab-bar">
        <button className={`tab ${tab === 'groups' ? 'active' : ''}`} onClick={() => setTab('groups')}>
          Search Groups
        </button>
        <button className={`tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
          Search Posts
        </button>
      </div>

      {/* ── Search 1: Groups (5 parameters) ── */}
      {tab === 'groups' && (
        <>
          <form className="card search-form" onSubmit={handleGroupSearch}>
            <h3 style={{ marginTop: 0 }}>Group Search</h3>
            <p className="meta" style={{ marginBottom: 12 }}>
              Find fitness groups by name, workout type, location, difficulty, and privacy.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  value={groupFilters.name}
                  onChange={(e) => setGroupFilters({ ...groupFilters, name: e.target.value })}
                  placeholder="e.g. Running Tel Aviv"
                />
              </div>
              <div className="form-group">
                <label>Workout Type</label>
                <select
                  value={groupFilters.workoutType}
                  onChange={(e) => setGroupFilters({ ...groupFilters, workoutType: e.target.value })}
                >
                  <option value="">Any</option>
                  {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  value={groupFilters.location}
                  onChange={(e) => setGroupFilters({ ...groupFilters, location: e.target.value })}
                  placeholder="e.g. Tel Aviv"
                />
              </div>
              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  value={groupFilters.difficultyLevel}
                  onChange={(e) => setGroupFilters({ ...groupFilters, difficultyLevel: e.target.value })}
                >
                  <option value="">Any</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Privacy</label>
              <select
                value={groupFilters.isPrivate}
                onChange={(e) => setGroupFilters({ ...groupFilters, isPrivate: e.target.value })}
                style={{ maxWidth: 200 }}
              >
                <option value="">Public &amp; Private</option>
                <option value="false">Public only</option>
                <option value="true">Private only</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={groupLoading}>
                {groupLoading ? 'Searching…' : 'Search Groups'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetGroupSearch}>Reset</button>
            </div>
          </form>

          {groupError && <p className="form-error">{groupError}</p>}

          {groupSearched && !groupLoading && (
            <p className="meta" style={{ marginBottom: 8 }}>
              {groupResults.length} result{groupResults.length !== 1 ? 's' : ''} found.
            </p>
          )}

          {groupResults.length === 0 && groupSearched && !groupLoading && (
            <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
              <p>No groups match your search. Try different filters.</p>
            </div>
          )}

          <div className="group-list">
            {groupResults.map((g) => (
              <GroupCard key={g._id} group={g} onJoin={() => handleGroupSearch({ preventDefault: () => {} })} />
            ))}
          </div>
        </>
      )}

      {/* ── Search 2: Posts (8 parameters) ── */}
      {tab === 'posts' && (
        <>
          <form className="card search-form" onSubmit={handlePostSearch}>
            <h3 style={{ marginTop: 0 }}>Post Search</h3>
            <p className="meta" style={{ marginBottom: 12 }}>
              Find posts by text, type, workout, difficulty, location, date range, or group.
            </p>

            <div className="form-group">
              <label>Content (free text)</label>
              <input
                value={postFilters.content}
                onChange={(e) => setPostFilters({ ...postFilters, content: e.target.value })}
                placeholder="e.g. looking for a running partner"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Post Type</label>
                <select
                  value={postFilters.postType}
                  onChange={(e) => setPostFilters({ ...postFilters, postType: e.target.value })}
                >
                  <option value="">Any</option>
                  {POST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Workout Type</label>
                <select
                  value={postFilters.workoutType}
                  onChange={(e) => setPostFilters({ ...postFilters, workoutType: e.target.value })}
                >
                  <option value="">Any</option>
                  {WORKOUT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  value={postFilters.difficultyLevel}
                  onChange={(e) => setPostFilters({ ...postFilters, difficultyLevel: e.target.value })}
                >
                  <option value="">Any</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  value={postFilters.location}
                  onChange={(e) => setPostFilters({ ...postFilters, location: e.target.value })}
                  placeholder="e.g. Tel Aviv"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date From</label>
                <input
                  type="date"
                  value={postFilters.dateFrom}
                  onChange={(e) => setPostFilters({ ...postFilters, dateFrom: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Date To</label>
                <input
                  type="date"
                  value={postFilters.dateTo}
                  onChange={(e) => setPostFilters({ ...postFilters, dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Group</label>
              <select
                value={postFilters.groupId}
                onChange={(e) => setPostFilters({ ...postFilters, groupId: e.target.value })}
              >
                <option value="">Any group</option>
                {allGroups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={postLoading}>
                {postLoading ? 'Searching…' : 'Search Posts'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetPostSearch}>Reset</button>
            </div>
          </form>

          {postError && <p className="form-error">{postError}</p>}

          {postSearched && !postLoading && (
            <p className="meta" style={{ marginBottom: 8 }}>
              {postResults.length} result{postResults.length !== 1 ? 's' : ''} found.
            </p>
          )}

          {postResults.length === 0 && postSearched && !postLoading && (
            <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
              <p>No posts match your search. Try different filters.</p>
            </div>
          )}

          {postResults.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={(id) => setPostResults(postResults.filter((p) => p._id !== id))}
              onUpdate={(updated) => setPostResults(postResults.map((p) => p._id === updated._id ? updated : p))}
            />
          ))}
        </>
      )}
    </div>
  );
}
