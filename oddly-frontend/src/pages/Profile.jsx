import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getProfile, getSavedItems, getCollections, updateProfile } from '../services/api'
import { useToast } from '../context/ToastContext'
import MoodBackground from '../components/layout/MoodBackground'
import BottomNav from '../components/layout/BottomNav'
import CreateCollectionModal from '../components/CreateCollectionModal'

const CATEGORY_META = {
  book:       { label: 'Book',       color: '#7F77DD', icon: '📖' },
  music:      { label: 'Music',      color: '#D4537E', icon: '🎵' },
  experience: { label: 'Experience', color: '#1D9E75', icon: '🌿' },
  product:    { label: 'Product',    color: '#BA7517', icon: '✦'  },
  film:       { label: 'Film',       color: '#D85A30', icon: '🎬' },
  podcast:    { label: 'Podcast',    color: '#7F77DD', icon: '🎙️' },
}

const ALL_TYPES = ['all', 'book', 'music', 'experience', 'product', 'film', 'podcast']

function SkeletonPulse({ width = '100%', height = 14, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.6s infinite',
      flexShrink: 0, ...style,
    }} />
  )
}

function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px 120px' }}>
      <div style={{ padding: '32px 0 24px', display: 'flex', gap: 18, alignItems: 'center' }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#1a1a1a', animation: 'shimmer 1.6s infinite', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonPulse width="50%" height={18} />
          <SkeletonPulse width="32%" height={12} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: '1 1 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonPulse width="50%" height={20} />
            <SkeletonPulse width="70%" height={9} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '16px', display: 'flex', gap: 14, opacity: 0, animation: `fadeUp 0.3s ease ${i * 60}ms forwards` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#222', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonPulse width="60%" height={13} />
              <SkeletonPulse width="38%" height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Avatar({ name }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
  return (
    <div style={{
      width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #7F77DD 0%, #D4537E 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 24, fontWeight: 700, color: '#fff',
      border: '2px solid rgba(255,255,255,0.1)',
      boxShadow: '0 0 24px rgba(127,119,221,0.3)',
    }}>
      {initials}
    </div>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0,
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '14px 12px',
      display: 'flex', flexDirection: 'column', gap: 5,
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{value}</span>
      <span style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Space Mono', monospace" }}>{label}</span>
    </div>
  )
}

function EditPanel({ user, onSave, onCancel }) {
  const [name, setName] = useState(user.name)
  const [handle, setHandle] = useState(user.handle?.replace('@', '') || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleHandleChange = val =>
    setHandle(val.toLowerCase().replace(/[^a-z0-9_]/g, ''))

  const handleSave = async () => {
    if (!name.trim()) return setError('Name cannot be empty')
    if (handle.length < 3) return setError('Handle must be at least 3 characters')
    setSaving(true); setError(null)
    try {
      await updateProfile({ name: name.trim(), handle })
      setSuccess(true)
      setTimeout(() => onSave({ name: name.trim(), handle: '@' + handle }), 700)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, padding: '11px 14px',
    color: '#fff', fontSize: 14, outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
      style={{
        background: 'rgba(10,8,20,0.92)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '20px',
        position: 'sticky', top: 53, zIndex: 9,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 9, color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#7F77DD'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
        <div>
          <label style={{ fontSize: 9, color: '#555', fontFamily: "'Space Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Handle</label>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}
            onFocusCapture={e => e.currentTarget.style.borderColor = '#7F77DD'}
            onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            <span style={{ padding: '11px 4px 11px 14px', color: '#555', fontSize: 14, fontFamily: "'Space Mono', monospace" }}>@</span>
            <input
              value={handle}
              onChange={e => handleHandleChange(e.target.value)}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, padding: '11px 14px 11px 2px', fontFamily: "'Space Mono', monospace" }}
            />
          </div>
          <p style={{ fontSize: 10, color: '#333', margin: '6px 0 0', fontFamily: "'Space Mono', monospace" }}>
            lowercase · letters · numbers · underscores only
          </p>
        </div>
        {error && <p style={{ fontSize: 12, color: '#D85A30', margin: 0, fontFamily: "'Space Mono', monospace" }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            disabled={saving || success}
            style={{
              flex: 1, padding: '12px',
              background: success ? '#1D9E75' : '#7F77DD',
              border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 12, fontWeight: 600,
              cursor: saving || success ? 'default' : 'pointer',
              fontFamily: "'Space Mono', monospace",
              letterSpacing: '-0.02em',
              transition: 'background 0.2s',
            }}
          >
            {success ? '✓ saved' : saving ? 'saving…' : 'save changes'}
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 20px', background: 'none',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, color: '#555',
              fontSize: 12, cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
            }}
          >cancel</button>
        </div>
      </div>
    </motion.div>
  )
}

function SavedCard({ item, onUnsave, onClick }) {
  const meta = CATEGORY_META[item.type?.toLowerCase()] || CATEGORY_META.book
  return (
    <div onClick={onClick} style={{
      background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, overflow: 'hidden',
      cursor: 'pointer', transition: 'border-color 0.18s, transform 0.18s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = meta.color + '66'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ height: 2, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}44)` }} />
      <div style={{ padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: meta.color + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{meta.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, fontFamily: "'Syne', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
          <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{item.subtitle}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {item.tags?.map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2px 8px', fontSize: 10, color: '#555', fontFamily: "'Space Mono', monospace" }}>{t}</span>
            ))}
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onUnsave(item.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4537E', fontSize: 16, padding: 0, lineHeight: 1, flexShrink: 0 }}>♥</button>
      </div>
    </div>
  )
}

function CollectionCard({ col, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '18px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      cursor: 'pointer', textAlign: 'left',
      transition: 'border-color 0.18s, transform 0.18s',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD66'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: col.color || '#7F77DD' }} />
      <span style={{ fontSize: 26 }}>{col.emoji || '✦'}</span>
      <div>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: "'Syne', sans-serif" }}>{col.name}</div>
        <div style={{ color: '#444', fontSize: 11, marginTop: 3, fontFamily: "'Space Mono', monospace" }}>{col.count || 0} items</div>
      </div>
    </button>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const toast = useToast()

  const [user, setUser] = useState(null)
  const [savedItems, setSavedItems] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('saved')
  const [filterType, setFilterType] = useState('all')
  const [showEdit, setShowEdit] = useState(false)
  const [showModal, setShowModal] = useState(false)   // ← CreateCollectionModal

  async function loadProfile() {
    setLoading(true); setError(null)
    try {
      const [userData, saved, cols] = await Promise.all([getProfile(), getSavedItems(), getCollections()])
      setUser({
        name: userData.name,
        handle: userData.handle,
        joinedDate: new Date(userData.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        stats: {
          saved: userData.savedItems?.length || saved.length,
          collections: userData.collections?.length || cols.length,
          discoveries: userData.discoveries || 0,
          streak: userData.streak || 0,
        },
      })
      setSavedItems(saved)
      setCollections(cols)
    } catch (err) {
      setError("couldn't load your profile.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  const filtered = filterType === 'all'
    ? savedItems
    : savedItems.filter(i => i.type?.toLowerCase() === filterType)

  return (
    <div style={{ minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>
      <MoodBackground mood="home" />
      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(8,6,18,0.7)', backdropFilter: 'blur(20px)',
        }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 20, padding: 0 }}>←</button>
          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.02em' }}>profile</span>
          <button
            onClick={() => setShowEdit(e => !e)}
            style={{
              background: showEdit ? 'rgba(127,119,221,0.15)' : 'none',
              border: `1px solid ${showEdit ? '#7F77DD66' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20, padding: '5px 14px',
              color: showEdit ? '#7F77DD' : '#555',
              fontSize: 11, cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
              transition: 'all 0.2s',
            }}
          >{showEdit ? 'done' : 'edit'}</button>
        </div>

        {/* Edit panel */}
        <AnimatePresence>
          {showEdit && user && (
            <EditPanel
              user={user}
              onSave={updated => {
                setUser(prev => ({ ...prev, ...updated }))
                setShowEdit(false)
                toast('Profile updated ✓')
              }}
              onCancel={() => setShowEdit(false)}
            />
          )}
        </AnimatePresence>

        {loading && <ProfileSkeleton />}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#555', fontSize: 13, fontFamily: "'Space Mono', monospace" }}>
            {error}
            <button onClick={loadProfile} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: '1px solid #D85A30', borderRadius: 12, padding: '10px 20px', color: '#D85A30', fontSize: 12, cursor: 'pointer' }}>try again →</button>
          </div>
        )}

        {!loading && !error && user && (
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px 120px', width: '100%', boxSizing: 'border-box' }}>

            {/* Avatar + name */}
            <div style={{ padding: '32px 0 24px', display: 'flex', gap: 18, alignItems: 'center' }}>
              <Avatar name={user.name} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.03em', fontFamily: "'Syne', sans-serif" }}>{user.name}</div>
                <div style={{ color: '#555', fontSize: 12, marginTop: 3, fontFamily: "'Space Mono', monospace" }}>{user.handle}</div>
                <div style={{ color: '#333', fontSize: 10, marginTop: 6, fontFamily: "'Space Mono', monospace", letterSpacing: '0.06em' }}>
                  MEMBER SINCE {user.joinedDate.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              <StatCard label="Saved"       value={user.stats.saved}         accent="#7F77DD" />
              <StatCard label="Collections" value={user.stats.collections}   accent="#D4537E" />
              <StatCard label="Discovered"  value={user.stats.discoveries}   accent="#1D9E75" />
              <StatCard label="Streak"      value={`${user.stats.streak}🔥`} accent="#BA7517" />
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: 4, marginBottom: 24,
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: 4,
            }}>
              {['saved', 'collections'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  flex: 1, padding: '10px',
                  background: activeTab === tab ? '#7F77DD' : 'transparent',
                  border: 'none', borderRadius: 10,
                  color: activeTab === tab ? '#fff' : '#555',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  transition: 'all 0.18s',
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.04em',
                }}>
                  {tab === 'saved' ? `saved (${savedItems.length})` : `collections (${collections.length})`}
                </button>
              ))}
            </div>

            {/* Saved tab */}
            {activeTab === 'saved' && (
              <div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, scrollbarWidth: 'none' }}>
                  {ALL_TYPES.map(type => {
                    const meta = CATEGORY_META[type]
                    const active = filterType === type
                    return (
                      <button key={type} onClick={() => setFilterType(type)} style={{
                        flexShrink: 0,
                        background: active ? (meta?.color || '#7F77DD') + '22' : 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${active ? (meta?.color || '#7F77DD') + '66' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 20, padding: '5px 13px',
                        color: active ? (meta?.color || '#7F77DD') : '#555',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.15s',
                        fontFamily: "'Space Mono', monospace",
                        textTransform: 'capitalize',
                      }}>
                        {type === 'all' ? 'all' : `${meta.icon} ${meta.label.toLowerCase()}`}
                      </button>
                    )
                  })}
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#333', padding: '60px 0', fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
                    <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>✦</div>
                    {filterType === 'all' ? 'nothing saved yet.' : `no ${filterType}s saved yet.`}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map(item => (
                      <SavedCard
                        key={item.id} item={item}
                        onUnsave={id => { setSavedItems(prev => prev.filter(i => i.id !== id)); toast('Removed from saved', 'info') }}
                        onClick={() => navigate('/detail', { state: { item } })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Collections tab */}
            {activeTab === 'collections' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {collections.map(col => (
                  <CollectionCard key={col.id} col={col} onClick={() => {}} />
                ))}

                {/* New collection button → opens modal */}
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: 'none', border: '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: 16, padding: '18px 16px', color: '#333',
                    fontSize: 12, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 8, minHeight: 110, transition: 'all 0.18s',
                    fontFamily: "'Space Mono', monospace",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#7F77DD66'; e.currentTarget.style.color = '#7F77DD' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#333' }}
                >
                  <span style={{ fontSize: 22 }}>+</span>
                  <span>new collection</span>
                </button>
              </div>
            )}

          </div>
        )}

        <BottomNav />
      </div>

      {/* Create collection modal */}
      {showModal && (
        <CreateCollectionModal
          onClose={() => setShowModal(false)}
          onCreated={(newCol) => {
            setCollections(prev => [newCol, ...prev])
            setUser(prev => ({
              ...prev,
              stats: { ...prev.stats, collections: prev.stats.collections + 1 },
            }))
          }}
        />
      )}
    </div>
  )
}