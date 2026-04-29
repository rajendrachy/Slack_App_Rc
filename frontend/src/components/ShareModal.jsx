import { useState, useEffect } from "react";
import { X, Share2, Search, Send } from "lucide-react";
import { useChatContext } from "stream-chat-react";
import toast from "react-hot-toast";

const ShareModal = ({ message, onClose }) => {
  const { client } = useChatContext();
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const filter = { 
          members: { $in: [client.user.id] },
          type: 'messaging'
        };
        const sort = [{ last_message_at: -1 }];
        const response = await client.queryChannels(filter, sort, { limit: 10 });
        setChannels(response);
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [client]);

  const handleShare = async () => {
    if (!selectedChannel) return;

    setIsSharing(true);
    try {
      const shareText = message.text ? `*Shared message:*\n> ${message.text}` : "Shared an attachment";
      
      await selectedChannel.sendMessage({
        text: shareText,
        attachments: message.attachments || [],
        shared_message_id: message.id
      });

      toast.success("Message shared!");
      onClose();
    } catch (error) {
      console.error("Error sharing message:", error);
      toast.error("Failed to share message");
    } finally {
      setIsSharing(false);
    }
  };

  const filteredChannels = channels.filter(channel => {
    const name = channel.data.name || channel.id;
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        <div className="create-channel-modal__header">
          <div className="flex items-center gap-2">
            <Share2 className="size-5 text-primary" />
            <h2>Share Message</h2>
          </div>
          <button onClick={onClose} className="create-channel-modal__close">
            <X className="size-5" />
          </button>
        </div>

        <div className="create-channel-modal__form">
          <div className="search-bar-mini w-full mb-4 !flex">
            <Search className="size-4 text-zinc-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search channels or people..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
            {isLoading ? (
              <p className="text-center text-zinc-500 py-4">Loading channels...</p>
            ) : filteredChannels.length > 0 ? (
              filteredChannels.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedChannel?.id === channel.id 
                    ? "bg-primary/20 border border-primary" 
                    : "bg-zinc-900/50 border border-transparent hover:bg-zinc-800"
                  }`}
                >
                  <div className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase">
                    {(channel.data.name || channel.id).charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-white truncate">
                    {channel.data.name || channel.id}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-4">No channels found</p>
            )}
          </div>

          <div className="create-channel-modal__actions mt-6">
            <button onClick={onClose} className="btn btn-secondary" disabled={isSharing}>
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={!selectedChannel || isSharing}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSharing ? "Sharing..." : (
                <>
                  <SendIcon className="size-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
