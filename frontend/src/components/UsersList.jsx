import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { useChatContext } from "stream-chat-react";

import * as Sentry from "@sentry/react";

const UsersList = ({ activeChannel }) => {
  const { client } = useChatContext();
  const [_, setSearchParams] = useSearchParams();

  const fetchUsers = useCallback(async () => {
    if (!client?.user) return;

    const response = await client.queryUsers(
      { id: { $ne: client.user.id } },
      { name: 1 },
      { limit: 20 }
    );

    const usersOnly = response.users.filter((user) => !user.id.startsWith("recording-"));

    return usersOnly;
  }, [client]);

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users-list", client?.user?.id],
    queryFn: fetchUsers,
    enabled: !!client?.user,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  const startDirectMessage = async (targetUser) => {
    if (!targetUser || !client?.user) return;

    try {
      const channelId = [client.user.id, targetUser.id].sort().join("-").slice(0, 64);
      const channel = client.channel("messaging", channelId, {
        members: [client.user.id, targetUser.id],
      });
      await channel.watch();
      setSearchParams({ channel: channel.id });
    } catch (error) {
      console.log("Error creating DM", error),
        Sentry.captureException(error, {
          tags: { component: "UsersList" },
          extra: {
            context: "create_direct_message",
            targetUserId: targetUser?.id,
          },
        });
    }
  };

  if (isLoading) return <div className="loading-state">Loading users...</div>;
  if (isError) return <div className="error-state">Failed to load users</div>;
  if (!users.length) return <div className="empty-state">No other users found</div>;

  return (
    <div className="users-list-container">
      {users.map((user) => {
        const channelId = [client.user.id, user.id].sort().join("-").slice(0, 64);
        const channel = client.channel("messaging", channelId, {
          members: [client.user.id, user.id],
        });
        const unreadCount = channel.countUnread();
        const isActive = activeChannel && activeChannel.id === channelId;

        return (
          <button
            key={user.id}
            onClick={() => startDirectMessage(user)}
            className={`user-list-item ${isActive ? "active" : ""}`}
          >
            <div className="user-avatar-wrapper">
              {user.image ? (
                <img src={user.image} alt={user.name || user.id} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  {(user.name || user.id).charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`status-indicator ${user.online ? "online" : "offline"}`} />
            </div>

            <span className="user-name-text">{user.name || user.id}</span>

            {unreadCount > 0 && <div className="unread-dot">{unreadCount}</div>}
          </button>
        );
      })}
      
      <style>{`
        .users-list-container {
          padding-bottom: 1rem;
        }
        .user-list-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: calc(100% - 1rem);
          margin: 0.1rem 0.5rem;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease-in-out;
          border: none;
          background: transparent;
          text-align: left;
        }
        .user-list-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .user-list-item.active {
          background: var(--primary);
          color: white;
        }
        .user-avatar-wrapper {
          position: relative;
          display: flex;
        }
        .user-avatar, .user-avatar-placeholder {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }
        .user-avatar-placeholder {
          background: var(--bg-card);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 700;
          border: 1px solid var(--border);
        }
        .status-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid var(--bg-sidebar);
        }
        .status-indicator.online {
          background: #22c55e;
        }
        .status-indicator.offline {
          background: transparent;
          border-color: #71717a;
        }
        .user-name-text {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-list-item:hover .user-name-text {
          color: var(--text-main);
        }
        .active .user-name-text {
          color: white;
          font-weight: 600;
        }
        .loading-state, .error-state, .empty-state {
          padding: 0.4rem 1.25rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: left;
          font-weight: 400;
          opacity: 0.8;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default UsersList;
