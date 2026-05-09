import { useAuth } from '../context/AuthContext.jsx';
import { deleteMessage } from '../api/messagesApi.js';

export default function MessageBubble({ message, onDelete }) {
  const { currentUser } = useAuth();
  const isOwn = message.senderId?._id === currentUser?._id ||
    message.senderId?.toString() === currentUser?._id;

  function handleDelete() {
    if (!window.confirm('Delete this message?')) return;
    deleteMessage(message._id)
      .then(() => onDelete && onDelete(message._id))
      .catch((err) => alert(err.message));
  }

  return (
    <div className={`message-bubble-row ${isOwn ? 'own' : 'other'}`}>
      <div className={`message-bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}>
        {!isOwn && (
          <span className="bubble-sender">
            {message.senderId?.fullName || message.senderId?.username}
          </span>
        )}
        <p className="bubble-content">{message.content}</p>
        <span className="bubble-time">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isOwn && message.isRead && ' ✓'}
        </span>
      </div>
      {isOwn && (
        <button className="bubble-delete" onClick={handleDelete} title="Delete">✕</button>
      )}
    </div>
  );
}
