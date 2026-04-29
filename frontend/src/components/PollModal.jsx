import { useState } from "react";
import { XIcon, PlusIcon, TrashIcon, BarChart3Icon } from "lucide-react";
import { useChatContext } from "stream-chat-react";
import toast from "react-hot-toast";

const PollModal = ({ channel, onClose }) => {
  const { client } = useChatContext();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    } else {
      toast.error("Maximum 10 options allowed");
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else {
      toast.error("At least 2 options are required");
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return toast.error("Question is required");
    if (options.some(opt => !opt.trim())) return toast.error("All options must be filled");

    setIsSubmitting(true);
    try {
      const pollData = {
        question,
        options,
        votes: options.map(() => [])
      };

      // We send the poll data as a custom field in the message
      // This will be handled by our PollMessage component
      await channel.sendMessage({
        text: `📊 **POLL: ${question}**`,
        poll_data: pollData
      });

      toast.success("Poll created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-channel-modal-overlay">
      <div className="create-channel-modal">
        <div className="create-channel-modal__header">
          <div className="flex items-center gap-2">
            <BarChart3Icon className="size-5 text-primary" />
            <h2>Create a Poll</h2>
          </div>
          <button onClick={onClose} className="create-channel-modal__close">
            <XIcon className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-channel-modal__form">
          <div className="form-group">
            <label>Question</label>
            <input
              type="text"
              className="form-input"
              placeholder="What would you like to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              autoFocus
              style={{ paddingLeft: '1rem' }}
            />
          </div>

          <div className="form-group">
            <label>Options</label>
            <div className="flex flex-col gap-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    style={{ paddingLeft: '1rem' }}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2 flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                <PlusIcon className="size-4" />
                <span>Add Option</span>
              </button>
            )}
          </div>

          <div className="create-channel-modal__actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !question.trim()}
              className="btn btn-primary"
            >
              {isSubmitting ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PollModal;
