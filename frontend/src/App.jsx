import { useEffect, useState } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import DebugPanel from "./components/DebugPanel";

export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content:
        "Hi! Tell me a bit about what you want to learn, and I'll match you with the right mentor.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSource, setLastSource] = useState("gemini");
  const [lastReason, setLastReason] = useState("boot");
  const [activeModel, setActiveModel] = useState("loading...");

  useEffect(() => {
    let ignore = false;

    async function loadHealth() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/health`);

        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!ignore) {
          setActiveModel(data.model || "unknown");
        }
      } catch {
        if (!ignore) {
          setActiveModel("unreachable");
        }
      }
    }

    loadHealth();

    return () => {
      ignore = true;
    };
  }, [apiBaseUrl]);

  const handleSendMessage = async (content) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error(`Backend request failed with status ${response.status}`);
      }

      const data = await response.json();
      setLastSource(data.source || "gemini");
      setLastReason(data.reason || "unknown");
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.reply,
          status: data.status,
          source: data.source,
          mentor: data.mentor,
          mentorLink: data.mentorLink,
          track: data.track,
          week1Actions: data.week1Actions,
          starterPackUrl: data.starterPackUrl
            ? `${apiBaseUrl}${data.starterPackUrl}`
            : undefined,
        },
      ]);
    } catch {
      setLastSource("fallback");
      setLastReason("request_failed");
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Connection error. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md h-[100dvh] sm:h-[90vh] bg-[#efeae2] sm:rounded-lg shadow-xl flex flex-col overflow-hidden relative">
        <ChatHeader lastSource={lastSource} />
        <MessageList messages={messages} isTyping={isTyping} />
        {import.meta.env.DEV && (
          <DebugPanel
            activeModel={activeModel}
            lastSource={lastSource}
            lastReason={lastReason}
          />
        )}
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
