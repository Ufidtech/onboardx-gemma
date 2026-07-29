export default function ChatHeader({ lastSource }) {
  const isFallback = lastSource === "fallback" || lastSource === "gemini_error";
  const modeLabel = isFallback ? "fallback mode" : "ai mode";

  return (
    <div className="bg-[#008069] text-white px-3 py-3 sm:p-4 flex items-center gap-3 shadow-md z-10">
      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm sm:text-base shrink-0">
        AI
      </div>
      <div className="min-w-0">
        <h1 className="font-semibold text-base sm:text-lg leading-tight truncate">
          OnboardX Agent
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs mt-1">
          <span className="text-green-100">online</span>
          <span
            className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
              isFallback
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {modeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
