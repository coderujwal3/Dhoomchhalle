const { buildMessages } = require("./promptBuilder");
const { ChatbotError } = require("./chatbotError");
const { filterAssistantReply } = require("./safetyService");

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEPRECATED_MODEL_REPLACEMENTS = {
  "llama3-70b-8192": DEFAULT_GROQ_MODEL,
  "llama3-8b-8192": "llama-3.1-8b-instant",
};

function resolveModel(model) {
  const configuredModel = String(model || "").trim();
  return DEPRECATED_MODEL_REPLACEMENTS[configuredModel] || configuredModel || DEFAULT_GROQ_MODEL;
}

function getConfig() {
  return {
    apiKey: process.env.GROQ_API_KEY || process.env.API_KEY,
    model: resolveModel(process.env.CHATBOT_MODEL),
    timeoutMs: Number(process.env.CHATBOT_TIMEOUT_MS || 12000),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createTimeoutSignal(timeoutMs, parentSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort();
    } else {
      parentSignal.addEventListener("abort", () => controller.abort(), {
        once: true,
      });
    }
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

async function postToProvider(payload, { signal, timeoutMs }) {
  const { apiKey } = getConfig();
  const timeout = createTimeoutSignal(timeoutMs, signal);

  try {
    return await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: timeout.signal,
    });
  } catch (error) {
    if (timeout.signal.aborted) {
      throw new ChatbotError(
        "CHATBOT_PROVIDER_TIMEOUT",
        "The AI provider took too long to respond.",
        504
      );
    }
    throw error;
  } finally {
    timeout.clear();
  }
}

async function requestWithRetry(payload, options) {
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await postToProvider(payload, options);
      if (response.ok || !RETRYABLE_STATUSES.has(response.status) || attempt === 1) {
        return response;
      }
      await sleep(250 * (attempt + 1));
    } catch (error) {
      lastError = error;
      if (error.code === "CHATBOT_PROVIDER_TIMEOUT" || attempt === 1) {
        throw error;
      }
      await sleep(250 * (attempt + 1));
    }
  }

  throw lastError;
}

function fallbackReply({ context }) {
  if (context?.summary) {
    return filterAssistantReply(
      `I can help with that using Dhoomchhalle data:\n${context.summary}`
    );
  }

  return "I can help with hotels, fares, transport timings, routes, places, food, and safety tips. Ask me a route or travel need and I will guide you.";
}

function buildPayload({ message, memory, location, lang, history, context, stream }) {
  const { model } = getConfig();
  return {
    model,
    temperature: 0.4,
    max_tokens: 700,
    stream,
    messages: buildMessages({
      message,
      memory,
      location,
      lang,
      history,
      context,
    }),
  };
}

async function getAIResponse({
  message,
  memory,
  location,
  lang = "auto",
  history = [],
  context = null,
  signal,
}) {
  const { apiKey, timeoutMs } = getConfig();

  if (!apiKey) {
    return fallbackReply({ context });
  }

  const response = await requestWithRetry(
    buildPayload({ message, memory, location, lang, history, context, stream: false }),
    { signal, timeoutMs }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new ChatbotError(
      "CHATBOT_PROVIDER_ERROR",
      data.error?.message || "The AI provider returned an error.",
      response.status || 502
    );
  }

  return filterAssistantReply(
    data.choices?.[0]?.message?.content || fallbackReply({ context })
  );
}

function parseSseFrame(frame) {
  const lines = frame.split("\n");
  const dataLines = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s*/, ""));

  return dataLines.join("\n");
}

async function streamAIResponse({
  message,
  memory,
  location,
  lang = "auto",
  history = [],
  context = null,
  signal,
  onToken,
}) {
  const { apiKey, timeoutMs } = getConfig();

  if (!apiKey) {
    const reply = fallbackReply({ context });
    onToken(reply);
    return reply;
  }

  const response = await requestWithRetry(
    buildPayload({ message, memory, location, lang, history, context, stream: true }),
    { signal, timeoutMs }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ChatbotError(
      "CHATBOT_PROVIDER_ERROR",
      data.error?.message || "The AI provider returned an error.",
      response.status || 502
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullReply = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() || "";

    for (const frame of frames) {
      const dataText = parseSseFrame(frame);
      if (!dataText || dataText === "[DONE]") continue;

      const parsed = JSON.parse(dataText);
      const token = parsed.choices?.[0]?.delta?.content || "";
      if (token) {
        fullReply += token;
        onToken(token);
      }
    }
  }

  return filterAssistantReply(fullReply || fallbackReply({ context }));
}

module.exports = {
  getAIResponse,
  streamAIResponse,
};
