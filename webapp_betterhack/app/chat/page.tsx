"use client";

import { useState } from "react";
import { SendHorizonal, Bot, User } from "lucide-react";
import { Navigation } from "@/components/navigation";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi, I'm BetterForm AI. Ask me to generate a form (React) using JSON!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages([
          ...newMessages,
          { role: "bot", text: `❌ Error: ${data.error || "Something went wrong"}` },
        ]);
      } else {
        setMessages([
          ...newMessages,
          { role: "bot", text: data.response || "✅ Response received." },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "bot", text: "⚠️ Server unreachable. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="flex flex-col w-full h-screen bg-black text-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 font-semibold text-lg flex items-center gap-2 text-indigo-400">
          <Bot className="w-5 h-5" /> BetterForm AI Chat
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-black">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "bot" && <Bot className="w-6 h-6 text-white" />}
              <div
                className={`px-4 py-2 rounded-2xl max-w-[70%] break-words ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-900 text-white rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && <User className="w-6 h-6 text-indigo-300" />}
            </div>
          ))}
          {loading && <div className="text-gray-400 text-sm italic">AI is thinking...</div>}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask BetterForm AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-800 rounded-full bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition"
          >
            <SendHorizonal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
