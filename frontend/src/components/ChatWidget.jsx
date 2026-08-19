import { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// One session ID per browser tab session — lets the backend pull recent
// conversation history for this visitor. Persisted in sessionStorage so it
// survives a page refresh but not a new tab.
function getSessionId() {
  const key = 'cf_chat_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

const suggestions = [
  { label: 'Tracks?', q: 'What tracks do you offer?' },
  { label: 'Training?', q: 'How does training work?' },
  { label: 'How to apply?', q: 'How do I apply?' },
  { label: 'Partnerships?', q: 'How do partnerships work?' },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { who: 'bot', text: "Hey — I'm the CareerForge assistant. Ask me about training, tracks, mentors, partnerships, or how to apply." },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const windowRef = useRef(null);
  const sessionIdRef = useRef(null);

  if (sessionIdRef.current === null) {
    sessionIdRef.current = getSessionId();
  }

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.scrollTop = windowRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setMessages((m) => [...m, { who: 'user', text: trimmed }]);
    setInput('');
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/api/bot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionIdRef.current, message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'bot request failed');
      setMessages((m) => [...m, { who: 'bot', text: data.reply }]);
    } catch (requestError) {
      setMessages((m) => [
        ...m,
        {
          who: 'bot',
          text: requestError.message || "Sorry, I'm having trouble reaching the assistant right now — try again in a moment, or use the Contact page and a real person will follow up.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        className="btn btn-primary rounded-circle position-fixed d-flex align-items-center justify-content-center shadow"
        style={{ width: 58, height: 58, bottom: 24, right: 24, zIndex: 1050 }}
        aria-label="Open CareerForge assistant"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      {open && (
        <div
          className="position-fixed bg-white border rounded-4 shadow-lg d-flex flex-column"
          style={{ bottom: 96, right: 24, width: 340, maxWidth: 'calc(100vw - 32px)', height: 460, zIndex: 1049 }}
          role="dialog"
          aria-label="CareerForge assistant"
        >
          <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom bg-ink text-white rounded-top-4">
            <span className="rounded-circle bg-primary" style={{ width: 8, height: 8 }} />
            <span className="fw-bold text-uppercase small">CareerForge Assistant</span>
            <span className="ms-auto small text-white-50">Online</span>
            <button
              className="btn-close btn-close-white"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
            />
          </div>

          <div ref={windowRef} className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  'px-3 py-2 rounded-3 small ' +
                  (m.who === 'user'
                    ? 'align-self-end bg-primary text-white'
                    : 'align-self-start bg-light border')
                }
                style={{ maxWidth: '82%' }}
              >
                {m.text}
              </div>
            ))}
            {sending && (
              <div className="align-self-start bg-light border px-3 py-2 rounded-3 small text-muted">
                Typing…
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2 px-3 pb-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                className="btn btn-outline-secondary btn-sm rounded-pill"
                disabled={sending}
                onClick={() => send(s.q)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <form
            className="d-flex gap-2 p-3 border-top"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Type your question..."
              value={input}
              disabled={sending}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>
              {sending ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
