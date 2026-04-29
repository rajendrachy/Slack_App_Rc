import { XIcon, LockIcon, HashIcon, UsersIcon, CalendarIcon, InfoIcon, TrashIcon } from "lucide-react";
import { useChatContext } from "stream-chat-react";

function ChannelInfoModal({ channel, onClose }) {
  const { client } = useChatContext();
  const memberCount = Object.keys(channel.state.members).length;
  const createdAt = channel.data?.created_at ? new Date(channel.data.created_at) : null;
  const isPrivate = channel.data?.private;
  const isDM = channel.data?.member_count === 2 && channel.data?.id.includes("user_");

  // In a DM, the channel ID is usually a combination of user IDs, not a real name.
  // We handle DM name differently if needed, but usually channel info is for groups.
  const channelName = channel.data?.name || channel.data?.id;

  // Check if current user has permission to delete the channel
  const currentUserRole = channel.state.members[client.userID]?.role;
  const canDelete = currentUserRole === "owner" || currentUserRole === "admin" || channel.data?.created_by?.id === client.userID;

  const handleDeleteChannel = async () => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the channel "${channelName}"? This action cannot be undone and will permanently delete all message history.`);
    
    if (isConfirmed) {
      try {
        await channel.delete();
        
        // Update URL to remove channel param
        const url = new URL(window.location);
        url.searchParams.delete('channel');
        window.history.pushState({}, '', url);
        window.dispatchEvent(new Event('popstate'));
        
        onClose();
      } catch (error) {
        console.error("Failed to delete channel:", error);
        alert("Failed to delete channel. You might not have the correct permissions.");
      }
    }
  };

  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal channel-info-modal">
        {/* HEADER */}
        <div className="create-channel-modal__header">
          <h2>Channel Info</h2>
          <button onClick={onClose} className="create-channel-modal__close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* INFO CONTENT */}
        <div className="create-channel-modal__form">
          <div className="info-section">
            <div className="info-avatar">
              {isPrivate ? (
                <LockIcon className="w-8 h-8 text-amber-400" />
              ) : (
                <HashIcon className="w-8 h-8 text-indigo-400" />
              )}
            </div>
            <h3 className="info-channel-name">{channelName}</h3>
          </div>

          <div className="info-details">
            <div className="info-item">
              <UsersIcon className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="info-label">Members</span>
                <span className="info-value">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="info-item">
              <InfoIcon className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="info-label">Privacy</span>
                <span className="info-value">{isPrivate ? "Private Channel" : "Public Channel"}</span>
              </div>
            </div>

            {createdAt && (
              <div className="info-item">
                <CalendarIcon className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="info-label">Created</span>
                  <span className="info-value">
                    {createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {canDelete && !isDM && (
            <div className="danger-zone">
              <button onClick={handleDeleteChannel} className="delete-channel-btn">
                <TrashIcon className="w-4 h-4" />
                <span>Delete Channel</span>
              </button>
            </div>
          )}
        </div>

        {/* INLINE STYLES FOR SPECIFIC MODAL (using existing global classes where possible) */}
        <style>{`
          .channel-info-modal {
            max-width: 400px;
          }
          .info-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border);
          }
          .info-avatar {
            width: 64px;
            height: 64px;
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .info-channel-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-main);
            text-align: center;
          }
          .info-details {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            padding-top: 0.5rem;
          }
          .info-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
          }
          .info-item > div {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          }
          .info-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            font-weight: 600;
          }
          .info-value {
            font-size: 0.95rem;
            color: var(--text-main);
          }
          .danger-zone {
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px dashed var(--border);
            display: flex;
            justify-content: center;
          }
          .delete-channel-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            width: 100%;
            justify-content: center;
          }
          .delete-channel-btn:hover {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.4);
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    </div>
  );
}

export default ChannelInfoModal;
