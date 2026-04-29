import { useEffect, useState } from "react";
import { useChatContext } from "stream-chat-react";
import { XIcon } from "lucide-react";

const InviteModal = ({ channel, onClose }) => {
  const { client } = useChatContext();

  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // we could have done this with tanstack query, but to keep it simple, we're using useEffect here...
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setError("");

      try {
        const members = Object.keys(channel.state.members);
        const res = await client.queryUsers({ id: { $nin: members } }, { name: 1 }, { limit: 30 });
        setUsers(res.users);
      } catch (error) {
        console.log("Error fetching users", error);
        setError("Failed to load users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [channel, client]);

  const handleInvite = async () => {
    if (selectedMembers.length === 0) return;

    setIsInviting(true);
    setError("");

    try {
      await channel.addMembers(selectedMembers);
      onClose();
    } catch (error) {
      setError("Failed to invite users");
      console.log("Error inviting users:", error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        {/* HEADER */}
        <div className="create-channel-modal__header">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5 text-primary" />
            <h2>Invite Users</h2>
          </div>
          <button onClick={onClose} className="create-channel-modal__close">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="create-channel-modal__form">
          {isLoadingUsers ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Searching for colleagues...</p>
            </div>
          ) : error ? (
            <div className="form-error mb-4">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 text-sm">Everyone is already here!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {users.map((user) => {
                const isChecked = selectedMembers.includes(user.id);

                return (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      isChecked 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary accent-primary"
                      value={user.id}
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedMembers([...selectedMembers, user.id]);
                        else setSelectedMembers(selectedMembers.filter((id) => id !== user.id));
                      }}
                    />

                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="size-10 rounded-lg object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="size-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-lg border border-zinc-700">
                        {(user.name || user.id).charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-sm">
                        {user.name || user.id}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-tight">
                        {user.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* ACTIONS */}
          <div className="create-channel-modal__actions pt-4 border-t border-zinc-800/50">
            <button className="btn btn-secondary" onClick={onClose} disabled={isInviting}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleInvite}
              disabled={!selectedMembers.length || isInviting}
            >
              {isInviting ? "Adding..." : `Invite ${selectedMembers.length > 0 ? selectedMembers.length : ''} Members`}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .accent-primary { accent-color: var(--primary); }
      `}</style>
    </div>
  );
};

export default InviteModal;
