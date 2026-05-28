import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    '✦',
}

const COLORS = {
  success: '#1D9E75',
  error:   '#D85A30',
  info:    '#7F77DD',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2800)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'none', alignItems: 'center',
      }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0,   scale: 1 }}
              exit={{    opacity: 0, y: -8,   scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(12,10,22,0.92)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${COLORS[t.type]}44`,
                borderRadius: 99,
                padding: '10px 18px',
                boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${COLORS[t.type]}22`,
                pointerEvents: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: COLORS[t.type] + '22',
                border: `1px solid ${COLORS[t.type]}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: COLORS[t.type], fontWeight: 700, flexShrink: 0,
              }}>
                {ICONS[t.type]}
              </span>
              <span style={{
                fontSize: 13, color: '#ccc',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {t.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}