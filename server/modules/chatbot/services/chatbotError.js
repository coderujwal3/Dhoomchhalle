class ChatbotError extends Error {
  constructor(code, message, statusCode = 500, details = null) {
    super(message);
    this.name = "ChatbotError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function toErrorPayload(error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || "CHATBOT_INTERNAL_ERROR";

  return {
    error: {
      code,
      message:
        statusCode >= 500
          ? "Visu is having trouble right now. Please try again."
          : error.message,
      details: error.details || undefined,
    },
    type: "text",
    reply:
      statusCode >= 500
        ? "Visu is having trouble right now. Please try again."
        : error.message,
  };
}

module.exports = { ChatbotError, toErrorPayload };
