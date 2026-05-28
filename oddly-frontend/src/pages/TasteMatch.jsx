import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from '../components/layout/BottomNav';
import MoodBackground from '../components/layout/MoodBackground';
import { saveItem, unsaveItem, getTasteMatchRecs } from '../services/api';

const CATEGORY_META = {
  book:       { label: "Book",       color: "#7F77DD", icon: "📖" },
  music:      { label: "Music",      color: "#D4537E", icon: "🎵" },
  experience: { label: "Experience", color: "#1D9E75", icon: "🌿" },
  product:    { label: "Product",    color: "#BA7517", icon: "✦"  },
  film:       { label: "Film",       color: "#D85A30", icon: "🎬" },
  podcast:    { label: "Podcast",    color: "#7F77DD", icon: "🎙️" },
};

const EXAMPLES = [
  "Dark Side of the Moon",
  "Hayao Miyazaki films",
  "the smell of old bookshops",
  "Kafka's The Trial",
  "late night convenience stores",
  "Brian Eno ambient records",
];

export default function TasteMatch() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState({});
  const [saveLoading, setSaveLoading] = useState({});

  const handleMatch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setSavedIds({});

    try {
      // Now calls backend — Groq API key stays server-side
      const raw = await getTasteMatchRecs({ input: input.trim() });
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(parsed);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (item) => {
    if (saveLoading[item.id]) return;
    setSaveLoading(prev => ({ ...prev, [item.id]: true }));
    try {
      if (savedIds[item.id]) {
        await unsaveItem(savedIds[item.id]);
        setSavedIds(prev => ({ ...prev, [item.id]: null }));
      } else {
        const res = await saveItem({
          type: item.type,
          title: item.title,
          subtitle: item.subtitle,
          tags: item.tags,
          url: item.url,
          description: item.description,
        });
        setSavedIds(prev => ({ ...prev, [item.id]: res?.id || res?._id || "saved" }));
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaveLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "transparent",
      color: "#fff",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <MoodBackground mood="taste" />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(13,13,13,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "none", color: "#666",
          cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1,
        }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Taste Match</span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{
        maxWidth: 680, margin: "0 auto", padding: "32px 16px 100px",
        position: "relative", zIndex: 2,
      }}>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: "inline-block",
            background: "#D85A30" + "22", border: "1px solid #D85A30" + "44",
            borderRadius: 20, padding: "4px 14px",
            fontSize: 12, color: "#D85A30", fontWeight: 600,
            marginBottom: 16, letterSpacing: "0.05em",
          }}>TASTE MATCH</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.03em", margin: 0 }}>
            Tell us what you love.<br />
            <span style={{ color: "#D85A30" }}>We'll find its weird cousin.</span>
          </h1>
        </div>

        {/* Input */}
        <div style={{
          background: "rgba(26,26,26,0.8)", border: "1px solid #2a2a2a",
          borderRadius: 20, padding: "4px 4px 4px 20px",
          display: "flex", gap: 8, alignItems: "center",
          marginBottom: 20,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleMatch()}
            placeholder="e.g. Dark Side of the Moon, Kafka, old bookshops…"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: "#fff", fontSize: 15, fontFamily: "inherit", padding: "12px 0",
            }}
          />
          <button
            onClick={handleMatch}
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? "#D85A30" : "#2a2a2a",
              border: "none", borderRadius: 16, padding: "12px 20px",
              color: input.trim() && !loading ? "#fff" : "#444",
              fontWeight: 700, fontSize: 14,
              cursor: input.trim() && !loading ? "pointer" : "default",
              transition: "background 0.2s, color 0.2s", whiteSpace: "nowrap",
            }}
          >{loading ? "Finding…" : "Match →"}</button>
        </div>

        {/* Example pills */}
        {!results && !loading && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Try one of these
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {EXAMPLES.map(ex => (
                <button key={ex} onClick={() => setInput(ex)} style={{
                  background: "rgba(26,26,26,0.7)", border: "1px solid #2a2a2a",
                  borderRadius: 20, padding: "7px 14px",
                  color: "#666", fontSize: 12, cursor: "pointer",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#D85A30"; e.currentTarget.style.color = "#D85A30"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; }}
                >{ex}</button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 16, animation: "spin 1.5s linear infinite" }}>✦</div>
            <div style={{ color: "#555", fontSize: 14 }}>Hunting for weird cousins…</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(26,26,26,0.8)", border: "1px solid #D85A30" + "44",
            borderRadius: 16, padding: "20px", textAlign: "center", color: "#D85A30", fontSize: 14,
          }}>
            {error}
            <button onClick={handleMatch} style={{
              display: "block", margin: "12px auto 0",
              background: "none", border: "1px solid #D85A30",
              borderRadius: 20, padding: "6px 16px",
              color: "#D85A30", fontSize: 13, cursor: "pointer",
            }}>Try again</button>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div>
            <div style={{
              fontSize: 12, color: "#555", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>Weird cousins of</span>
              <span style={{
                background: "#D85A30" + "22", border: "1px solid #D85A30" + "44",
                borderRadius: 20, padding: "2px 12px", color: "#D85A30", fontWeight: 600,
              }}>{input}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {results.map((item) => {
                const meta = CATEGORY_META[item.type] || CATEGORY_META.book;
                const isSaved = !!savedIds[item.id];
                const isSaveLoading = !!saveLoading[item.id];
                return (
                  <div key={item.id} style={{
                    background: "rgba(26,26,26,0.75)", border: "1px solid #2a2a2a",
                    borderRadius: 20, overflow: "hidden",
                    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                    transition: "border-color 0.18s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = meta.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a2a"}
                  >
                    <div style={{ height: 3, background: meta.color }} />

                    <div style={{ padding: "18px 18px 16px" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <div style={{
                          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                          background: meta.color + "22",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                        }}>{meta.icon}</div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em" }}>{item.title}</div>
                              <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{item.subtitle}</div>
                            </div>
                            <button
                              onClick={() => toggleSave(item)}
                              disabled={isSaveLoading}
                              style={{
                                background: "none", border: "none",
                                cursor: isSaveLoading ? "default" : "pointer",
                                fontSize: 20, color: isSaved ? "#D4537E" : "#333",
                                flexShrink: 0, lineHeight: 1, padding: 0,
                                opacity: isSaveLoading ? 0.5 : 1,
                                transition: "color 0.15s",
                              }}
                            >{isSaveLoading ? "…" : isSaved ? "♥" : "♡"}</button>
                          </div>

                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                            <span style={{
                              background: meta.color + "22", border: `1px solid ${meta.color}44`,
                              borderRadius: 20, padding: "2px 10px",
                              fontSize: 11, color: meta.color, fontWeight: 600,
                            }}>{meta.label}</span>
                            {item.tags.map(t => (
                              <span key={t} style={{
                                background: "#0d0d0d", border: "1px solid #2a2a2a",
                                borderRadius: 20, padding: "2px 9px", fontSize: 11, color: "#666",
                              }}>#{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.6, margin: "14px 0 10px" }}>
                        {item.description}
                      </p>

                      <div style={{
                        background: "rgba(13,13,13,0.8)", borderRadius: 12, padding: "10px 14px",
                        display: "flex", gap: 10, alignItems: "flex-start",
                      }}>
                        <span style={{ color: meta.color, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✦</span>
                        <span style={{ fontSize: 12, color: "#666", lineHeight: 1.5, fontStyle: "italic" }}>
                          {item.why}
                        </span>
                      </div>

                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                          display: "inline-block", marginTop: 14,
                          background: "none", border: `1px solid ${meta.color}55`,
                          borderRadius: 20, padding: "7px 16px",
                          color: meta.color, fontSize: 12, fontWeight: 600, textDecoration: "none",
                          transition: "background 0.15s",
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = meta.color + "22"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >Open ↗</a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => { setResults(null); setInput(""); setSavedIds({}); }} style={{
              marginTop: 28, width: "100%",
              background: "none", border: "1px solid #2a2a2a",
              borderRadius: 16, padding: "14px",
              color: "#555", fontSize: 14, cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#D85A30"; e.currentTarget.style.color = "#D85A30"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#555"; }}
            >Try something else</button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}