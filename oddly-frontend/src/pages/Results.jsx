import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
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

const LOADING_LINES = ["Reading between the lines…","Finding the weird cousins…","Ignoring the obvious…","Almost there…"]

function SkeletonPulse({ width = "100%", height = 14, radius = 6, style = {} }) {
  return <div style={{ width, height, borderRadius: radius, background: "linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.6s infinite", flexShrink: 0, ...style }} />
}

function SkeletonCard({ delay = 0 }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 20, overflow: "hidden", opacity: 0, animation: `fadeUp 0.3s ease ${delay}ms forwards` }}>
      <div style={{ height: 3, background: "#1e1e1e" }} />
      <div style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SkeletonPulse width={48} height={10} /><SkeletonPulse width={18} height={18} radius={50} />
        </div>
        <SkeletonPulse width="75%" height={20} radius={6} />
        <SkeletonPulse width="40%" height={12} radius={5} />
        <div style={{ display: "flex", gap: 6 }}>
          <SkeletonPulse width={70} height={22} radius={20} /><SkeletonPulse width={90} height={22} radius={20} /><SkeletonPulse width={60} height={22} radius={20} />
        </div>
        <div style={{ paddingLeft: 12, borderLeft: "2px solid #2a2a2a", display: "flex", flexDirection: "column", gap: 6 }}>
          <SkeletonPulse width="95%" height={12} /><SkeletonPulse width="80%" height={12} />
        </div>
      </div>
    </div>
  )
}

function ResultsSkeleton() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{[0,1,2,3].map(i => <SkeletonCard key={i} delay={i * 80} />)}</div>
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 36, animation: "spin 8s linear infinite", opacity: 0.4, color: "#D85A30" }}>✦</div>
      <p style={{ color: "#555", fontSize: 13, margin: 0, fontFamily: "'Space Mono', monospace", lineHeight: 1.7 }}>{message || "something went sideways.\nthe recs couldn't load."}</p>
      <button onClick={onRetry} style={{ marginTop: 8, padding: "12px 24px", background: "none", border: "1px solid #D85A30", borderRadius: 12, color: "#D85A30", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}
        onMouseEnter={e => e.currentTarget.style.background = "#D85A3011"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >try again →</button>
    </div>
  )
}

function EmptyState({ onRetry }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ fontSize: 36, opacity: 0.3 }}>◯</div>
      <p style={{ color: "#555", fontSize: 13, margin: 0, fontFamily: "'Space Mono', monospace", lineHeight: 1.7 }}>nothing surfaced this time.<br />the universe was vague.</p>
      <button onClick={onRetry} style={{ marginTop: 8, padding: "12px 24px", background: "none", border: "1px solid #7F77DD", borderRadius: 12, color: "#7F77DD", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace" }}
        onMouseEnter={e => e.currentTarget.style.background = "#7F77DD11"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >try again →</button>
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [savedIds, setSavedIds] = useState({})
  const [saveLoading, setSaveLoading] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [loadingLine, setLoadingLine] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  async function fetchResults() {
    setLoading(true); setError(null); setRevealed(false)
    const mode = searchParams.get('mode')
    const answers = JSON.parse(searchParams.get('answers') || '[]')
    try {
      const endpoint = mode === 'quiz' ? '/api/recs/quiz' : mode === 'taste' ? '/api/recs/taste-match' : '/api/recs/serendipity'
      const isGet = mode === 'serendipity'
      const res = await fetch(endpoint, {
        method: isGet ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('oddly_token')}` },
        ...(isGet ? {} : { body: JSON.stringify({ answers }) }),
      })
      if (!res.ok) { if (res.status === 401) navigate('/login'); throw new Error(`${res.status}`) }
      const text = await res.text()
      const data = JSON.parse(text.replace(/```json|```/g, "").trim())
      sessionStorage.setItem('lastResults', JSON.stringify({ data, savedIds: {} }))
      setResults([]); setResetKey(k => k + 1); setResults(data); setSavedIds({})
      setLoading(false); setRevealed(true)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError("something went sideways.\nthe recs couldn't load.")
      setLoading(false)
    }
  }

  useEffect(() => { fetchResults() }, [])
  useEffect(() => {
    if (!loading) return
    const interval = setInterval(() => setLoadingLine(prev => (prev + 1) % LOADING_LINES.length), 900)
    return () => clearInterval(interval)
  }, [loading])

  async function toggleSave(item) {
    if (saveLoading[item.id]) return
    setSaveLoading(prev => ({ ...prev, [item.id]: true }))
    try {
      if (savedIds[item.id]) {
        await unsaveItem(savedIds[item.id])
        setSavedIds(prev => { const next = { ...prev, [item.id]: null }; updateCache(next); return next })
        toast('Removed from saved', 'info')
      } else {
        const res = await saveItem({ type: item.type, title: item.title, subtitle: item.subtitle, tags: item.tags, url: item.url, description: item.description })
        setSavedIds(prev => { const next = { ...prev, [item.id]: res?.id || res?._id || "saved" }; updateCache(next); return next })
        toast('Saved ✓')
      }
    } catch (err) {
      toast('Something went wrong', 'error')
    } finally {
      setSaveLoading(prev => ({ ...prev, [item.id]: false }))
    }
  }

  function updateCache(newSavedIds) {
    const cached = JSON.parse(sessionStorage.getItem('lastResults') || 'null')
    if (cached) sessionStorage.setItem('lastResults', JSON.stringify({ ...cached, savedIds: newSavedIds }))
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "transparent", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
        <MoodBackground mood="results" />
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } } @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,13,13,0.85)", backdropFilter: "blur(12px)", position: "relative", zIndex: 10 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: "#1e1e1e" }} />
          <div style={{ width: 70, height: 14, borderRadius: 6, background: "#1e1e1e" }} />
          <div style={{ width: 40, height: 12, borderRadius: 5, background: "#1e1e1e" }} />
        </div>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 120px", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ fontSize: 18, color: "#7F77DD", animation: "spin 3s linear infinite", opacity: 0.7 }}>✦</div>
              <p style={{ color: "#444", fontSize: 12, margin: 0, fontFamily: "'Space Mono', monospace" }}>{LOADING_LINES[loadingLine]}</p>
            </div>
          </div>
          <ResultsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <MoodBackground mood="results" />
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rec-card { background: rgba(13,13,13,0.85); border: 1px solid #1e1e1e; border-radius: 20px; overflow: hidden; cursor: pointer; transition: border-color 0.2s, transform 0.2s; backdrop-filter: blur(8px); }
        .rec-card:hover { transform: translateY(-2px); }
        .tag-pill { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 3px 11px; font-size: 11px; color: #666; font-family: 'Space Mono', monospace; white-space: nowrap; }
        .save-btn { transition: all 0.2s; }
      `}</style>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20, background: "rgba(13,13,13,0.85)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => navigate('/')} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20, padding: 0 }}>←</button>
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>your picks</span>
        <span style={{ fontSize: 12, color: "#444", fontFamily: "'Space Mono', monospace" }}>{error ? "–" : `${results.length} found`}</span>
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 120px", position: "relative", zIndex: 2 }}>
        {error && <ErrorState message={error} onRetry={fetchResults} />}
        {!error && results.length === 0 && <EmptyState onRetry={fetchResults} />}
        {!error && results.length > 0 && (
          <>
            <div style={{ opacity: revealed ? 1 : 0, transition: "opacity 0.5s ease 0.1s", marginBottom: 32, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#555", margin: 0, fontFamily: "'Space Mono', monospace", letterSpacing: "-0.02em" }}>something found you.</p>
            </div>
            <div key={resetKey} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {results.map((item, i) => {
                const meta = CATEGORY_META[item.type?.toLowerCase()] || CATEGORY_META.book
                const isSaved = !!savedIds[item.id]
                const isSaveLoading = !!saveLoading[item.id]
                return (
                  <div key={i} className="rec-card"
                    style={{ opacity: revealed ? 1 : 0, animation: revealed ? `fadeUp 0.4s ease ${i * 80}ms forwards` : "none" }}
                    onClick={() => navigate('/detail', { state: { item, savedId: savedIds[item.id] || null } })}
                    onMouseEnter={e => e.currentTarget.style.borderColor = meta.color + "55"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#1e1e1e"}
                  >
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)` }} />
                    <div style={{ padding: "20px 20px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 10, color: meta.color, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>{meta.label}</span>
                        <button className="save-btn" onClick={e => { e.stopPropagation(); toggleSave(item) }} disabled={isSaveLoading}
                          style={{ background: "none", border: "none", cursor: isSaveLoading ? "default" : "pointer", color: isSaved ? meta.color : "#333", fontSize: 16, padding: 0, lineHeight: 1, opacity: isSaveLoading ? 0.5 : 1 }}>
                          {isSaveLoading ? "…" : isSaved ? "♥" : "♡"}
                        </button>
                      </div>
                      <h3 style={{ fontFamily: "'Syne', 'DM Sans', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, margin: "0 0 4px", color: "#fff" }}>{item.title}</h3>
                      {item.subtitle && <p style={{ fontSize: 12, color: "#555", margin: "0 0 14px" }}>{item.subtitle}</p>}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                        {item.tags?.map(tag => <span key={tag} className="tag-pill">{tag}</span>)}
                      </div>
                      <p style={{ fontSize: 13, color: "#777", lineHeight: 1.7, margin: 0, fontStyle: "italic", paddingLeft: 12, borderLeft: `2px solid ${meta.color}66` }}>{item.why}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={fetchResults} style={{ width: "100%", marginTop: 24, padding: "14px", background: "none", border: "1px solid #1e1e1e", borderRadius: 14, color: "#444", fontSize: 13, cursor: "pointer", fontFamily: "'Space Mono', monospace", letterSpacing: "-0.02em", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7F77DD"; e.currentTarget.style.color = "#7F77DD" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#444" }}
            >try again →</button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}