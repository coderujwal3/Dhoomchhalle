const { validationResult } = require("express-validator");
const { detectIntent } = require("./services/intentService");
const { getAIResponse, streamAIResponse } = require("./services/aiService");
const {
  appendMessage,
  updateMemory,
  getMemory,
  clearMemory,
  pinMessage,
  addFeedback,
  normalizeSessionId,
} = require("./services/memoryService");
const { resolveToolResponse } = require("./services/toolRouter");
const { inspectMessage, filterAssistantReply } = require("./services/safetyService");
const { ChatbotError, toErrorPayload } = require("./services/chatbotError");

function getValidatedBody(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ChatbotError(
      "CHATBOT_INPUT_INVALID",
      "Please send a valid message.",
      422,
      errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }))
    );
  }

  return req.body;
}

function normalizeLocation(location) {
  if (!location || typeof location !== "object") return null;
  const lat = Number(location.lat);
  const lon = Number(location.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

function resolveLang(lang, memory) {
  if (["en", "hi"].includes(lang)) return lang;
  return memory.lang || "auto";
}

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  if (statusCode >= 500) {
    console.error("[Chatbot Error]", error);
  }
  return res.status(statusCode).json(toErrorPayload(error));
}

async function buildChatPayload(req) {
  const body = getValidatedBody(req);
  const safety = inspectMessage(body.message);

  if (!safety.ok) {
    throw new ChatbotError(safety.code, safety.message, 400);
  }

  const sessionId = normalizeSessionId(body.sessionId || req.ip);
  const location = normalizeLocation(body.location);
  const memory = updateMemory(sessionId, safety.sanitized);
  const detectedIntent = detectIntent(safety.sanitized);
  const intent = detectedIntent === "general" && memory.pendingTopic
    ? memory.pendingTopic
    : detectedIntent;
  const lang = resolveLang(body.lang, memory);
  const history = Array.isArray(body.history) ? body.history : memory.recentMessages;
  const toolResult = await resolveToolResponse({
    intent,
    message: safety.sanitized,
    memory,
    location,
  });

  return {
    sessionId,
    message: safety.sanitized,
    location,
    intent,
    memory,
    lang,
    history,
    context: {
      summary: toolResult.summary,
      sources: toolResult.sources,
    },
    directResponse: toolResult.response,
    sources: toolResult.sources,
  };
}

async function handleChat(req, res) {
  try {
    const payload = await buildChatPayload(req);

    appendMessage(payload.sessionId, {
      role: "user",
      content: payload.message,
    });

    if (payload.directResponse) {
      appendMessage(payload.sessionId, {
        role: "assistant",
        content: payload.directResponse.reply,
      });

      return res.json({
        ...payload.directResponse,
        sources: payload.sources,
        metadata: {
          intent: payload.intent,
          sessionId: payload.sessionId,
          grounded: true,
        },
      });
    }

    const reply = await getAIResponse(payload);
    const safeReply = filterAssistantReply(reply);

    appendMessage(payload.sessionId, {
      role: "assistant",
      content: safeReply,
    });

    return res.json({
      type: "text",
      reply: safeReply,
      sources: payload.sources,
      metadata: {
        intent: payload.intent,
        sessionId: payload.sessionId,
        grounded: payload.sources.length > 0,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
}

function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function handleChatStream(req, res) {
  const abortController = new AbortController();
  req.on("aborted", () => abortController.abort());
  res.on("close", () => {
    if (!res.writableEnded) {
      abortController.abort();
    }
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    const payload = await buildChatPayload(req);
    appendMessage(payload.sessionId, {
      role: "user",
      content: payload.message,
    });

    writeSse(res, "metadata", {
      intent: payload.intent,
      sessionId: payload.sessionId,
      sources: payload.sources,
      grounded: payload.sources.length > 0,
    });

    if (payload.directResponse) {
      appendMessage(payload.sessionId, {
        role: "assistant",
        content: payload.directResponse.reply,
      });
      writeSse(res, "message", {
        message: {
          ...payload.directResponse,
          sources: payload.sources,
        },
      });
      writeSse(res, "done", { ok: true });
      return res.end();
    }

    let reply = "";
    await streamAIResponse({
      ...payload,
      signal: abortController.signal,
      onToken: (token) => {
        reply += token;
        writeSse(res, "token", { token });
      },
    });

    const safeReply = filterAssistantReply(reply);
    appendMessage(payload.sessionId, {
      role: "assistant",
      content: safeReply,
    });

    writeSse(res, "done", {
      ok: true,
      reply: safeReply,
      sources: payload.sources,
    });
    return res.end();
  } catch (error) {
    const payload = toErrorPayload(error);
    writeSse(res, "error", payload);
    return res.end();
  }
}

function handleClearMemory(req, res) {
  const sessionId = normalizeSessionId(req.body?.sessionId || req.params.sessionId || req.ip);
  clearMemory(sessionId);
  return res.json({
    ok: true,
    sessionId,
  });
}

function handlePinMessage(req, res) {
  const sessionId = normalizeSessionId(req.body?.sessionId || req.ip);
  const pinnedMessages = pinMessage(sessionId, req.body?.message);
  return res.json({
    ok: true,
    pinnedMessages,
  });
}

function handleFeedback(req, res) {
  try {
    getValidatedBody(req);
    const sessionId = normalizeSessionId(req.body?.sessionId || req.ip);
    const result = addFeedback(sessionId, {
      messageId: req.body.messageId,
      rating: req.body.rating,
      correction: req.body.correction,
    });
    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  handleChat,
  handleChatStream,
  handleClearMemory,
  handlePinMessage,
  handleFeedback,
};
