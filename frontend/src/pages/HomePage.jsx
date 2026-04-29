import { UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useStreamChat } from "../hooks/useStreamChat";
import PageLoader from "../components/PageLoader";

import {
  Chat,
  Channel,
  ChannelList,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import { HashIcon, PlusIcon, UsersIcon } from "lucide-react";
import CreateChannelModal from "../components/CreateChannelModal";
import CustomChannelPreview from "../components/CustomChannelPreview";
import UsersList from "../components/UsersList";
import CustomChannelHeader from "../components/CustomChannelHeader";

const HomePage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { chatClient, error, isLoading } = useStreamChat();

  // set active channel from URL params
  useEffect(() => {
    const handleUrlChange = () => {
      const channelId = searchParams.get("channel");
      if (channelId && chatClient) {
        const channel = chatClient.channel("messaging", channelId);
        setActiveChannel(channel);
      } else {
        setActiveChannel(null);
      }
    };

    handleUrlChange();

    // Listen for custom popstate if dispatched manually or back button
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [chatClient, searchParams]);

  // todo: handle this with a better component
  if (error) return <p>Something went wrong...</p>;
  if (isLoading || !chatClient) return <PageLoader />;

  return (
    <div className={`flex-row-fill ${activeChannel ? 'has-active-channel' : ''}`}>
      <Chat client={chatClient} theme="str-chat__theme-dark">
        <div className="sidebar-premium">
          {/* HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
            <div className="brand-container">
              <img src="/logo-new.png" alt="Logo" className="brand-logo" />
              <span className="brand-name text-white">Slap</span>
            </div>
            <div className="user-button-wrapper">
              <UserButton />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="create-channel-section">
              <button onClick={() => setIsCreateModalOpen(true)} className="create-channel-btn">
                <PlusIcon className="size-4" />
                <span>New Channel</span>
              </button>
            </div>

            <ChannelList
              filters={{ members: { $in: [chatClient?.user?.id] } }}
              options={{ state: true, watch: true }}
              Preview={({ channel }) => (
                <CustomChannelPreview
                  channel={channel}
                  activeChannel={activeChannel}
                  setActiveChannel={(channel) => setSearchParams({ channel: channel.id })}
                />
              )}
              List={({ children, loading, error }) => (
                <>
                  <div className="section-title section-header">
                    <HashIcon className="size-3.5 inline mr-2" />
                    <span>Channels</span>
                  </div>
                  {loading && <div className="px-6 py-2 text-xs text-zinc-500">Syncing...</div>}
                  <div className="channels-list-v2">{children}</div>

                  <div className="section-title section-header">
                    <UsersIcon className="size-3.5 inline mr-2" />
                    <span>Direct Messages</span>
                  </div>
                  <UsersList activeChannel={activeChannel} />
                </>
              )}
            />
          </div>
        </div>

        <div className="main-content-premium">
          <Channel channel={activeChannel}>
            <Window>
              <CustomChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </div>

        {isCreateModalOpen && <CreateChannelModal onClose={() => setIsCreateModalOpen(false)} />}
      </Chat>
    </div>
  );
};
export default HomePage;
