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
          padding-top: 0.5rem;
        }
        .user-list-item {
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
        .user-list-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.05);
        }
        .user-list-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .user-avatar-wrapper {
          position: relative;
          display: flex;
        }
        .user-avatar, .user-avatar-placeholder {
          width: 24px;
          height: 24px;
          border-radius: 6px;
        }
        .user-avatar-placeholder {
          background: var(--bg-card);
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          border: 1px solid var(--border);
        }
        .status-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid var(--bg-sidebar);
        }
        .status-indicator.online {
          background: #22c55e;
        }
        .status-indicator.offline {
          background: #71717a;
        }
        .user-name-text {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .active .user-name-text {
          color: white;
        }
        .loading-state, .error-state, .empty-state {
          padding: 1.5rem;
          margin: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default UsersList;
