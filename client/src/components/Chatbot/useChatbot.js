import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dhoomchhalle_chat";
const SESSION_KEY = "dhoomchhalle_chat_session";
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api/v1"
).replace(/\/$/, "");

function createId(prefix = "msg") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSessionId() {
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) return saved;

  const sessionId = createId("session");
  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

function readStoredMessages() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    const timer = setTimeout(() => resolve(null), 2500);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timer);
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 300000 }
    );
  });
}

function historyFromMessages(messages) {
  return messages
    .filter((message) => message.type === "text" && message.text)
    .slice(-10)
    .map((message) => ({
      role: message.sender === "bot" ? "assistant" : "user",
      content: message.text,
    }));
}

function parseSseFrame(frame) {
  const event = frame.match(/^event:\s*(.+)$/m)?.[1]?.trim() || "message";
  const data = frame
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.replace(/^data:\s*/, ""))
    .join("\n");

  return {
    event,
    data: data ? JSON.parse(data) : {},
  };
}

export function useChatbot() {
  const [messages, setMessages] = useState(() => readStoredMessages());
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [lang, setLang] = useState("auto");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const abortRef = useRef(null);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!open || messages.length > 0) return;

    setMessages([
      {
        id: createId(),
        sender: "bot",
        type: "text",
        text: "Hi, I am Visu. Ask me about hotels, fares, routes, timings, food, or safety in Varanasi.",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [messages.length, open]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus("idle");
  }, []);

  const clearChat = useCallback(async () => {
    stop();
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);

    try {
      await fetch(`${API_BASE_URL}/chatbot/memory/clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      });
    } catch {
      // Local clear should still work when the backend is unavailable.
    }
  }, [stop]);

  const updateMessage = useCallback((id, updater) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, ...updater(message) } : message
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (messageOverride) => {
      const messageText = String(messageOverride ?? input).trim();
      if (!messageText || status === "streaming") return;

      const userMessage = {
        id: createId(),
        sender: "user",
        type: "text",
        text: messageText,
        timestamp: new Date().toISOString(),
      };
      const botMessage = {
        id: createId(),
        sender: "bot",
        type: "text",
        text: "",
        sources: [],
        streaming: true,
        timestamp: new Date().toISOString(),
      };

      const nextMessages = [...messages, userMessage, botMessage];
      setMessages(nextMessages);
      setInput("");
      setError(null);
      setStatus("streaming");
      setLastUserMessage(messageText);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const location = await getLocation();
        const response = await fetch(`${API_BASE_URL}/chatbot/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: messageText,
            location,
            lang,
            sessionId: sessionIdRef.current,
            history: historyFromMessages(messages),
          }),
        });

        if (!response.ok || !response.body) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error?.message || "Failed to send message");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split("\n\n");
          buffer = frames.pop() || "";

          for (const frame of frames) {
            if (!frame.trim()) continue;
            const parsed = parseSseFrame(frame);

            if (parsed.event === "metadata") {
              updateMessage(botMessage.id, () => ({
                sources: parsed.data.sources || [],
                metadata: parsed.data,
              }));
            }

            if (parsed.event === "token") {
              updateMessage(botMessage.id, (current) => ({
                text: `${current.text || ""}${parsed.data.token || ""}`,
              }));
            }

            if (parsed.event === "message") {
              updateMessage(botMessage.id, () => ({
                ...parsed.data.message,
                id: botMessage.id,
                sender: "bot",
                streaming: false,
                timestamp: new Date().toISOString(),
              }));
            }

            if (parsed.event === "done") {
              updateMessage(botMessage.id, () => ({
                streaming: false,
                sources: parsed.data.sources || [],
              }));
            }

            if (parsed.event === "error") {
              throw new Error(parsed.data.error?.message || "Chatbot error");
            }
          }
        }

        updateMessage(botMessage.id, () => ({ streaming: false }));
        setStatus("idle");
      } catch (err) {
        if (err.name === "AbortError") {
          updateMessage(botMessage.id, (current) => ({
            text: current.text || "Stopped.",
            streaming: false,
          }));
          setStatus("idle");
          return;
        }

        setError(err.message || "Failed to send message");
        updateMessage(botMessage.id, () => ({
          text: "Sorry, I could not complete that. Please try again.",
          streaming: false,
        }));
        setStatus("error");
      } finally {
        abortRef.current = null;
      }
    },
    [input, lang, messages, status, updateMessage]
  );

  const retry = useCallback(() => {
    if (lastUserMessage) {
      setStatus("idle");
      sendMessage(lastUserMessage);
    }
  }, [lastUserMessage, sendMessage]);

  const copyMessage = useCallback(async (text) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
  }, []);

  const sendFeedback = useCallback(async (messageId, rating) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId ? { ...message, feedback: rating } : message
      )
    );

    try {
      await fetch(`${API_BASE_URL}/chatbot/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          messageId,
          rating,
        }),
      });
    } catch {
      // Feedback is optimistic; keep the UI responsive if storage fails.
    }
  }, []);

  const startVoiceInput = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = () => {
      setError("Voice input failed. Please type your message.");
    };
    recognition.start();
  }, [lang]);

  return {
    messages,
    input,
    open,
    status,
    error,
    lang,
    lastUserMessage,
    setInput,
    setOpen,
    setLang,
    sendMessage,
    stop,
    retry,
    clearChat,
    copyMessage,
    sendFeedback,
    startVoiceInput,
  };
}
