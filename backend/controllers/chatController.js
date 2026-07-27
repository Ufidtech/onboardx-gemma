const MAX_HISTORY_TURNS = 12;

function sanitizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (turn) =>
        turn &&
        (turn.role === "user" || turn.role === "agent") &&
        typeof turn.content === "string" &&
        turn.content.trim()
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((turn) => ({ role: turn.role, content: turn.content }));
}

function createChatController({ chatService }) {
  return async function postChat(req, res) {
    const { message, history } = req.body || {};

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ reply: "Please provide a message field in the request body." });
    }

    const result = await chatService.generateReply(
      message,
      sanitizeHistory(history)
    );
    return res.status(result.statusCode).json(result.payload);
  };
}

module.exports = { createChatController };
