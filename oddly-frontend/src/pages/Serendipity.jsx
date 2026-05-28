import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import BottomNav from '../components/layout/BottomNav'
import MoodBackground from '../components/layout/MoodBackground'
import { saveItem, unsaveItem } from '../services/api'
import { useToast } from '../context/ToastContext'

const CATEGORY_META = {
  book:       { label: "Book",       color: "#7F77DD", bg: "#26215C" },
  music:      { label: "Music",      color: "#D4537E", bg: "#4B1528" },
  experience: { label: "Experience", color: "#1D9E75", bg: "#04342C" },
  product:    { label: "Product",    color: "#BA7517", bg: "#412402" },
  film:       { label: "Film",       color: "#D85A30", bg: "#4A1B0C" },
  podcast:    { label: "Podcast",    color: "#7F77DD", bg: "#26215C" },
}

const LOADING_LINES = [
  "Reaching into the void…",
  "Consulting the obscure…",
  "Ignoring the obvious…",
  "Finding something strange…",
  "Almost there…",
]

export default function Serendipity() {
  const navigate = useNavigate()
  const toast = useToast()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedId, setSavedId] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [loadingLine, setLoadingLine] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const fetchRec = async () => {
    setLoading(true); setError(null); setItem(null)
    setSavedId(null); setRevealed(false); setLoadingLine(0)
    try {
      const response = await fetch('/api/recs/serendipity', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('oddly_token')}` }
      })
      const text = await response.text()
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
      setItem(parsed)
      setTimeout(() => setRevealed(true), 100)
    } catch (err) {
      setError("Something went wrong. Try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleSave = async () => {
    if (!item || saveLoading) return
    setSaveLoading(true)
    try {
      if (savedId) {
        await unsaveItem(savedId)
        setSavedId(null)
        toast('Removed from saved', 'info')
      } else {
        const res = await saveItem({ type: item.type, title: item.title, subtitle: item.subtitle, tags: item.tags, url: item.url, description: item.description })
        setSavedId(res?.id || res?._id || "saved")
        toast('Saved ✓')
      }
    } catch (err) {
      toast('Something went wrong', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => setLoadingLine(prev => (prev + 1) % LOADING_LINES.length), 800)
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => { fetchRec() }, [])

  const meta = item ? (CATEGORY_META[item.type?.toLowerCase()] || CATEGORY_META.book) : null
  const isSaved = !!savedId

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .reveal-item { opacity: 0; animation: fadeUp 0.5s ease forwards; }
        .tag-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 4px 13px; font-size: 12px; color: #888; font-family: 'Space Mono', monospace; letter-spacing: -0.02em; transition: color 0.2s, border-color 0.2s; }
        .action-btn { transition: all 0.2s; }
        .action-btn:hover { opacity: 0.85; }
      `}</style>
      <MoodBackground mood="serendipity" />
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10, background: "rgba(13,13,13,0.85)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20, padding: 0 }}>←</button>
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em", color: "#fff" }}>serendipity</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 20px 120px", position: "relative", zIndex: 2 }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 28, display: "inline-block", animation: "spin 3s linear infinite", opacity: 0.7 }}>✦</div>
            <div style={{ color: "#444", fontSize: 14, fontFamily: "'Space Mono', monospace" }}>{LOADING_LINES[loadingLine]}</div>
          </div>
        )}
        {error && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 20, padding: 32, textAlign: "center" }}>
            <div style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>{error}</div>
            <button onClick={fetchRec} style={{ background: "#1D9E75", border: "none", borderRadius: 12, padding: "10px 28px", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Try again</button>
          </div>
        )}
        {item && meta && (
          <div style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.3s ease" }}>
            <div className="reveal-item" style={{ animationDelay: "0ms", marginBottom: 32, textAlign: "center" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: meta.color, textTransform: "uppercase", opacity: 0.8 }}>— {meta.label} —</span>
            </div>
            <div className="reveal-item" style={{ animationDelay: "80ms", marginBottom: 12, textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Syne', 'DM Sans', sans-serif", fontSize: "clamp(26px, 6vw, 38px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0, color: "#fff" }}>{item.title}</h1>
              {item.subtitle && <p style={{ fontSize: 14, color: "#555", marginTop: 8, marginBottom: 0 }}>{item.subtitle}</p>}
            </div>
            <div className="reveal-item" style={{ animationDelay: "160ms", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
              {item.tags?.map(tag => <span key={tag} className="tag-pill" style={{ "--accent": meta.color, "--accent-dim": meta.color + "44" }}>{tag}</span>)}
            </div>
            <div className="reveal-item" style={{ animationDelay: "240ms", marginBottom: 36 }}>
              <p style={{ fontSize: "clamp(15px, 3.5vw, 18px)", fontStyle: "italic", color: "#ccc", lineHeight: 1.75, margin: 0, borderLeft: `2px solid ${meta.color}`, paddingLeft: 20 }}>"{item.why}"</p>
            </div>
            <div className="reveal-item" style={{ animationDelay: "300ms", height: 1, background: "linear-gradient(90deg, transparent, #2a2a2a, transparent)", marginBottom: 28 }} />
            <div className="reveal-item" style={{ animationDelay: "340ms", marginBottom: 28 }}>
              <p style={{ fontSize: 15, color: "#888", lineHeight: 1.8, margin: 0 }}>{item.description}</p>
            </div>
            {item.funFact && (
              <div className="reveal-item" style={{ animationDelay: "400ms", marginBottom: 36 }}>
                <div style={{ background: meta.color + "0d", border: `1px solid ${meta.color}22`, borderRadius: 14, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ color: meta.color, fontSize: 14, marginTop: 2, flexShrink: 0 }}>✦</span>
                  <div>
                    <div style={{ fontSize: 10, color: meta.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>weird fact</div>
                    <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0 }}>{item.funFact}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="reveal-item" style={{ animationDelay: "460ms" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button className="action-btn" onClick={toggleSave} disabled={saveLoading} style={{ flex: 1, padding: "14px", background: isSaved ? meta.color + "22" : "#111", border: `1px solid ${isSaved ? meta.color : "#222"}`, borderRadius: 14, color: isSaved ? meta.color : "#555", fontSize: 14, fontWeight: 600, cursor: saveLoading ? "default" : "pointer", opacity: saveLoading ? 0.6 : 1, transition: "all 0.2s" }}>
                  {saveLoading ? "…" : isSaved ? "♥ Saved" : "♡ Save this"}
                </button>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="action-btn" style={{ flex: 1, padding: "14px", background: meta.color, border: "none", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Explore ↗</a>
                )}
              </div>
              <button className="action-btn" onClick={fetchRec} style={{ width: "100%", padding: "14px", background: "none", border: "1px solid #1e1e1e", borderRadius: 14, color: "#444", fontSize: 14, cursor: "pointer", fontFamily: "'Space Mono', monospace", letterSpacing: "-0.02em" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.color = meta.color }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#444" }}
              >surprise me again →</button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}