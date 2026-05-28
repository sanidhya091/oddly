import { useRef, useEffect } from 'react'
import * as THREE from 'three'

// ── Mood configs ──────────────────────────────────────────────────────────────
// Each mood defines: gradient colours, orb colours/positions, particle palette,
// particle speed, particle count, and particle opacity
export const MOODS = {
  home: {
    gradient: 'radial-gradient(ellipse at 50% 0%, #150d2e 0%, #0a0a10 50%, #050507 100%)',
    particles: ['#7F77DD', '#D85A30', '#1D9E75', '#D4537E'],
    orbs: [
      { color: '#7F77DD', x: -14, y: 10,  z: -18, s: 10 },
      { color: '#D4537E', x: 14,  y: -8,  z: -20, s: 12 },
      { color: '#1D9E75', x: 0,   y: -14, z: -22, s: 14 },
    ],
    speed: 0.04,
    opacity: 0.55,
    count: 120,
  },
  quiz: {
  gradient: 'radial-gradient(ellipse at 50% 20%, #0a0e2a 0%, #05080d 50%, #040405 100%)',
  particles: ['#7F77DD', '#a89eff', '#5B8DD9', '#D4537E'],
  orbs: [
    { color: '#7F77DD', x: -10, y: 12,  z: -18, s: 12 },
    { color: '#5B8DD9', x: 14,  y: -6,  z: -22, s: 10 },
    { color: '#a89eff', x: 2,   y: -16, z: -20, s: 8  },
  ],
  speed: 0.06,
  opacity: 0.5,
  count: 100,
},
  serendipity: {
    // Teal / green — unexpected, alive, natural
    gradient: 'radial-gradient(ellipse at 30% 60%, #031a12 0%, #040d0a 50%, #030605 100%)',
    particles: ['#1D9E75', '#0d7a5a', '#2dd4a0', '#7F77DD'],
    orbs: [
      { color: '#1D9E75', x: -16, y: 8,   z: -20, s: 14 },
      { color: '#0d7a5a', x: 12,  y: -10, z: -18, s: 10 },
      { color: '#2dd4a0', x: -4,  y: -18, z: -24, s: 8  },
    ],
    speed: 0.03,
    opacity: 0.45,
    count: 90,
  },
  taste: {
    // Coral / orange — discovery, hunger, fire
    gradient: 'radial-gradient(ellipse at 70% 30%, #250c04 0%, #0e0704 50%, #050404 100%)',
    particles: ['#D85A30', '#BA7517', '#F0997B', '#D4537E'],
    orbs: [
      { color: '#D85A30', x: 16,  y: 6,   z: -16, s: 13 },
      { color: '#BA7517', x: -12, y: -8,  z: -22, s: 11 },
      { color: '#F0997B', x: 4,   y: 14,  z: -20, s: 7  },
    ],
    speed: 0.055,
    opacity: 0.5,
    count: 100,
  },
  chat: {
    // Pink / purple — intimate, conversational, late night
    gradient: 'radial-gradient(ellipse at 40% 70%, #1e0515 0%, #0d0309 50%, #050305 100%)',
    particles: ['#D4537E', '#7F77DD', '#a89eff', '#D85A30'],
    orbs: [
      { color: '#D4537E', x: -8,  y: 14,  z: -18, s: 11 },
      { color: '#7F77DD', x: 14,  y: -4,  z: -22, s: 13 },
      { color: '#a89eff', x: -2,  y: -16, z: -20, s: 8  },
    ],
    speed: 0.025,
    opacity: 0.4,
    count: 80,
  },
  results: {
    // Purple — discovery, reveal, magic
    gradient: 'radial-gradient(ellipse at 50% 40%, #160d2e 0%, #0a0810 50%, #050507 100%)',
    particles: ['#7F77DD', '#a89eff', '#D4537E', '#1D9E75'],
    orbs: [
      { color: '#7F77DD', x: -12, y: 10,  z: -18, s: 13 },
      { color: '#a89eff', x: 14,  y: -8,  z: -22, s: 9  },
      { color: '#D4537E', x: 0,   y: -14, z: -20, s: 11 },
    ],
    speed: 0.035,
    opacity: 0.5,
    count: 110,
  },
}

export default function MoodBackground({ mood = 'home' }) {
  const mountRef = useRef(null)
  const config = MOODS[mood] || MOODS.home

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const w = mount.clientWidth, h = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Particles ─────────────────────────────────────────────────────────────
    const count = config.count
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = config.particles.map(c => new THREE.Color(c))

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 70
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.22, vertexColors: true,
      transparent: true, opacity: config.opacity,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    // ── Orbs ──────────────────────────────────────────────────────────────────
    const orbs = config.orbs.map(({ color, x, y, z, s }) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(1, 16, 16),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07 })
      )
      m.position.set(x, y, z)
      m.scale.setScalar(s)
      scene.add(m)
      return m
    })

    // ── Mouse ─────────────────────────────────────────────────────────────────
    let mx = 0, my = 0
    const onMouse = e => {
      mx = e.clientX / window.innerWidth - 0.5
      my = -(e.clientY / window.innerHeight - 0.5)
    }
    const onResize = () => {
      const nw = mount.clientWidth, nh = mount.clientHeight
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      renderer.setSize(nw, nh)
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('resize', onResize)

    // ── Animation ─────────────────────────────────────────────────────────────
    let animId
    const clock = new THREE.Clock()
    const speed = config.speed

    const animate = () => {
      animId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      particles.rotation.y = t * speed + mx * 0.08
      particles.rotation.x = t * (speed * 0.25) + my * 0.05
      particles.rotation.z = t * (speed * 0.375)

      orbs.forEach((orb, i) => {
        orb.position.y += Math.sin(t * 0.4 + i * 1.8) * 0.008
        orb.position.x += Math.cos(t * 0.3 + i * 2.4) * 0.005
      })

      mat.opacity = (config.opacity - 0.1) + Math.sin(t * 0.6) * 0.1

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [mood]) // re-init when mood changes

  return (
    <>
      {/* CSS gradient layer */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: config.gradient,
        transition: 'background 1s ease',
      }} />
      {/* Three.js layer */}
      <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
    </>
  )
}