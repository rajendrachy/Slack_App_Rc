import { HashIcon, LockIcon, UsersIcon, PinIcon, VideoIcon, SearchIcon, InfoIcon } from "lucide-react";
import { useChannelStateContext } from "stream-chat-react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMessagesModal";
import InviteModal from "./InviteModal";

const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const { user } = useUser();

  const memberCount = Object.keys(channel.state.members).length;

  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);

  const otherUser = Object.values(channel.state.members).find(
    (member) => member.user.id !== user.id
  );

  const isDM = channel.data?.member_count === 2 && channel.data?.id.includes("user_");

  const handleShowPinned = async () => {
    const channelState = await channel.query();
    setPinnedMessages(channelState.pinned_messages);
    setShowPinnedMessages(true);
  };

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;
      await channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });
    }
  };

  return (
    <div className="header-container">
      <div className="header-left">
        <div className="channel-info">
          {channel.data?.private ? (
            <LockIcon className="channel-icon-sm text-amber-400" />
          ) : (
            <HashIcon className="channel-icon-sm text-indigo-400" />
          )}

          {isDM && otherUser?.user?.image && (
            <img
              src={otherUser.user.image}
              alt={otherUser.user.name || otherUser.user.id}
              className="user-avatar-sm"
            />
          )}

          <h2 className="channel-name">
            {isDM ? otherUser?.user?.name || otherUser?.user?.id : channel.data?.id}
          </h2>
        </div>
        
        <div className="header-divider"></div>
        
        <button className="header-action-btn" onClick={() => setShowMembers(true)}>
          <UsersIcon className="size-4" />
          <span>{memberCount}</span>
        </button>
      </div>

      <div className="header-right">
        <div className="search-bar-mini">
          <SearchIcon className="size-3.5 text-zinc-500" />
          <input type="text" placeholder="Search message..." />
        </div>

        <div className="header-actions">
          <button
            className="action-icon-btn call-btn"
            onClick={handleVideoCall}
            title="Start Video Call"
          >
            <VideoIcon className="size-4" />
          </button>

          <button className="action-icon-btn" onClick={handleShowPinned} title="Pinned Messages">
            <PinIcon className="size-4" />
          </button>

          <button className="action-icon-btn" title="Channel Info">
            <InfoIcon className="size-4" />
          </button>

          {channel.data?.private && (
            <button className="invite-pill" onClick={() => setShowInvite(true)}>
              Invite
            </button>
          )}
        </div>
      </div>

      {showMembers && (
        <MembersModal
          members={Object.values(channel.state.members)}
          onClose={() => setShowMembers(false)}
        />
      )}

      {showPinnedMessages && (
        <PinnedMessagesModal
          pinnedMessages={pinnedMessages}
          onClose={() => setShowPinnedMessages(false)}
        />
      )}

      {showInvite && <InviteModal channel={channel} onClose={() => setShowInvite(false)} />}
      
      <style>{`
        .header-container {
          height: 64px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          background: var(--bg-main);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .channel-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .channel-icon-sm {
          width: 16px;
          height: 16px;
        }
        .user-avatar-sm {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          object-cover: cover;
        }
        .channel-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .header-divider {
          width: 1px;
          height: 24px;
          background: var(--border);
        }
        .header-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .header-action-btn:hover {
          background: var(--bg-card);
          color: var(--text-main);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .search-bar-mini {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          padding: 0 0.75rem;
          height: 32px;
          width: 200px;
          transition: width 0.3s ease;
        }
        .search-bar-mini:focus-within {
          width: 280px;
          border-color: var(--primary);
        }
        .search-bar-mini input {
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.8rem;
          padding-left: 0.5rem;
          outline: none;
          width: 100%;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .action-icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-icon-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-main);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .call-btn {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.2);
          color: #818cf8;
        }
        .call-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: rgba(99, 102, 241, 0.4);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        .invite-pill {
          background: var(--primary);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CustomChannelHeader;
