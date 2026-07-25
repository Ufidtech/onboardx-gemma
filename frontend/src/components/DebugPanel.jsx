export default function DebugPanel({ activeModel, lastSource, lastReason }) {
  const sourceLabel = lastSource || "unknown";
  const reasonLabel = lastReason || "unknown";

  return (
    <div className="border-t border-[#d7dcd6] bg-[#f4f6f3] px-3 py-2 text-[11px] text-gray-600">
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
        <span>
          model: <strong className="text-gray-700">{activeModel}</strong>
        </span>
        <span>
          source: <strong className="text-gray-700">{sourceLabel}</strong>
        </span>
        <span>
          reason: <strong className="text-gray-700">{reasonLabel}</strong>
        </span>
      </div>
    </div>
  );
}
