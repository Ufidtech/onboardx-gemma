import { useEffect, useState } from "react";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import DebugPanel from "./components/DebugPanel";
import { inferLocalIntent } from "./intent";

export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // A stable id for this browser tab's conversation, so the backend can
  // remember an established track/mentor across messages instead of
  // evaluating every message in total isolation. Generated once and kept
  // in memory only - a page refresh starts a fresh conversation.
  const [sessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const [messages, setMessages] = useState([
    {
      role: "agent",
      content:
        "Hi! I can help you choose a learning track, find mentor guidance, or contribute to the community.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [statusText, setStatusText] = useState("Ready.");
  const [lastSource, setLastSource] = useState("gemini");
  const [lastReason, setLastReason] = useState("boot");
  const [activeModel, setActiveModel] = useState("loading...");
  const [usage, setUsage] = useState(null);
  const [decision, setDecision] = useState(null);
  const [sessionIntent, setSessionIntent] = useState("unknown");

  useEffect(() => {
    let ignore = false;
    async function loadHealth() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/health`);
        if (!response.ok) {
          throw new Error(`Health check failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!ignore) {
          setActiveModel(data.model || "unknown");
        }
      } catch {
        if (!ignore) {
          setActiveModel("unreachable");
        }
      }
    }
    loadHealth();
    return () => {
      ignore = true;
    };
  }, [apiBaseUrl]);

  const handleSendMessage = async (content) => {
    const localIntent = inferLocalIntent(content);

    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsTyping(true);

    if (localIntent === "contributor") {
      setStatusText("Preparing contributor guidance...");
    } else if (localIntent === "learner") {
      setStatusText("Checking mentor availability...");
    } else if (localIntent === "greeting") {
      setStatusText("Preparing a quick reply...");
    } else if (localIntent === "thanks") {
      setStatusText("Checking your conversation context...");
    } else if (localIntent === "clarification") {
      setStatusText("Preparing a short clarification...");
    } else {
      setStatusText("Thinking...");
    }

    const buildAgentMessage = (data) => ({
      role: "agent",
      content: data.reply,
      status: data.status,
      statusMessage: data.statusMessage,
      source: data.source,
      mentor: data.mentor,
      mentorLink: data.mentorLink,
      track: data.track,
      week1Actions: data.week1Actions,
      estimatedWeeks: data.estimatedWeeks,
      alternative: data.alternative,
      trackOptions: data.trackOptions,
      starterPackUrl: data.starterPackUrl
        ? `${apiBaseUrl}${data.starterPackUrl}`
        : undefined,
    });

    const replaceLastAgent = (list, next) => {
      const copy = list.slice();
      copy[copy.length - 1] = next;
      return copy;
    };

    let streamStarted = false;

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId }),
      });

      if (!response.ok || !response.body) {
        throw new Error(
          `Backend request failed with status ${response.status}`,
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { value, done } = await reader.read();
        streamDone = done;
        buffer += decoder.decode(value || new Uint8Array(), { stream: true });

        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";

        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith("data:")) continue;

          const event = JSON.parse(line.slice(5).trim());

          if (event.type === "delta") {
            if (!streamStarted) {
              streamStarted = true;
              setIsTyping(false);
              setStatusText(
                localIntent === "contributor"
                  ? "Compiling contributor guidance..."
                  : localIntent === "learner"
                    ? "Preparing your response..."
                    : localIntent === "clarification"
                      ? "Preparing a clarification..."
                      : "Preparing your response...",
              );
              setMessages((prev) => [
                ...prev,
                { role: "agent", content: event.text },
              ]);
            } else {
              setMessages((prev) =>
                replaceLastAgent(prev, {
                  ...prev[prev.length - 1],
                  content: prev[prev.length - 1].content + event.text,
                }),
              );
            }
          } else if (event.type === "done") {
            const data = event.payload || {};
            setLastSource(data.source || "gemini");
            setLastReason(data.reason || "unknown");
            setUsage(data.usage || null);
            setDecision(data.decision || null);
            setSessionIntent((currentIntent) => {
              if (data.intent === "contributor") return "contributor";
              if (data.track || data.intent === "learner") return "learner";
              if (["greeting", "thanks", "clarification"].includes(data.intent)) {
                return currentIntent;
              }
              return data.intent || "unknown";
            });

            setMessages((prev) =>
              streamStarted
                ? replaceLastAgent(prev, buildAgentMessage(data))
                : [...prev, buildAgentMessage(data)],
            );

            if (data.statusMessage) {
              setStatusText(data.statusMessage);
            }
          }
        }
      }
    } catch {
      setStatusText("Building a safe fallback response...");
      setLastSource("fallback");
      setLastReason("request_failed");
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Connection error. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
      setStatusText("");
    }
  };

  const handleSelectTrack = (track) => {
    handleSendMessage(`I want to learn ${track}`);
  };

  const helperText =
    sessionIntent === "contributor"
      ? "Contributor mode: tell me how you want to help the community."
      : sessionIntent === "learner"
        ? "Learning mode: share what you want to learn and I’ll help match you."
        : "Tell me what you want to learn or how you want to contribute.";

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center items-stretch sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-md min-h-[100dvh] sm:h-[90vh] bg-[#efeae2] sm:rounded-lg shadow-xl flex flex-col overflow-hidden relative">
        <ChatHeader lastSource={lastSource} />
        <MessageList
          messages={messages}
          isTyping={isTyping}
          statusText={statusText}
          onSelectTrack={handleSelectTrack}
        />
        {import.meta.env.DEV && (
          <DebugPanel
            activeModel={activeModel}
            lastSource={lastSource}
            lastReason={lastReason}
            usage={usage}
            decision={decision}
          />
        )}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
          helperText={helperText}
        />
      </div>
    </div>
  );
}
