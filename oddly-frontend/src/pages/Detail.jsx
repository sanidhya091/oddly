import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import BottomNav from '../components/layout/BottomNav'
import MoodBackground from '../components/layout/MoodBackground'
import { saveItem, unsaveItem } from '../services/api'
import { useToast } from '../context/ToastContext'

const CATEGORY_META = {
  book:       { label: "Book",       color: "#7F77DD", icon: "📖", mood: "results" },
  music:      { label: "Music",      color: "#D4537E", icon: "🎵", mood: "results" },
  experience: { label: "Experience", color: "#1D9E75", icon: "🌿", mood: "serendipity" },
  product:    { label: "Product",    color: "#BA7517", icon: "✦",  mood: "taste" },
  film:       { label: "Film",       color: "#D85A30", icon: "🎬", mood: "taste" },
  podcast:    { label: "Podcast",    color: "#7F77DD", icon: "🎙️", mood: "results" },
}

function ShareModal({ item, meta, onClose }) {
  const [copied, setCopied] = useState(false)
  const toast = useToast()
  const shareUrl = item.url || window.location.href

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast('Link copied!', 'info')
    setTimeout(() => setCopied(false), 2000)
    setTimeout(onClose, 1200)
  }

  async function handleNativeShare() {
    if (!navigator.share) return handleCopyLink()
    try {
      await navigator.share({ title: item.title, text: `Found on oddly: ${item.title} — ${item.why}`, url: shareUrl })
    } catch (e) {}
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 520,
        background: '#111', border: '1px solid #222',
        borderRadius: '24px 24px 0 0', padding: '28px 24px 40px',
        animation: 'slideUp 0.25s ease',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#333', margin: '0 auto 24px' }} />
        <p style={{ fontSize: 11, color: '#555', margin: '0 0 6px', fontFamily: "'Space Mono', monospace", letterSpacing: '0.1em', textTransform: 'uppercase' }}>share</p>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 24px', letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.3 }}>{item.title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={handleNativeShare} style={{ width: '100%', padding: '14px 18px', background: meta.color, border: 'none', borderRadius: 14, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📤</span>{navigator.share ? 'Share via…' : 'Copy link'}
          </button>
          <button onClick={handleCopyLink} style={{ width: '100%', padding: '14px 18px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, color: copied ? '#1D9E75' : '#aaa', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{copied ? '✓' : '🔗'}</span>{copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Detail() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const item = location.state?.item
  const [savedId, setSavedId] = useState(location.state?.savedId || null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const meta = item ? (CATEGORY_META[item.type?.toLowerCase()] || CATEGORY_META.book) : null

  if (!item) return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>🤔</p>
        <p style={{ color: "#666", marginBottom: 20 }}>Item not found</p>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#7F77DD", cursor: "pointer", fontSize: 14 }}>← Go back</button>
      </div>
    </div>
  )

  async function toggleSave() {
    if (saveLoading) return
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

  const isSaved = !!savedId

  return (
    <div style={{ minHeight: "100vh", background: "transparent", color: "#fff", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <MoodBackground mood={meta.mood} />
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20, background: "rgba(13,13,13,0.85)", backdropFilter: "blur(12px)" }}>
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20, padding: 0 }}>←</button>
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>{meta.label}</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 120px", position: "relative", zIndex: 2 }}>
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: meta.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{meta.icon}</div>
          <div>
            <div style={{ fontSize: 10, color: meta.color, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>{meta.label}</div>
            {item.subtitle && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{item.subtitle}</div>}
          </div>
        </div>
        <h1 style={{ fontFamily: "'Syne', 'DM Sans', sans-serif", fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.2, margin: "0 0 24px", color: "#fff" }}>{item.title}</h1>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${meta.color}, transparent)`, marginBottom: 28, borderRadius: 99 }} />
        <div style={{ background: "rgba(26,26,26,0.8)", border: "1px solid #2a2a2a", borderRadius: 16, padding: "18px 20px", marginBottom: 16, backdropFilter: "blur(8px)" }}>
          <p style={{ fontSize: 14, color: "#aaa", lineHeight: 1.8, margin: 0 }}>{item.description}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {item.tags?.map(tag => (
            <span key={tag} style={{ background: meta.color + "18", border: `1px solid ${meta.color}33`, borderRadius: 20, padding: "4px 13px", fontSize: 11, color: meta.color, fontFamily: "'Space Mono', monospace" }}>{tag}</span>
          ))}
        </div>
        {item.why && (
          <div style={{ background: "rgba(26,26,26,0.8)", border: "1px solid #2a2a2a", borderRadius: 16, padding: "18px 20px", marginBottom: 28, backdropFilter: "blur(8px)", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ color: meta.color, fontSize: 14, flexShrink: 0, marginTop: 2 }}>✦</span>
            <div>
              <div style={{ fontSize: 10, color: meta.color, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>why oddly picked this</div>
              <p style={{ fontSize: 13, color: "#ccc", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{item.why}"</p>
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={toggleSave} disabled={saveLoading} style={{ flex: 1, padding: "14px", borderRadius: 14, background: isSaved ? meta.color + "22" : "rgba(26,26,26,0.8)", border: `1px solid ${isSaved ? meta.color : "#2a2a2a"}`, color: isSaved ? meta.color : "#aaa", fontSize: 14, fontWeight: 600, cursor: saveLoading ? "default" : "pointer", opacity: saveLoading ? 0.6 : 1, transition: "all 0.2s" }}>
            {saveLoading ? "…" : isSaved ? "♥ Saved" : "♡ Save"}
          </button>
          {item.url && (
            <button onClick={() => window.open(item.url, '_blank')} style={{ flex: 1, padding: "14px", borderRadius: 14, background: meta.color, border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Open ↗</button>
          )}
          <button onClick={() => setShowShare(true)} style={{ flex: 1, padding: "14px", borderRadius: 14, background: "rgba(26,26,26,0.8)", border: "1px solid #2a2a2a", color: "#aaa", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color; e.currentTarget.style.color = meta.color }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#aaa" }}
          >📤 Share</button>
        </div>
      </div>
      {showShare && <ShareModal item={item} meta={meta} onClose={() => setShowShare(false)} />}
      <BottomNav />
    </div>
  )
}