import { useState, useEffect } from "react";
import { X, ShieldCheck, User, Users, EyeOff, Globe } from "lucide-react";
import { useChatContext } from "stream-chat-react";
import toast from "react-hot-toast";

const ManageAccountModal = ({ onClose }) => {
  const { client } = useChatContext();
  const [privacy, setPrivacy] = useState(client.user?.privacy_view || "everyone");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("privacy"); // "privacy" or "friends"
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState(Array.isArray(client.user?.friends) ? client.user.friends : []);

  const handleUpdatePrivacy = async (newPrivacy) => {
    setIsUpdating(true);
    try {
      await client.upsertUser({
        id: client.user.id,
        privacy_view: newPrivacy,
      });
      setPrivacy(newPrivacy);
      toast.success(`Privacy set to ${newPrivacy}`);
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchTerm.trim()) return;
    try {
      const response = await client.queryUsers(
        { 
          $and: [
            { id: { $ne: client.user.id } },
            { name: { $autocomplete: searchTerm } }
          ]
        },
        { name: 1 },
        { limit: 5 }
      );
      setSearchResults(response.users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleToggleFriend = async (userId) => {
    const isFriend = Array.isArray(friends) && friends.includes(userId);
    const newFriends = isFriend 
      ? friends.filter(id => id !== userId)
      : [...(Array.isArray(friends) ? friends : []), userId];
    
    try {
      await client.upsertUser({
        id: client.user.id,
        friends: newFriends,
      });
      setFriends(newFriends);
      toast.success(isFriend ? "Removed from friends" : "Added to friends");
    } catch (error) {
      console.error("Error toggling friend:", error);
      toast.error("Failed to update friends");
    }
  };

  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        <div className="create-channel-modal__header !pb-0 border-none">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h2>Account & Social</h2>
          </div>
          <button onClick={onClose} className="create-channel-modal__close">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-4 px-6 mt-4 border-b border-zinc-800">
          <button 
            onClick={() => setActiveTab("privacy")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'privacy' ? 'border-primary text-white' : 'border-transparent text-zinc-500'}`}
          >
            Privacy
          </button>
          <button 
            onClick={() => setActiveTab("friends")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === 'friends' ? 'border-primary text-white' : 'border-transparent text-zinc-500'}`}
          >
            Friends
          </button>
        </div>

        <div className="create-channel-modal__form">
          {activeTab === "privacy" ? (
            <div className="account-section">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {client.user.image ? (
                    <img src={client.user.image} className="size-full rounded-full object-cover" alt="" />
                  ) : (
                    <User className="size-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{client.user.name || client.user.id}</h3>
                  <p className="text-xs text-zinc-500">Manage your profile visibility</p>
                </div>
              </div>

              <div className="form-group">
                <label className="text-zinc-400 text-xs uppercase tracking-wider mb-2">Who can view me in Direct Messages?</label>
                <div className="radio-group">
                  <label className={`radio-option ${privacy === 'everyone' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="privacy"
                      value="everyone"
                      checked={privacy === "everyone"}
                      onChange={() => handleUpdatePrivacy("everyone")}
                      disabled={isUpdating}
                      className="hidden"
                    />
                    <div className="radio-content">
                      <Globe className="size-5 mt-1" />
                      <div>
                        <div className="radio-title">Everyone / Anyone</div>
                        <div className="radio-description">Your profile is visible to everyone.</div>
                      </div>
                    </div>
                  </label>

                  <label className={`radio-option ${privacy === 'friends' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="privacy"
                      value="friends"
                      checked={privacy === "friends"}
                      onChange={() => handleUpdatePrivacy("friends")}
                      disabled={isUpdating}
                      className="hidden"
                    />
                    <div className="radio-content">
                      <Users className="size-5 mt-1" />
                      <div>
                        <div className="radio-title">Friends</div>
                        <div className="radio-description">Only your friends can see you.</div>
                      </div>
                    </div>
                  </label>

                  <label className={`radio-option ${privacy === 'none' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="privacy"
                      value="none"
                      checked={privacy === "none"}
                      onChange={() => handleUpdatePrivacy("none")}
                      disabled={isUpdating}
                      className="hidden"
                    />
                    <div className="radio-content">
                      <EyeOff className="size-5 mt-1" />
                      <div>
                        <div className="radio-title">No one</div>
                        <div className="radio-description">Your profile is completely hidden.</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="friends-section flex flex-col gap-4">
              <div className="search-box relative">
                <input
                  type="text"
                  placeholder="Find people by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && handleSearchUsers()}
                  className="form-input !pl-10"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <button 
                  onClick={handleSearchUsers}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded font-bold"
                >
                  SEARCH
                </button>
              </div>

              <div className="results-list flex flex-col gap-2 min-h-20">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <img src={user.image || "/default-avatar.png"} className="size-8 rounded-full" alt="" />
                      <span className="text-sm font-medium text-white">{user.name || user.id}</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFriend(user.id)}
                      className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                        friends.includes(user.id) 
                        ? 'bg-zinc-800 text-zinc-400' 
                        : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white'
                      }`}
                    >
                      {friends.includes(user.id) ? "Friend" : "Add Friend"}
                    </button>
                  </div>
                ))}
                {searchTerm && searchResults.length === 0 && (
                  <p className="text-center text-zinc-500 text-xs py-4">No users found</p>
                )}
              </div>

              {friends.length > 0 && (
                <div className="mt-2">
                  <label className="text-zinc-400 text-[10px] uppercase tracking-widest mb-2 block">My Friends ({friends.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {friends.slice(0, 5).map(friendId => (
                      <div key={friendId} className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-full text-[10px] text-zinc-300">
                         <span>{friendId}</span>
                         <button onClick={() => handleToggleFriend(friendId)} className="hover:text-red-400">
                           <X className="size-2.5" />
                         </button>
                      </div>
                    ))}
                    {friends.length > 5 && <span className="text-zinc-500 text-[10px] self-center">+{friends.length - 5} more</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="create-channel-modal__actions mt-6">
            <button onClick={onClose} className="btn btn-primary w-full">
              Done
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .account-section {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .radio-option.active {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.05);
        }
      `}</style>
    </div>
  );
};

export default ManageAccountModal;
