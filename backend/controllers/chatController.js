function createChatController({ chatService }) {
  return async function postChat(req, res) {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ reply: "Please provide a message field in the request body." });
    }

    const result = await chatService.generateReply(message);
    return res.status(result.statusCode).json(result.payload);
  };
}

module.exports = { createChatController };
