import { XIcon, LockIcon, HashIcon, UsersIcon, CalendarIcon, InfoIcon } from "lucide-react";

function ChannelInfoModal({ channel, onClose }) {
  const memberCount = Object.keys(channel.state.members).length;
  const createdAt = channel.data?.created_at ? new Date(channel.data.created_at) : null;
  const isPrivate = channel.data?.private;
  const isDM = channel.data?.member_count === 2 && channel.data?.id.includes("user_");

  // In a DM, the channel ID is usually a combination of user IDs, not a real name.
  // We handle DM name differently if needed, but usually channel info is for groups.
  const channelName = channel.data?.name || channel.data?.id;

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
        `}</style>
      </div>
    </div>
  );
}

export default ChannelInfoModal;
