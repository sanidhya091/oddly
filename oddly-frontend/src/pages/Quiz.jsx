import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MoodBackground from '../components/layout/MoodBackground'
import BottomNav from '../components/layout/BottomNav'

const questions = [
  {
    id: 1,
    question: "Right now I feel...",
    options: [
      { label: "Restless & bored",    icon: "⚡" },
      { label: "Cozy & low energy",   icon: "🌙" },
      { label: "Curious & inspired",  icon: "💡" },
      { label: "Social & energetic",  icon: "🎉" },
    ]
  },
  {
    id: 2,
    question: "I have time for...",
    options: [
      { label: "Something quick", icon: "⚡" },
      { label: "A deep dive",     icon: "🌊" },
      { label: "An adventure",    icon: "🗺️" },
      { label: "Just chilling",   icon: "☁️" },
    ]
  },
  {
    id: 3,
    question: "I'm in the mood for...",
    options: [
      { label: "Something to read",    icon: "📖" },
      { label: "Music or a podcast",   icon: "🎵" },
      { label: "An experience",        icon: "🌍" },
      { label: "A cool product",       icon: "📦" },
    ]
  }
]

const ACCENT = '#D85A30'

export default function Quiz() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)

  const q = questions[current]

  function handleSelect(option) { setSelected(option.label) }

  function handleNext() {
    if (!selected) return
    const newAnswers = [...answers, selected]
    if (current + 1 < questions.length) {
      setAnswers(newAnswers)
      setSelected(null)
      setCurrent(current + 1)
    } else {
      navigate('/results?mode=quiz&answers=' + encodeURIComponent(JSON.stringify(newAnswers)))
    }
  }

  return (
    <div style={{
      height: '100vh', overflow: 'hidden',
      color: '#fff', fontFamily: "'DM Sans', sans-serif",
      display: 'flex', flexDirection: 'column',
    }}>
      <MoodBackground mood="quiz" />

      <div style={{ position: 'relative', zIndex: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(8,4,2,0.5)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
        }}>
          <button onClick={() => current > 0 ? setCurrent(current - 1) : navigate('/')}
            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 20, padding: 0 }}>
            ←
          </button>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 9, color: ACCENT, fontWeight: 700,
              letterSpacing: '0.14em', fontFamily: "'Space Mono', monospace",
              marginBottom: 6,
            }}>
              VIBE QUIZ · {current + 1} OF {questions.length}
            </div>
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 4 }}>
              {questions.map((_, i) => (
                <div key={i} style={{
                  height: 2, flex: 1, borderRadius: 99,
                  background: i <= current ? ACCENT : 'rgba(255,255,255,0.1)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        <main style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px 100px',
        }}>
          <div style={{ width: '100%', maxWidth: 520 }}>

            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(22px, 3vw, 32px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              textAlign: 'center', marginBottom: 28,
              color: '#fff',
            }}>{q.question}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {q.options.map(option => {
                const isSelected = selected === option.label
                return (
                  <button
                    key={option.label}
                    onClick={() => handleSelect(option)}
                    style={{
                      width: '100%', textAlign: 'left', cursor: 'pointer',
                      background: isSelected ? ACCENT + '22' : 'rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${isSelected ? ACCENT : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 16, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? `0 4px 24px ${ACCENT}20` : 'none',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{option.icon}</span>
                    <span style={{
                      fontSize: 14, fontWeight: 500,
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                      flex: 1,
                    }}>{option.label}</span>
                    {isSelected && (
                      <span style={{ color: ACCENT, fontSize: 14, fontWeight: 700 }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleNext}
              disabled={!selected}
              style={{
                width: '100%', padding: '14px',
                background: selected ? ACCENT : 'rgba(255,255,255,0.04)',
                border: `1px solid ${selected ? ACCENT : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14, color: selected ? '#fff' : '#444',
                fontSize: 14, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed',
                fontFamily: "'Space Mono', monospace",
                letterSpacing: '-0.02em',
                transition: 'all 0.2s',
              }}
            >
              {current + 1 === questions.length ? 'get my recs →' : 'next →'}
            </button>

          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}