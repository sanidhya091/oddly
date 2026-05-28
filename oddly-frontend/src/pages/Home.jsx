import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { getUser } from '../services/auth'
import BottomNav from '../components/layout/BottomNav'
import MoodBackground from '../components/layout/MoodBackground'

const modes = [
  { id: 'quiz',        label: 'VIBE QUIZ',   title: 'Answer 3 questions',    sub: 'Get recs based on your mood', color: '#7F77DD', icon: '🎭', route: '/quiz',        delay: 0.1 },
  { id: 'taste',       label: 'TASTE MATCH', title: 'Tell me what you love', sub: 'Find its weird cousin',       color: '#D85A30', icon: '🔥', route: '/taste-match', delay: 0.2 },
  { id: 'serendipity', label: 'SERENDIPITY', title: 'Surprise me',           sub: 'Totally unexpected',          color: '#1D9E75', icon: '✨', route: '/serendipity', delay: 0.3 },
  { id: 'chat',        label: 'CHAT MODE',   title: 'Just talk to me',       sub: 'Describe your feeling',       color: '#D4537E', icon: '💬', route: '/chat',        delay: 0.4 },
]


function ModeCard({ mode, onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: mode.delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${hovered ? mode.color + '60' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 18,
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: hovered ? `0 8px 32px ${mode.color}20` : 'none',
        transition: 'all 0.22s ease',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, top: 12, bottom: 12, width: 2.5,
        background: mode.color, borderRadius: 99,
        opacity: hovered ? 1 : 0, transition: 'opacity 0.22s',
      }} />

      <div style={{
        width: 46, height: 46, borderRadius: 14, flexShrink: 0,
        background: mode.color + '18',
        border: `1px solid ${mode.color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.08) rotate(-5deg)' : 'scale(1)',
      }}>{mode.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 9, fontWeight: 700, color: mode.color,
          letterSpacing: '0.14em', marginBottom: 5,
          fontFamily: "'Space Mono', monospace",
        }}>{mode.label}</div>
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#fff',
          letterSpacing: '-0.02em',
          fontFamily: "'Syne', sans-serif",
          lineHeight: 1.2,
        }}>{mode.title}</div>
        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.3)',
          marginTop: 3,
        }}>{mode.sub}</div>
      </div>

      <div style={{
        color: hovered ? mode.color : 'rgba(255,255,255,0.12)',
        fontSize: 20, flexShrink: 0,
        transition: 'color 0.22s, transform 0.22s',
        transform: hovered ? 'translateX(3px)' : 'none',
      }}>›</div>
    </motion.button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const user = getUser()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  return (
    <div style={{
      height: '100vh',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 50% 0%, #150d2e 0%, #0a0a10 50%, #050507 100%)',
      fontFamily: "'DM Sans', sans-serif",
      color: '#fff',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
      `}</style>

      <MoodBackground mood="home" />

      <div style={{
        position: 'relative', zIndex: 2,
        height: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 28px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(8,6,18,0.5)',
            backdropFilter: 'blur(20px)',
            flexShrink: 0,
          }}
        >
          <div style={{
            fontSize: 22, fontWeight: 800, color: '#7F77DD',
            fontFamily: "'Syne', sans-serif", letterSpacing: '-0.04em',
          }}>oddly.</div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '6px 16px',
              color: 'rgba(255,255,255,0.45)', fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            <span>◯</span>
            <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
          </motion.button>
        </motion.header>

        {/* Main — fills remaining height, centers content */}
        <main style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 24px 80px',
        }}>
          <div style={{ width: '100%', maxWidth: 680 }}>

            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ textAlign: 'center', marginBottom: 14 }}
            >
              <span style={{
                display: 'inline-block',
                fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.25)',
                fontFamily: "'Space Mono', monospace",
                padding: '5px 14px',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 99,
                background: 'rgba(255,255,255,0.03)',
              }}>
                ✦ GOOD {greeting.toUpperCase()}, {(user?.name?.split(' ')[0] || 'EXPLORER').toUpperCase()}
              </span>
            </motion.div>

            {/* Hero */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
              style={{
                fontSize: 'clamp(28px, 3vw, 46px)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.04em',
                fontFamily: "'Syne', sans-serif",
                textAlign: 'center',
                margin: '0 0 24px',
              }}
            >
              What's your{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a89eff 0%, #D4537E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>vibe today?</span>
            </motion.h1>

            {/* Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}>
              {modes.map(mode => (
                <ModeCard key={mode.id} mode={mode} onClick={() => navigate(mode.route)} />
              ))}
            </div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                marginTop: 16, textAlign: 'center',
                fontSize: 9, color: 'rgba(255,255,255,0.1)',
                letterSpacing: '0.12em',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              POWERED BY GROQ · ODDLY 2025
            </motion.p>

          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  )
}