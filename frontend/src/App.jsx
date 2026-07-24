import { useState } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content:
        "Hi! Tell me a bit about what you want to learn, and I'll match you with the right mentor.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (content) => {
    // 1. Instantly show the user's message
    setMessages((prev) => [...prev, { role: "user", content }]);

    // 2. Trigger the "typing..." animation
    setIsTyping(true);

    // 3. Simulate backend latency for the UI test
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content:
            "Got it! This is a simulated frontend response. Once the backend is connected, Gemma 4 will route you here.",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md h-[100dvh] sm:h-[90vh] bg-[#efeae2] sm:rounded-lg shadow-xl flex flex-col overflow-hidden relative">
        <ChatHeader />
        <MessageList messages={messages} isTyping={isTyping} />
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
