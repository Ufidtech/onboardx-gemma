export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm ${
          isUser
            ? "bg-[#d9fdd3] text-black rounded-tr-none"
            : "bg-white text-black rounded-tl-none"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
