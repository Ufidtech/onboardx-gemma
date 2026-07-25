export default function ChatHeader({ lastSource }) {
  const isFallback = lastSource === "fallback" || lastSource === "gemini_error";
  const modeLabel = isFallback ? "fallback mode" : "ai mode";

  return (
    <div className="bg-[#008069] text-white p-4 flex items-center shadow-md z-10">
      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center font-bold text-gray-500">
        AI
      </div>
      <div>
        <h1 className="font-semibold text-lg leading-tight">OnboardX Agent</h1>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-green-100">online</span>
          <span
            className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
              isFallback ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {modeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
