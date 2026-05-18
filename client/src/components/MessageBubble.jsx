import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { editMessage, deleteMessage } from '../api/messagesApi.js';

export default function MessageBubble({ message, onDelete, onUpdate }) {
  const { currentUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState(message.content);
  const [saving, setSaving]     = useState(false);

  const isOwn = message.senderId?._id === currentUser?._id ||
    message.senderId?.toString() === currentUser?._id;

  function handleDelete() {
    if (!window.confirm('Delete this message?')) return;
    deleteMessage(message._id)
      .then(() => onDelete && onDelete(message._id))
      .catch((err) => alert(err.message));
  }

  function handleEdit(e) {
    e.preventDefault();
    if (!draft.trim() || draft.trim() === message.content) { setEditing(false); return; }
    setSaving(true);
    editMessage(message._id, draft.trim())
      .then((updated) => {
        setEditing(false);
        onUpdate && onUpdate(updated);
      })
      .catch((err) => alert(err.message))
      .finally(() => setSaving(false));
  }

  return (
    <div className={`message-bubble-row ${isOwn ? 'own' : 'other'}`}>
      <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
        {!isOwn && (
          <span className="bubble-sender">
            {message.senderId?.fullName || message.senderId?.username}
          </span>
        )}

        {editing ? (
          <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 8, padding: '4px 8px', color: '#fff', fontSize: '0.9rem',
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="submit" disabled={saving}
                style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                {saving ? '…' : 'Save'}
              </button>
              <button type="button" onClick={() => { setEditing(false); setDraft(message.content); }}
                style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="bubble-content">{message.content}</p>
        )}

        <span className="bubble-time">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOwn && message.isRead && ' ✓'}
        </span>
      </div>

      {/* Edit + Delete buttons — only for own messages, appear on hover */}
      {isOwn && !editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button className="bubble-delete" onClick={() => { setEditing(true); setDraft(message.content); }} title="Edit">✏️</button>
          <button className="bubble-delete" onClick={handleDelete} title="Delete">✕</button>
        </div>
      )}
    </div>
  );
}
