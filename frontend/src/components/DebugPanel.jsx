import { useState } from "react";

export default function DebugPanel({ activeModel, lastSource, lastReason, usage, decision }) {
  const sourceLabel = lastSource || "unknown";
  const reasonLabel = lastReason || "unknown";
  const [collapsed, setCollapsed] = useState(false);
  const formatNumber = (value) =>
    typeof value === "number" ? value.toLocaleString() : "—";

  return (
    <div className="border-t border-[#d7dcd6] bg-[#f4f6f3] px-3 py-2 text-[11px] text-gray-600">
      <div className="flex items-center justify-between">
        <span className="font-semibold uppercase tracking-wide text-gray-500">
          Debug
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="rounded px-1.5 py-0.5 text-gray-500 hover:bg-[#e6eae4] hover:text-gray-700"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand debug panel" : "Minimize debug panel"}
          title={collapsed ? "Expand" : "Minimize"}
        >
          {collapsed ? "▸" : "▾"}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-3">
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
          {usage && (
            <div className="mt-1 grid grid-cols-1 gap-1 border-t border-[#e2e6e0] pt-1 sm:grid-cols-3">
              <span>
                this request:{" "}
                <strong className="text-gray-700">
                  {formatNumber(usage.requestTokens)} tok
                </strong>{" "}
                ({formatNumber(usage.requestInputTokens)} in /{" "}
                {formatNumber(usage.requestOutputTokens)} out)
              </span>
              <span>
                total used:{" "}
                <strong className="text-gray-700">
                  {formatNumber(usage.totalTokensUsed)} tok
                </strong>
              </span>
              <span>
                tokens left:{" "}
                <strong className="text-gray-700">
                  {formatNumber(usage.tokensLeft)}
                </strong>
              </span>
            </div>
          )}
          {decision && decision.track && (
            <div className="mt-1 border-t border-[#e2e6e0] pt-1">
              <span>
                Gemma decided:{" "}
                <strong className="text-gray-700">
                  {decision.track} / {decision.level}
                </strong>{" "}
                <span className="text-gray-500">({decision.decidedBy})</span>
              </span>
              {decision.reasoning && (
                <div className="mt-0.5 italic text-gray-500">
                  “{decision.reasoning}”
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
