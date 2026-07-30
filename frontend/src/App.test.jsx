import { describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { inferLocalIntent } from "./intent";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("App chat flow", () => {
  it("sends a user message and renders backend reply", async () => {
    const fetchMock = vi.fn().mockImplementation(async (url) => {
      if (url === "http://localhost:4000/api/health") {
        return {
          ok: true,
          json: async () => ({ ok: true, model: "gemma-4-26b-a4b-it" }),
        };
      }

      const payload = {
        reply: "You’re matched with Alex for Backend.",
        status: "success",
        source: "gemini",
        reason: "tool_call_success_response_stream",
        mentor: "Alex",
        mentorLink: "https://wa.me/fake789",
        track: "Backend",
        estimatedWeeks: 5,
        starterPackUrl: "/api/resources/starter-pack?track=Backend&level=beginner",
        week1Actions: [
          "Set up your environment and verify the starter app runs.",
          "Complete the first guided exercise with mentor feedback.",
          "Share one progress update and one blocker before the next session.",
        ],
      };
      const encoded = new TextEncoder().encode(
        `data: ${JSON.stringify({ type: "done", payload })}\n\n`,
      );
      let delivered = false;

      return {
        ok: true,
        body: {
          getReader: () => ({
            read: async () => {
              if (delivered) return { done: true, value: undefined };
              delivered = true;
              return { done: false, value: encoded };
            },
          }),
        },
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    const input = screen.getByPlaceholderText("Try frontend, backend, or AI");
    const submitButton = screen.getByRole("button", { name: "➤" });

    fireEvent.change(input, { target: { value: "I want backend" } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText("You’re matched with Alex for Backend.")).toBeTruthy());

    expect(screen.getByRole("link", { name: "Alex" }).getAttribute("href")).toBe(
      "https://wa.me/fake789"
    );

    expect(
      screen.getByText("Set up your environment and verify the starter app runs.")
    ).toBeTruthy();

    expect(screen.getByText("Self-guided starter pack (5 weeks)")).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/health"
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/chat/stream",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("uses intent-aware local loading categories", () => {
    expect(inferLocalIntent("hello")).toBe("greeting");
    expect(inferLocalIntent("Hi!")).toBe("greeting");
    expect(inferLocalIntent("thank you")).toBe("thanks");
    expect(inferLocalIntent("Thanks!")).toBe("thanks");
    expect(inferLocalIntent("I want to mentor others and share my experience")).toBe(
      "contributor",
    );
    expect(inferLocalIntent("I want to mentor")).toBe("contributor");
    expect(inferLocalIntent("I'd like to be a mentor")).toBe("contributor");
    expect(inferLocalIntent("okay")).toBe("clarification");
    expect(inferLocalIntent("not sure")).toBe("clarification");
    expect(inferLocalIntent("What is frontend development?")).toBe("unknown");
    expect(inferLocalIntent("What does a frontend mentor do?")).toBe("unknown");
    expect(inferLocalIntent("I want to learn frontend")).toBe("learner");
  });
});
