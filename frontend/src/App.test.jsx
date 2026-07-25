import { describe, expect, it, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

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

      return {
        ok: true,
        json: async () => ({
          reply: "You’re matched with Alex for Backend.",
          status: "success",
          source: "gemini",
          reason: "tool_call_success_response",
          mentor: "Alex",
          mentorLink: "https://wa.me/fake789",
          track: "Backend",
          week1Actions: [
            "Set up your environment and verify the starter app runs.",
            "Complete the first guided exercise with mentor feedback.",
            "Share one progress update and one blocker before the next session.",
          ],
        }),
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    const input = screen.getByPlaceholderText("Type a message...");
    const submitButton = screen.getByRole("button");

    fireEvent.change(input, { target: { value: "I want backend" } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText("You’re matched with Alex for Backend.")).toBeTruthy());

    expect(screen.getByRole("link", { name: "Alex" }).getAttribute("href")).toBe(
      "https://wa.me/fake789"
    );

    expect(
      screen.getByText("Set up your environment and verify the starter app runs.")
    ).toBeTruthy();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/health"
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:4000/api/chat",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});
