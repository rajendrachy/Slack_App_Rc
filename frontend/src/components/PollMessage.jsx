import { useState } from "react";
import { BarChart3Icon, CheckIcon } from "lucide-react";
import { useChatContext, useMessageContext } from "stream-chat-react";
import toast from "react-hot-toast";

const PollMessage = () => {
  const { message } = useMessageContext();
  const { client } = useChatContext();
  
  const pollData = message.poll_data;
  if (!pollData) return null;

  const [votes, setVotes] = useState(pollData.votes || []);
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = Array.isArray(votes) ? votes.reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0) : 0;
  const userHasVoted = Array.isArray(votes) && votes.some(voters => Array.isArray(voters) && voters.includes(client.user?.id));

  const handleVote = async (optionIndex) => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      const newVotes = [...votes];
      
      // Toggle vote
      if (newVotes[optionIndex].includes(client.user.id)) {
        newVotes[optionIndex] = newVotes[optionIndex].filter(id => id !== client.user.id);
      } else {
        // Remove from other options if any (single choice poll)
        newVotes.forEach((voters, idx) => {
          if (idx !== optionIndex) {
            newVotes[idx] = voters.filter(id => id !== client.user.id);
          }
        });
        newVotes[optionIndex] = [...newVotes[optionIndex], client.user.id];
      }

      await client.updateMessage({
        ...message,
        poll_data: {
          ...pollData,
          votes: newVotes
        }
      });

      setVotes(newVotes);
      toast.success("Vote updated");
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="poll-container my-2 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 max-w-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3Icon className="size-4 text-primary" />
        <h4 className="font-bold text-sm text-white">{pollData.question}</h4>
      </div>

      <div className="flex flex-col gap-3">
        {pollData.options.map((option, index) => {
          const optionVotes = Array.isArray(votes?.[index]) ? votes[index].length : 0;
          const percentage = totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100);
          const isSelected = Array.isArray(votes?.[index]) && votes[index].includes(client.user?.id);

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={isVoting}
              className={`relative overflow-hidden p-3 rounded-xl border transition-all text-left group ${
                isSelected ? 'border-primary bg-primary/10' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-800/30'
              }`}
            >
              {/* Progress Bar Background */}
              <div 
                className="absolute left-0 top-0 h-full bg-primary/20 transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />

              <div className="relative flex justify-between items-center gap-2 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-100">{option}</span>
                  {isSelected && <CheckIcon className="size-3 text-primary" />}
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300">
                  {percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </p>
      </div>
    </div>
  );
};

export default PollMessage;
