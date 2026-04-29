import { X } from "lucide-react";

function PinnedMessagesModal({ pinnedMessages, onClose }) {
  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        {/* HEADER */}
        <div className="create-channel-modal__header">
          <h2>Pinned Messages</h2>
          <button onClick={onClose} className="create-channel-modal__close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MESSAGES LIST */}
        <div className="create-channel-modal__form">
          <div className="members-list" style={{ maxHeight: '350px', padding: '0.5rem' }}>
            {pinnedMessages.map((msg) => (
              <div key={msg.id} className="member-item" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={msg.user.image}
                    alt={msg.user.name}
                    className="member-avatar"
                  />
                  <span className="member-name" style={{ fontWeight: '600' }}>{msg.user.name}</span>
                </div>
                <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', paddingLeft: '2.5rem', whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {pinnedMessages.length === 0 && (
              <div className="empty-state" style={{ marginTop: '0', border: 'none' }}>No pinned messages</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PinnedMessagesModal;
