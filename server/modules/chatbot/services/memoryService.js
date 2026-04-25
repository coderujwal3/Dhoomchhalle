const DEFAULT_SESSION_ID = "guest";
const MAX_MESSAGES_PER_SESSION = 24;
const MAX_SESSIONS = 500;

const sessions = new Map();

function normalizeSessionId(sessionId) {
  return String(sessionId || DEFAULT_SESSION_ID)
    .trim()
    .slice(0, 100) || DEFAULT_SESSION_ID;
}

function createSession() {
  return {
    preferences: {},
    messages: [],
    pinnedMessages: [],
    feedback: [],
    updatedAt: new Date(),
  };
}

function pruneSessions() {
  if (sessions.size <= MAX_SESSIONS) return;

  const sorted = [...sessions.entries()].sort(
    (a, b) => a[1].updatedAt.getTime() - b[1].updatedAt.getTime()
  );

  for (const [sessionId] of sorted.slice(0, sessions.size - MAX_SESSIONS)) {
    sessions.delete(sessionId);
  }
}

function getSession(sessionId) {
  const safeSessionId = normalizeSessionId(sessionId);
  if (!sessions.has(safeSessionId)) {
    sessions.set(safeSessionId, createSession());
    pruneSessions();
  }

  const session = sessions.get(safeSessionId);
  session.updatedAt = new Date();
  return session;
}

function updateMemory(sessionId, message) {
  const session = getSession(sessionId);
  const msg = String(message || "").toLowerCase();

  if (/\b(cheap|budget|low cost|affordable)\b/.test(msg)) {
    session.preferences.budget = "low";
  }
  if (/\b(luxury|premium|5 star|five star)\b/.test(msg)) {
    session.preferences.budget = "high";
  }
  if (/\b(solo|alone)\b/.test(msg)) {
    session.preferences.travelType = "solo";
  }
  if (/\b(family|kids|children)\b/.test(msg)) {
    session.preferences.travelType = "family";
  }
  if (/\b(couple|partner|honeymoon)\b/.test(msg)) {
    session.preferences.travelType = "couple";
  }
  if (/\b(hindi|hinglish)\b/.test(msg)) {
    session.preferences.lang = "hi";
  }
  if (/\b(english)\b/.test(msg)) {
    session.preferences.lang = "en";
  }
  if (/\b(hotel|stay|room|hostel|guest house|accommodation|lodge|lounge)\b/.test(msg)) {
    session.preferences.pendingTopic = "hotel";
  }
  if (/\b(transport|route|directions|path|bus|train|auto|rickshaw|taxi|cab)\b/.test(msg)) {
    session.preferences.pendingTopic = "transport";
  }
  if (/\b(hostel|dorm)\b/.test(msg)) {
    session.preferences.hotelType = "hostel";
  }
  if (/\b(luxury|premium|5 star|five star)\b/.test(msg)) {
    session.preferences.hotelType = "luxury";
  }
  if (/\b(mid|standard|comfort|lounge|launge|guest house|lodge)\b/.test(msg)) {
    session.preferences.hotelType = "mid";
  }
  if (/\b(budget|cheap|affordable|low cost)\b/.test(msg)) {
    session.preferences.hotelType = session.preferences.hotelType || "budget";
  }

  const budgetMatch = msg.match(
    /\b(?:budget|under|below|around|upto|up to|max|maximum)\s*(?:inr|rs\.?|₹)?\s*(\d{3,6})\b/i
  );
  if (budgetMatch) {
    session.preferences.hotelBudget = Number(budgetMatch[1]);
  }

  const locationMatch = String(message || "").match(
    /\b(?:near|around|in|at|location)\s+([a-zA-Z\s]+?)(?:\s+(?:hotel|hostel|room|stay|under|below|budget|luxury|mid|standard|please)|[?.!,]|$)/i
  );
  if (locationMatch) {
    session.preferences.preferredLocation = locationMatch[1].trim();
  }

  const destinationMatch = String(message || "").match(
    /\b(?:to|destination|go to|route to|take me to)\s+([a-zA-Z\s]+?)(?:[?.!,]|$)/i
  );
  if (destinationMatch) {
    session.preferences.destination = destinationMatch[1].trim();
  }

  return getMemory(sessionId);
}

function appendMessage(sessionId, message) {
  const session = getSession(sessionId);
  session.messages.push({
    role: message.role,
    content: String(message.content || "").slice(0, 2000),
    createdAt: new Date(),
  });

  if (session.messages.length > MAX_MESSAGES_PER_SESSION) {
    session.messages.splice(0, session.messages.length - MAX_MESSAGES_PER_SESSION);
  }
}

function getMemory(sessionId) {
  const session = getSession(sessionId);
  return {
    ...session.preferences,
    recentMessages: session.messages.slice(-8),
    pinnedMessages: session.pinnedMessages.slice(-5),
  };
}

function clearMemory(sessionId) {
  sessions.delete(normalizeSessionId(sessionId));
}

function pinMessage(sessionId, message) {
  const session = getSession(sessionId);
  const content = String(message || "").trim();
  if (!content) return session.pinnedMessages;

  session.pinnedMessages.push({
    content: content.slice(0, 1000),
    createdAt: new Date(),
  });

  if (session.pinnedMessages.length > 10) {
    session.pinnedMessages.shift();
  }

  return session.pinnedMessages;
}

function addFeedback(sessionId, feedback) {
  const session = getSession(sessionId);
  const rating = feedback.rating === "down" ? "down" : "up";

  session.feedback.push({
    messageId: String(feedback.messageId || ""),
    rating,
    correction: String(feedback.correction || "").slice(0, 1000),
    createdAt: new Date(),
  });

  if (session.feedback.length > 100) {
    session.feedback.shift();
  }

  return { stored: true };
}

module.exports = {
  appendMessage,
  updateMemory,
  getMemory,
  clearMemory,
  pinMessage,
  addFeedback,
  normalizeSessionId,
};
