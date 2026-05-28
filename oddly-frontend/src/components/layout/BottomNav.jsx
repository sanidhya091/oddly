import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { icon: '⌂', label: 'home',     route: '/'        },
  { icon: '✦', label: 'discover', route: '/quiz'    },
  { icon: '♥', label: 'saved',    route: '/profile' },
]

const ROUTE_MAP = {
  '/':            '/',
  '/quiz':        '/quiz',
  '/results':     '/quiz',
  '/taste-match': '/quiz',
  '/serendipity': '/quiz',
  '/chat':        '/quiz',
  '/detail':      '/quiz',
  '/profile':     '/profile',
}

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentBase = ROUTE_MAP[location.pathname] ||
    Object.entries(ROUTE_MAP).find(([path]) =>
      path !== '/' && location.pathname.startsWith(path)
    )?.[1] || '/'

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{
        position: 'fixed',
        bottom: 28,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'rgba(12, 10, 22, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 99,
        padding: '6px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        pointerEvents: 'auto',
      }}>
        {NAV_ITEMS.map(({ icon, label, route }) => {
          const isActive = currentBase === route

          return (
            <motion.button
              key={route}
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(route)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: isActive ? '8px 18px' : '8px 14px',
                borderRadius: 99,
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                transition: 'padding 0.3s ease',
              }}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    style={{
                      position: 'absolute', inset: 0,
                      borderRadius: 99,
                      background: 'rgba(127, 119, 221, 0.15)',
                      border: '1px solid rgba(127, 119, 221, 0.2)',
                      boxShadow: '0 0 16px rgba(127,119,221,0.15)',
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </AnimatePresence>

              <motion.span
                animate={{
                  color: isActive ? '#7F77DD' : 'rgba(255,255,255,0.28)',
                  textShadow: isActive ? '0 0 10px rgba(127,119,221,0.6)' : 'none',
                }}
                transition={{ duration: 0.2 }}
                style={{
                  fontSize: 16, lineHeight: 1, display: 'block',
                  position: 'relative', zIndex: 1,
                }}
              >
                {icon}
              </motion.span>

              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                      fontSize: 11,
                      color: '#7F77DD',
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      display: 'block',
                      position: 'relative', zIndex: 1,
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}