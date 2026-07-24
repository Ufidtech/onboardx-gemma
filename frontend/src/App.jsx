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

  const handleSendMessage = async (content) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsTyping(true);

    /* 
    // UNCOMMENT THIS WHEN ZONECTTECT'S BACKEND IS RUNNING
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'agent', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', content: "Connection error." }]);
    } finally {
      setIsTyping(false);
    }
    */

    // TEMPORARY SIMULATION (Delete when backend is ready)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Simulated response. Waiting for backend!",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-center">
      <div className="w-full max-w-md h-\[100dvh\] sm:h-[90vh] bg-[#efeae2] sm:rounded-lg shadow-xl flex flex-col overflow-hidden relative">
        <ChatHeader />
        <MessageList messages={messages} isTyping={isTyping} />
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
