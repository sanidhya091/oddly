import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MoodBackground from '../components/layout/MoodBackground'

const CATEGORY_META = {
  book:       { label: 'Book',       color: '#7F77DD', icon: '📖' },
  music:      { label: 'Music',      color: '#D4537E', icon: '🎵' },
  experience: { label: 'Experience', color: '#1D9E75', icon: '🌿' },
  product:    { label: 'Product',    color: '#BA7517', icon: '✦'  },
  film:       { label: 'Film',       color: '#D85A30', icon: '🎬' },
  podcast:    { label: 'Podcast',    color: '#7F77DD', icon: '🎙️' },
}

const PROMPTS = [
  'I want something that feels like 3am and rain',
  'Give me something I can get completely lost in',
  'Something weird but comforting',
  "I'm feeling nostalgic but can't explain why",
  "Something that'll change how I see things",
]

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '14px 16px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#D4537E',
          animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}

function RecCard({ rec }) {
  const meta = CATEGORY_META[rec.type?.toLowerCase()] || CATEGORY_META.book
  const [saved, setSaved] = useState(false)
  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${meta.color}33`,
      borderRadius: 14, overflow: 'hidden', marginTop: 10,
    }}>
      <div style={{ height: 2, background: meta.color }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: meta.color + '22',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>{meta.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em',
              color: '#fff', fontFamily: "'Syne', sans-serif",
            }}>{rec.title}</div>
            <div style={{ color: '#555', fontSize: 11, marginTop: 1 }}>{rec.subtitle}</div>
          </div>
          <button onClick={() => setSaved(s => !s)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: saved ? '#D4537E' : '#333', fontSize: 16, padding: 0,
            transition: 'color 0.15s', flexShrink: 0,
          }}>♥</button>
        </div>
        {rec.description && (
          <p style={{ color: '#777', fontSize: 12, lineHeight: 1.6, margin: '10px 0 8px' }}>
            {rec.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {rec.tags?.map(t => (
            <span key={t} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '2px 8px',
              fontSize: 10, color: '#555',
              fontFamily: "'Space Mono', monospace",
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatMode() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([{
    id: 'intro', role: 'assistant',
    text: "Hey. Tell me what you're feeling, what mood you're in, or describe a vibe — and I'll find something oddly perfect for you.",
    recs: null,
  }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const historyRef = useRef([])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || typing) return
    setInput('')

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }])
    setTyping(true)

    historyRef.current = [...historyRef.current, { role: 'user', content: text }]

    try {
      const res = await fetch('/api/recs/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('oddly_token')}`,
        },
        body: JSON.stringify({ messages: historyRef.current }),
      })

      if (!res.ok) {
        if (res.status === 401) navigate('/login')
        throw new Error(`${res.status}`)
      }

      const raw = await res.text()
      const clean = raw.replace(/```json|```/g, '').trim()
      const data = JSON.parse(clean)

      historyRef.current = [...historyRef.current, { role: 'assistant', content: data.reply }]

      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_a',
        role: 'assistant',
        text: data.reply,
        recs: data.recs || [],
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_err',
        role: 'assistant',
        text: "Something went wrong on my end. Try again?",
        recs: null,
      }])
    } finally {
      setTyping(false)
    }
  }

  return (
    // ← height:100vh + overflow:hidden — locks to viewport, no double-scrolling
    <div style={{
      height: '100vh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      color: '#fff', fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <MoodBackground mood="chat" />

      {/* zIndex wrapper — same height as viewport, flex column */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header — fixed height, never shrinks */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(5,3,5,0.7)', backdropFilter: 'blur(20px)',
          flexShrink: 0,
        }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', color: '#555',
            cursor: 'pointer', fontSize: 20, padding: 0,
          }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', background: '#D4537E',
              boxShadow: '0 0 8px #D4537E99',
            }} />
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em' }}>chat mode</span>
          </div>
          <div style={{ width: 40 }} />
        </div>

        {/* Messages — flex:1 takes all remaining space, scrolls internally */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '20px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
          maxWidth: 680, width: '100%', margin: '0 auto', alignSelf: 'center',
          boxSizing: 'border-box',
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              gap: 10, alignItems: 'flex-start',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #D4537E, #7F77DD)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, marginTop: 2,
                }}>✦</div>
              )}
              <div style={{ maxWidth: '80%', minWidth: 0 }}>
                <div style={{
                  background: msg.role === 'user' ? '#D4537E' : 'rgba(255,255,255,0.05)',
                  backdropFilter: msg.role === 'assistant' ? 'blur(12px)' : 'none',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                  fontSize: 14, lineHeight: 1.65, color: '#fff',
                }}>
                  {msg.text}
                </div>
                {msg.recs?.map(rec => <RecCard key={rec.id} rec={rec} />)}
              </div>
            </div>
          ))}

          {typing && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #D4537E, #7F77DD)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
              }}>✦</div>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px 18px 18px 4px',
              }}>
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Prompt suggestions */}
        {messages.length === 1 && (
          <div style={{
            padding: '0 16px 10px',
            maxWidth: 680, width: '100%',
            margin: '0 auto', boxSizing: 'border-box',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              {PROMPTS.map(p => (
                <button key={p} onClick={() => setInput(p)} style={{
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20, padding: '7px 14px',
                  color: '#555', fontSize: 12, cursor: 'pointer',
                  whiteSpace: 'nowrap', transition: 'all 0.15s',
                  fontFamily: "'Space Mono', monospace",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4537E'; e.currentTarget.style.color = '#D4537E' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#555' }}
                >{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar — flexShrink:0 keeps it pinned at bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px 24px',
          background: 'rgba(5,3,5,0.7)',
          backdropFilter: 'blur(20px)',
          flexShrink: 0,
        }}>
          <div style={{
            maxWidth: 680, margin: '0 auto',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '4px 4px 4px 16px',
            display: 'flex', gap: 8, alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Describe a feeling, vibe, or mood…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#fff', fontSize: 14, fontFamily: 'inherit', padding: '10px 0',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              style={{
                width: 40, height: 40, borderRadius: 16, flexShrink: 0,
                background: input.trim() && !typing ? '#D4537E' : 'rgba(255,255,255,0.06)',
                border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, transition: 'background 0.2s', color: '#fff',
              }}
            >↑</button>
          </div>
        </div>

      </div>
    </div>
  )
}