import type { SMSInboxBlock } from "./types";
import { useState } from "react";
import { 
  MessageSquare, 
  Send, 
  AlertCircle
} from "lucide-react";

interface Props {
  block: SMSInboxBlock;
}

export function SMSInbox({ block }: Props) {
  void block;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "You",
      content: "How much will 2 bags cost at the market?",
      timestamp: "23h ago",
      unread: false,
    },
    {
      id: 2,
      sender: "Agrion Advisory",
      content: "Fertilizer prices vary by region. Check with your local agro-dealer for current rates.",
      timestamp: "22h ago",
      unread: false,
    },
    {
      id: 3,
      sender: "Agrion Advisory",
      content: "Pest Alert: Armyworms detected in your region. Check your fields and spray neem extract.",
      timestamp: "12h ago",
      unread: true,
    },
    {
      id: 4,
      sender: "You",
      content: "I found some damaged leaves. Will spray tomorrow morning.",
      timestamp: "11h ago",
      unread: false,
    },
    {
      id: 5,
      sender: "Agrion Advisory",
      content: "Good action! Spray early morning or late evening. Re-apply after 7 days.",
      timestamp: "10h ago",
      unread: false,
    },
  ]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "You",
        content: newMessage.trim(),
        timestamp: "Just now",
        unread: false,
      },
    ]);
    setNewMessage("");

    // Auto-reply simulation
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "Agrion Advisory",
          content: "Thank you for your message. Our AI is analyzing your query and will respond shortly.",
          timestamp: "Just now",
          unread: true,
        },
      ]);
    }, 1500);
  };

  const unreadCount = messages.filter(m => m.unread).length;

  return (
    <div className="rounded-xl border border-sand dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-thunder dark:text-dark-text flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-marigold dark:text-dark-accent" />
          SMS Inbox
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-marigold/10 dark:bg-dark-accent/10 text-marigold dark:text-dark-accent px-2 py-1 rounded flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {unreadCount} unread
          </span>
        </div>
      </div>

      {/* Two-Way Messaging Description */}
      <div className="mb-4 p-3 bg-cream dark:bg-dark-bg2 rounded-lg border border-sand/50 dark:border-dark-border/50">
        <div className="flex items-start gap-2">
          <div>
            <p className="text-xs font-medium text-thunder dark:text-dark-text">
              📱 Two-Way Messaging
            </p>
            <p className="text-xs text-dallas dark:text-dark-text2">
              Farmers receive personalized agricultural advice via SMS without needing internet or a smartphone. They can reply with questions or updates.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Updates */}
      <div className="mb-4 p-3 bg-marigold/5 dark:bg-dark-accent/5 rounded-lg border border-marigold/20 dark:border-dark-accent/20">
        <p className="text-xs text-dallas dark:text-dark-text2">
          <span className="font-medium text-marigold dark:text-dark-accent">⚡ Real-Time Updates:</span>
          Farmers receive timely alerts about weather, pests, and farming practices. Each message is limited to 160 characters.
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-3 max-h-64 overflow-y-auto mb-3 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg border ${
              msg.sender === "You"
                ? 'bg-cream dark:bg-dark-bg2 border-sand/50 dark:border-dark-border/50 ml-8'
                : 'bg-marigold/5 dark:bg-dark-accent/5 border-marigold/20 dark:border-dark-accent/20 mr-8'
            } ${msg.unread ? 'border-marigold dark:border-dark-accent' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${
                  msg.sender === "You" 
                    ? 'text-dallas dark:text-dark-text2' 
                    : 'text-marigold dark:text-dark-accent'
                }`}>
                  {msg.sender}
                </span>
                {msg.unread && (
                  <span className="text-[10px] bg-marigold dark:bg-dark-accent text-white px-1.5 py-0.5 rounded">
                    New
                  </span>
                )}
              </div>
              <span className="text-[10px] text-dallas dark:text-dark-text2">{msg.timestamp}</span>
            </div>
            <p className="text-sm text-thunder dark:text-dark-text mt-1 leading-relaxed">
              {msg.content}
            </p>
          </div>
        ))}
      </div>

      {/* New Message Input */}
      <div className="flex gap-2 border-t border-sand dark:border-dark-border pt-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Reply to Agrion..."
          className="flex-1 px-3 py-2 rounded-lg border border-sand dark:border-dark-border bg-cream dark:bg-dark-bg2 text-thunder dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-marigold dark:focus:ring-dark-accent transition-all"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-marigold dark:bg-dark-accent hover:bg-marigold/80 dark:hover:bg-dark-accent/80 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>

      {/* SMS Character Limit */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-dallas dark:text-dark-text2">
        <span>Each message is limited to 160 characters to work on all phones.</span>
      </div>
    </div>
  );
}