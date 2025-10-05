"use client";

import { useEffect, useState } from "react";
import { SendHorizonal, Bot, User } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { authClient } from "@/lib/betterauth-client";

export default function AIChat() {
  // Use the session hook to check if the user is logged in
  const { data: session, isPending } = authClient.useSession();
  
  // State for the token we will send to the Go backend
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hi, I'm BetterForm AI. Ask me to generate a form (React) using JSON!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If the user is logged in, fetch a JWT for our Go API
    if (session) {
      const getApiToken = async () => {
        const { data } = await authClient.token(); // Fetch from /api/auth/token
        if (data?.token) {
          setApiToken(data.token);
        }
      };
      getApiToken();
    } else {
      // If the user logs out, clear the token
      setApiToken(null);
    }
  }, [session]); // Dependency array ensures this runs when `session` object changes

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check for the API token before sending
    if (!apiToken) {
      setMessages(prev => [...prev, { role: "bot", text: "❌ Error: You must be logged in to use the chat." }]);
      return;
    }

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // ADD THE BEARER TOKEN HERE
          "Authorization": `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages([
          ...newMessages,
          { role: "bot", text: `❌ Error: ${data.error || "Something went wrong"}` },
        ]);
      } else {
        // Assuming the Go backend now returns the JSON directly
        const formattedJson = JSON.stringify(data, null, 2);
        setMessages([
          ...newMessages,
          { role: "bot", text: "```json\n" + formattedJson + "\n```" },
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
