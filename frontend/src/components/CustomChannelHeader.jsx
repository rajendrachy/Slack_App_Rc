import { HashIcon, LockIcon, UsersIcon, PinIcon, VideoIcon, SearchIcon, InfoIcon } from "lucide-react";
import { useChannelStateContext } from "stream-chat-react";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import MembersModal from "./MembersModal";
import PinnedMessagesModal from "./PinnedMessagesModal";
import InviteModal from "./InviteModal";
import ChannelInfoModal from "./ChannelInfoModal";
import PollModal from "./PollModal";
import { ChevronLeftIcon, BarChart3Icon } from "lucide-react";

const CustomChannelHeader = () => {
  const { channel } = useChannelStateContext();
  const { user } = useUser();

  const memberCount = Object.keys(channel.state.members).length;

  const [showInvite, setShowInvite] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
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
        <button 
          className="mobile-back-btn" 
          onClick={() => {
            // Update URL to remove channel param
            const url = new URL(window.location);
            url.searchParams.delete('channel');
            window.history.pushState({}, '', url);
            // We dispatch a popstate event so the HomePage can detect URL changes 
            // if we use a different state mechanism it would be better, but URL is the source of truth here.
            window.dispatchEvent(new Event('popstate'));
          }}
        >
          <ChevronLeftIcon className="size-5" />
        </button>
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

          <button 
            className="action-icon-btn poll-btn" 
            onClick={() => setShowPollModal(true)} 
            title="Create Poll"
          >
            <BarChart3Icon className="size-4" />
          </button>

          <button className="action-icon-btn" onClick={handleShowPinned} title="Pinned Messages">
            <PinIcon className="size-4" />
          </button>

          <button className="action-icon-btn" onClick={() => setShowChannelInfo(true)} title="Channel Info">
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

      {showChannelInfo && (
        <ChannelInfoModal
          channel={channel}
          onClose={() => setShowChannelInfo(false)}
        />
      )}

      {showPollModal && (
        <PollModal
          channel={channel}
          onClose={() => setShowPollModal(false)}
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
        .mobile-back-btn {
          display: none; /* hidden on desktop */
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.25rem;
          margin-right: 0.25rem;
          cursor: pointer;
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
        .poll-btn {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.2);
          color: #a855f7;
        }
        .poll-btn:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: rgba(168, 85, 247, 0.4);
          color: white;
          box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
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

        /* Mobile Responsiveness for Header */
        @media (max-width: 768px) {
          .header-container {
            padding: 0 0.75rem;
          }
          .mobile-back-btn {
            display: flex; /* show on mobile */
          }
          .search-bar-mini {
            display: none; /* hide search on mobile to save space */
          }
          .header-right {
            gap: 0.5rem;
          }
          .header-action-btn span {
            display: none; /* Hide member count text on mobile */
          }
          .channel-name {
            max-width: 120px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .invite-pill {
            padding: 0.3rem 0.6rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomChannelHeader;
