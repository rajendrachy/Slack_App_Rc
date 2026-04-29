import { 
  MessageSimple, 
  MessageOptions, 
  useMessageContext,
  useChannelActionContext
} from "stream-chat-react";
import PollMessage from "./PollMessage";
import { Share2Icon } from "lucide-react";

const CustomMessage = (props) => {
  const { message } = useMessageContext();
  const { setOpenShareModal } = props;

  // Custom action handler
  const handleShare = (e) => {
    e.preventDefault();
    setOpenShareModal(message);
  };

  return (
    <div className="custom-message-wrapper">
      {message.poll_data ? (
        <div className="str-chat__message-simple str-chat__message-simple--data">
           {/* We still want the default message structure for metadata/avatar but replace the content if it's a poll */}
           <MessageSimple {...props} />
           <div className="ml-12">
             <PollMessage />
           </div>
        </div>
      ) : (
        <MessageSimple {...props} />
      )}
    </div>
  );
};

// We can also customize the message actions to include "Share"
export const CustomMessageActions = (props) => {
  const { message } = useMessageContext();
  const { setOpenShareModal } = props;

  return (
    <div className="flex items-center gap-1">
      <button 
        className="p-1 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-white transition-colors"
        onClick={() => setOpenShareModal(message)}
        title="Share message"
      >
        <Share2Icon className="size-4" />
      </button>
      <MessageOptions {...props} />
    </div>
  );
};

export default CustomMessage;
