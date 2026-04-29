import { Hash, Lock } from "lucide-react";

const CustomChannelPreview = ({ channel, setActiveChannel, activeChannel }) => {
  const isActive = activeChannel && activeChannel.id === channel.id;
  const isDM = channel.data.member_count === 2 && channel.data.id.includes("user_");

  if (isDM) return null;

  const unreadCount = channel.countUnread();

  return (
    <button
      onClick={() => setActiveChannel(channel)}
      className={`channel-preview-item ${isActive ? "active" : ""}`}
    >
      <div className="icon-wrapper">
        {channel.data?.private ? (
          <Lock className="size-3.5" />
        ) : (
          <Hash className="size-3.5" />
        )}
      </div>
      <span className="channel-name-text">{channel.data.id}</span>

      {unreadCount > 0 && <div className="unread-dot">{unreadCount}</div>}
      
      <style>{`
        .channel-preview-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: calc(100% - 1rem);
          margin: 0.125rem 0.5rem;
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          text-align: left;
        }
        .channel-preview-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.05);
        }
        .channel-preview-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .icon-wrapper {
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }
        .active .icon-wrapper {
          color: white;
        }
        .channel-name-text {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .active .channel-name-text {
          color: white;
        }
        .unread-dot {
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0 0.4rem;
          height: 16px;
          min-width: 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </button>
  );
};
export default CustomChannelPreview;
