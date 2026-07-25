import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, isTyping }) {
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    const endOfMessagesElement = endOfMessagesRef.current;

    if (typeof endOfMessagesElement?.scrollIntoView === "function") {
      endOfMessagesElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white text-black p-3 rounded-lg rounded-tl-none max-w-[80%] shadow-sm text-sm italic text-gray-500">
            typing...
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
