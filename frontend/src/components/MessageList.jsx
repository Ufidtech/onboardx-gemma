import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  isTyping,
  onSelectTrack,
}) {
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    const endOfMessagesElement = endOfMessagesRef.current;

    if (typeof endOfMessagesElement?.scrollIntoView === "function") {
      endOfMessagesElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 sm:p-4 space-y-3 sm:space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg}
          onSelectTrack={onSelectTrack}
          disabled={isTyping}
        />
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white text-black px-3 py-2 rounded-lg rounded-tl-none max-w-[80%] shadow-sm text-sm italic text-gray-500">
            Thinking...
          </div>
        </div>
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
}
