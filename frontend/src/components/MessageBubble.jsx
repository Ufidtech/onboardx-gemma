function renderBold(text, keyPrefix) {
  const boldPattern = /\*\*([\s\S]+?)\*\*/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }
    segments.push(
      <strong key={`${keyPrefix}-b-${match.index}`}>{match[1]}</strong>,
    );
    lastIndex = boldPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments;
}

function renderContent(content) {
  const text = String(content ?? "");
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlPattern);

  return parts.map((part, index) => {
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 underline break-all"
        >
          {part}
        </a>
      );
    }

    return (
      <span key={`${part}-${index}`} className="whitespace-pre-wrap">
        {renderBold(part, index)}
      </span>
    );
  });
}

function renderActions(actions) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return null;
  }

  return (
    <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc list-inside">
      {actions.map((action) => (
        <li key={action}>{action}</li>
      ))}
    </ul>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const hasMentorLink = Boolean(message.mentorLink);
  const hasStarterPack = Boolean(message.starterPackUrl);
  const hasAlternative = Boolean(message.alternative && message.alternative.mentor);
  const sourceLabel =
    message.source === "fallback"
      ? "Fallback"
      : message.source === "gemini"
        ? "AI"
        : null;
  const sourceClassName =
    message.source === "fallback"
      ? "bg-amber-100 text-amber-800"
      : "bg-emerald-100 text-emerald-800";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg shadow-sm text-sm break-words ${
          isUser
            ? "bg-[#d9fdd3] text-black rounded-tr-none"
            : "bg-white text-black rounded-tl-none"
        }`}
      >
        {!isUser && sourceLabel && (
          <div
            className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${sourceClassName}`}
          >
            {sourceLabel}
          </div>
        )}
        {renderContent(message.content)}
        {!isUser && hasMentorLink && (
          <div className="mt-3 rounded-md border border-[#cfd8dc] bg-[#f8fbfc] p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Mentor link
            </div>
            <a
              href={message.mentorLink}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-medium text-blue-700 underline break-all"
            >
              {message.mentor || message.track || message.mentorLink}
            </a>
          </div>
        )}
        {!isUser && hasAlternative && (
          <div className="mt-3 rounded-md border border-[#cfd8dc] bg-[#f8fbfc] p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Open capacity elsewhere
            </div>
            <a
              href={message.alternative.link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block font-medium text-blue-700 underline break-all"
            >
              {message.alternative.mentor} — {message.alternative.track}
            </a>
            <div className="mt-1 text-xs text-gray-500">
              {message.alternative.seatsAvailable} seat
              {message.alternative.seatsAvailable === 1 ? "" : "s"} available
            </div>
          </div>
        )}
        {!isUser && hasStarterPack && (
          <div className="mt-3 rounded-md border border-[#cfd8dc] bg-[#f8fbfc] p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Self-guided starter pack (4 weeks)
            </div>
            <a
              href={message.starterPackUrl}
              download
              className="mt-1 inline-flex items-center gap-1 font-medium text-blue-700 underline break-all"
            >
              Download {message.track ? `${message.track} ` : ""}starter pack
            </a>
          </div>
        )}
        {!isUser && renderActions(message.week1Actions)}
      </div>
    </div>
  );
}
