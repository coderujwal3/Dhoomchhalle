const BLOCKED_PATTERNS = [
  /\bignore (all|previous|prior) (instructions|rules|system)\b/i,
  /\breveal (your )?(system prompt|developer message|hidden prompt|secrets?)\b/i,
  /\b(api[_ -]?key|access token|private key|password)\b/i,
  /\b(jailbreak|dan mode)\b/i,
];

const PROFANITY_PATTERNS = [
  /\bfuck\b/i,
  /\bshit\b/i,
  /\basshole\b/i,
];

function sanitizeUserMessage(message) {
  return String(message || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inspectMessage(message) {
  const sanitized = sanitizeUserMessage(message);

  if (BLOCKED_PATTERNS.some((pattern) => pattern.test(sanitized))) {
    return {
      ok: false,
      code: "CHATBOT_UNSAFE_PROMPT",
      message:
        "I can help with travel planning, fares, hotels, timings, routes, and safety tips, but I cannot reveal hidden instructions or secrets.",
    };
  }

  const containsProfanity = PROFANITY_PATTERNS.some((pattern) =>
    pattern.test(sanitized)
  );

  return {
    ok: true,
    sanitized,
    flags: {
      containsProfanity,
    },
  };
}

function filterAssistantReply(reply) {
  return String(reply || "")
    .replace(/(api[_ -]?key|access token|private key|password)\s*[:=]\s*\S+/gi, "$1: [redacted]")
    .trim();
}

module.exports = {
  inspectMessage,
  sanitizeUserMessage,
  filterAssistantReply,
};
