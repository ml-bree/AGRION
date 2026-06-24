import type { AIChatBlock, ChatMessage } from "./types";
import { useState } from "react";
import { 
  Send, 
  MessageCircle, 
  Sparkles,
  User,
  Bot,
  Lightbulb
} from "lucide-react";

interface Props {
  block: AIChatBlock;
}

export function AIChatInterface({ block }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(block.messages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "Based on NiMet data, rains will be late in Kano this season. Delay planting by 2 weeks and use SAMMAZ 15 variety. Save ₦2,000 on your CashCard for input purchase." 
      }]);
      setIsTyping(false);
    }, 800);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => {
      const newMessages: ChatMessage[] = [...messages, { role: "user", content: suggestion }];
      setMessages(newMessages);
      setInput("");
      setIsTyping(true);
      
      setTimeout(() => {
        setMessages([...newMessages, { 
          role: "assistant", 
          content: "Based on NiMet data, rains will be late in Kano this season. Delay planting by 2 weeks and use SAMMAZ 15 variety. Save ₦2,000 on your CashCard for input purchase." 
        }]);
        setIsTyping(false);
      }, 800);
    }, 300);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-harvest" />
        <div>
          <h3 className="text-lg font-semibold text-soil">AI Chat Assistant</h3>
          <p className="text-sm text-gray-500">Ask about planting, weather, or finance</p>
        </div>
        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Online
        </span>
      </div>
      
      <div className="flex-1 p-4 max-h-80 overflow-y-auto space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-gray-700' : 'bg-harvest'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-harvest text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-harvest flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-harvest/50"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-harvest text-white rounded-lg text-sm font-medium hover:bg-harvest/80 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {block.suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs transition-colors flex items-center gap-1"
              onClick={() => handleSuggestion(suggestion)}
            >
              <Lightbulb className="w-3 h-3" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}