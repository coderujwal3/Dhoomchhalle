import {
  Bot,
  Bus,
  Copy,
  Hotel,
  Landmark,
  Languages,
  MapPin,
  MessageCircle,
  Mic,
  RefreshCw,
  RotateCcw,
  Send,
  Shield,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import L from "leaflet";
import { useEffect, useRef } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import "./Chatbot.css";
import { useChatbot } from "./useChatbot";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const suggestions = [
  { label: "Hotels", prompt: "show me budget hotels", Icon: Hotel },
  { label: "Transport", prompt: "transport options from Cantt station to Dashashwamedh Ghat", Icon: Bus },
  { label: "Map", prompt: "show map", Icon: MapPin },
  { label: "Safety", prompt: "safety tips near ghats", Icon: Shield },
  { label: "Food", prompt: "local food recommendations", Icon: Utensils },
  { label: "Places", prompt: "places to visit in Varanasi", Icon: Landmark },
];

function formatDistance(distanceMeters) {
  const km = Number(distanceMeters || 0) / 1000;
  return `${km.toFixed(2)} km`;
}

function formatDuration(durationSeconds) {
  const minutes = Math.round(Number(durationSeconds || 0) / 60);
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return hours > 0 ? `${hours}h ${remaining}m` : `${minutes} min`;
}

function MessageActions({ message, onCopy, onFeedback }) {
  if (message.sender !== "bot" || message.streaming) return null;

  return (
    <div className="message-actions">
      {message.text ? (
        <button type="button" title="Copy answer" onClick={() => onCopy(message.text)}>
          <Copy size={14} />
        </button>
      ) : null}
      <button
        type="button"
        title="Helpful"
        className={message.feedback === "up" ? "is-active" : ""}
        onClick={() => onFeedback(message.id, "up")}
      >
        <ThumbsUp size={14} />
      </button>
      <button
        type="button"
        title="Not helpful"
        className={message.feedback === "down" ? "is-active" : ""}
        onClick={() => onFeedback(message.id, "down")}
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
}

function Sources({ sources = [] }) {
  if (!sources.length) return null;

  return (
    <div className="message-sources" aria-label="Answer sources">
      {sources.slice(0, 3).map((source) => (
        <a key={`${source.label}-${source.href}`} href={source.href} target="_blank" rel="noreferrer">
          {source.label}
        </a>
      ))}
    </div>
  );
}

function TextMessage({ message, onCopy, onFeedback, onAction }) {
  return (
    <div className="message-bubble">
      <div className="message-avatar" aria-hidden="true">
        {message.sender === "bot" ? <Bot size={18} /> : null}
      </div>
      <div className="message-stack">
        <div className="message-content">
          {message.text || (message.streaming ? "Thinking..." : "")}
          {message.streaming ? <span className="stream-cursor" /> : null}
          {message.actions?.length ? (
            <div className="inline-actions">
              {message.actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => onAction(action)}
                >
                  {action}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Sources sources={message.sources} />
        <MessageActions message={message} onCopy={onCopy} onFeedback={onFeedback} />
      </div>
    </div>
  );
}

function LeafletMapMessage({ message, onCopy, onFeedback }) {
  const mapPayload = message.map || {};
  const legacyLocation = message.location
    ? [
        Number(message.location.lat || message.location.latitude),
        Number(message.location.lon || message.location.lng || message.location.longitude),
      ]
    : null;
  const center = mapPayload.center || legacyLocation || [25.3176, 82.9739];
  const markers = mapPayload.markers || [];
  const routes = mapPayload.routes || [];
  const bestRouteId = mapPayload.bestRouteId;

  return (
    <div className="message-bubble">
      <div className="message-avatar" aria-hidden="true">
        <MapPin size={18} />
      </div>
      <div className="message-stack">
        <div className="message-content map-content">
          {message.reply ? <p>{message.reply}</p> : null}
          <div className="chat-leaflet-map">
            <MapContainer center={center} zoom={13} className="chat-leaflet-instance">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {markers.map((marker) => {
                const lat = Number(marker.latitude);
                const lng = Number(marker.longitude);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

                if (marker.type === "start") {
                  return (
                    <CircleMarker
                      key={marker.id || marker.name}
                      center={[lat, lng]}
                      radius={8}
                      pathOptions={{
                        color: "#0f766e",
                        fillColor: "#14b8a6",
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup>{marker.name}</Popup>
                    </CircleMarker>
                  );
                }

                return (
                  <Marker key={marker.id || marker.name} position={[lat, lng]}>
                    <Popup>
                      <strong>{marker.name}</strong>
                      <br />
                      {marker.type ? `${marker.type}` : "marker"}
                      {marker.details ? (
                        <>
                          <br />
                          {marker.details}
                        </>
                      ) : null}
                    </Popup>
                  </Marker>
                );
              })}

              {routes.map((route) => {
                const positions = route.polyline || [];
                if (!positions.length) return null;
                const isBest = route.routeId === bestRouteId || route.isBest;
                return (
                  <Polyline
                    key={route.routeId}
                    positions={positions}
                    pathOptions={{
                      color: isBest ? "#0f766e" : "#64748b",
                      weight: isBest ? 5 : 3,
                      opacity: isBest ? 0.9 : 0.55,
                      dashArray: isBest ? undefined : "8 8",
                    }}
                  />
                );
              })}
            </MapContainer>
          </div>
          {message.summary ? (
            <div className="route-summary">
              {message.summary.distanceMeters ? (
                <span>{formatDistance(message.summary.distanceMeters)}</span>
              ) : null}
              {message.summary.durationSeconds ? (
                <span>{formatDuration(message.summary.durationSeconds)}</span>
              ) : null}
              {message.summary.transport ? <span>{message.summary.transport}</span> : null}
              {message.summary.fare?.totalFare ? (
                <span>INR {Math.round(message.summary.fare.totalFare)}</span>
              ) : null}
            </div>
          ) : null}
        </div>
        <Sources sources={message.sources} />
        <MessageActions message={message} onCopy={onCopy} onFeedback={onFeedback} />
      </div>
    </div>
  );
}

function CardsMessage({ message, onCopy, onFeedback }) {
  const isHotel = message.cardType === "hotel" || (message.data || []).some((item) => item.category);

  return (
    <div className="message-bubble">
      <div className="message-avatar" aria-hidden="true">
        <Hotel size={18} />
      </div>
      <div className="message-stack">
        <div className="message-content cards-content">
          {message.reply ? <p className="cards-title">{message.reply}</p> : null}
          <div className="cards-container">
            {(message.data || []).map((item) => (
              <article key={item.id || item.name} className="hotel-card">
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.location || item.details}</p>
                </div>
                <div className="hotel-card-meta">
                  <span>{item.rankLabel || item.category || item.type}</span>
                  <strong>{item.price}</strong>
                  {isHotel ? <span>{item.rating ? `${item.rating} rating` : "New"}</span> : null}
                  {item.distanceKm ? <span>{item.distanceKm} km</span> : null}
                </div>
                {item.reason ? <p className="card-reason">{item.reason}</p> : null}
              </article>
            ))}
          </div>
        </div>
        <Sources sources={message.sources} />
        <MessageActions message={message} onCopy={onCopy} onFeedback={onFeedback} />
      </div>
    </div>
  );
}

function ChatMessage(props) {
  const { message } = props;

  if (message.type === "map" || message.type === "route") return <LeafletMapMessage {...props} />;
  if (message.type === "cards") return <CardsMessage {...props} />;
  return <TextMessage {...props} />;
}

export default function Chatbot() {
  const {
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
  } = useChatbot();
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, status]);

  const isStreaming = status === "streaming";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="dhoomchhalle-chat-button"
        title={open ? "Close chat" : "Open chat"}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>

      {open ? (
        <section className="dhoomchhalle-chat-window" aria-label="Visu travel assistant">
          <header className="chat-header">
            <div className="chat-title">
              <span className="chat-avatar" aria-hidden="true">
                <Bot size={22} />
              </span>
              <div>
                <h3>Visu</h3>
                <p>{isStreaming ? "Answering with Dhoomchhalle data" : "Travel assistant"}</p>
              </div>
            </div>
            <div className="chat-controls">
              <label className="language-select" title="Response language">
                <Languages size={15} />
                <select value={lang} onChange={(event) => setLang(event.target.value)}>
                  <option value="auto">Auto</option>
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                </select>
              </label>
              <button type="button" onClick={clearChat} title="Clear chat">
                <Trash2 size={16} />
              </button>
            </div>
          </header>

          {error ? (
            <div className="error-banner">
              <span>{error}</span>
              {lastUserMessage ? (
                <button type="button" onClick={retry}>
                  <RefreshCw size={14} />
                  Retry
                </button>
              ) : null}
            </div>
          ) : null}

          <div ref={messagesRef} className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message-group message-${message.sender}`}>
                <ChatMessage
                  message={message}
                  onCopy={copyMessage}
                  onFeedback={sendFeedback}
                  onAction={sendMessage}
                />
              </div>
            ))}
          </div>

          <div className="suggestions-container">
            <div className="suggestion-buttons">
              {suggestions.map(({ label, prompt, Icon }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => sendMessage(prompt)}
                  disabled={isStreaming}
                  title={label}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form
            className="input-container"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about fares, hotels, routes, timings..."
              className="message-input"
              rows="2"
              disabled={isStreaming}
            />
            <div className="input-actions">
              <button type="button" onClick={startVoiceInput} title="Voice input" disabled={isStreaming}>
                <Mic size={17} />
              </button>
              {isStreaming ? (
                <button type="button" onClick={stop} title="Stop response">
                  <Square size={15} />
                </button>
              ) : (
                <button type="submit" title="Send message" disabled={!input.trim()}>
                  <Send size={17} />
                </button>
              )}
              {lastUserMessage && !isStreaming ? (
                <button type="button" onClick={retry} title="Regenerate last answer">
                  <RotateCcw size={16} />
                </button>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}
    </>
  );
}
