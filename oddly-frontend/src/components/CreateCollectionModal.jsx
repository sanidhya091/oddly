import { useState } from "react";
import { useToast } from "../context/ToastContext";

// ── Emoji picker options ─────────────────────────────────────────────────────
const EMOJIS = ["📚", "🎵", "🎬", "🎙️", "🛸", "🌿", "🔮", "🗺️", "🧪", "🌊", "🪐", "🦋", "🕯️", "🎭", "🧩", "⚡"];

export default function CreateCollectionModal({ onClose, onCreated }) {
  const toast = useToast();
  const [name, setName]       = useState("");
  const [emoji, setEmoji]     = useState("📚");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/me/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), emoji }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      const created = await res.json();
      toast.success(`"${name.trim()}" collection created`);
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* Backdrop */}
      <div style={S.backdrop} onClick={handleBackdropClick}>

        {/* Modal */}
        <div style={S.modal} role="dialog" aria-modal="true" aria-label="Create collection">

          {/* Header */}
          <div style={S.header}>
            <span style={S.headerTitle}>new collection</span>
            <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Emoji picker */}
            <div style={S.section}>
              <div style={S.label}>pick an icon</div>
              <div style={S.emojiGrid}>
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    style={{
                      ...S.emojiBtn,
                      ...(emoji === e ? S.emojiBtnActive : {}),
                    }}
                    onClick={() => setEmoji(e)}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div style={S.section}>
              <div style={S.label}>collection name</div>
              <div style={S.inputRow}>
                <span style={S.inputEmoji}>{emoji}</span>
                <input
                  className="oddly-input"
                  style={S.input}
                  type="text"
                  placeholder="e.g. weird jazz, slow cinema..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  autoFocus
                  required
                />
              </div>
              <div style={S.charCount}>{name.length}/40</div>
            </div>

            {/* Actions */}
            <div style={S.actions}>
              <button type="button" style={S.cancelBtn} onClick={onClose}>
                cancel
              </button>
              <button
                type="submit"
                style={{ ...S.createBtn, opacity: loading || !name.trim() ? 0.5 : 1 }}
                disabled={loading || !name.trim()}
              >
                {loading ? "creating..." : "create collection →"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500&display=swap');

  .oddly-input:focus {
    border-color: rgba(127,119,221,0.5) !important;
    background: rgba(127,119,221,0.06) !important;
    outline: none;
  }
  .oddly-input::placeholder { color: rgba(255,255,255,0.2); }

  @keyframes oddly-modal-in {
    from { opacity: 0; transform: translateY(12px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
`;

const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  modal: {
    background: "rgba(20,20,20,0.95)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "20px",
    padding: "1.5rem",
    width: "100%",
    maxWidth: "360px",
    animation: "oddly-modal-in 0.22s ease",
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
  },
  headerTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    fontSize: "0.75rem",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
  },
  section: {
    marginBottom: "1.25rem",
  },
  label: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.58rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.3)",
    marginBottom: "0.6rem",
  },
  emojiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: "6px",
  },
  emojiBtn: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "8px",
    fontSize: "1.1rem",
    padding: "6px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiBtnActive: {
    background: "rgba(127,119,221,0.2)",
    border: "1px solid rgba(127,119,221,0.45)",
    transform: "scale(1.1)",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "10px",
    padding: "0 0.9rem",
  },
  inputEmoji: {
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    padding: "0.7rem 0",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    width: "100%",
  },
  charCount: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.58rem",
    color: "rgba(255,255,255,0.18)",
    textAlign: "right",
    marginTop: "0.35rem",
  },
  actions: {
    display: "flex",
    gap: "0.6rem",
    marginTop: "0.5rem",
  },
  cancelBtn: {
    flex: 1,
    padding: "0.7rem",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.45)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  createBtn: {
    flex: 2,
    padding: "0.7rem",
    background: "#7F77DD",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontSize: "0.88rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.15s",
    letterSpacing: "0.01em",
  },
};