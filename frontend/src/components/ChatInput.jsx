import { useState } from "react";

export default function ChatInput({ onSendMessage, disabled, helperText }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#f0f2f5] px-3 py-3 sm:p-3 flex flex-col gap-2 border-t border-gray-200"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Try: frontend, backend, AI, or just describe what you want"
          disabled={disabled}
          className="flex-1 min-w-0 py-2.5 px-4 rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#008069] disabled:bg-gray-200 text-sm sm:text-base"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="bg-[#008069] text-white p-2.5 rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50 transition-opacity shrink-0"
        >
          ➤
        </button>
      </div>
      {helperText && (
        <div className="text-xs text-gray-600 px-1 leading-snug">
          {helperText}
        </div>
      )}
    </form>
  );
}
