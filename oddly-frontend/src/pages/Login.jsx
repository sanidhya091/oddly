import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── Particle canvas background ──────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const HUES = [248, 20, 160, 330]; // purple, coral, teal, pink

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function spawn() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        o: Math.random() * 0.4 + 0.1,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: 90 }, spawn);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 75%, ${p.o})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        const { width: W, height: H } = canvas;
        if (p.x < -5 || p.x > W + 5 || p.y < -5 || p.y > H + 5) {
          Object.assign(p, spawn(), {
            x: Math.random() * W,
            y: Math.random() * H,
          });
        }
      }
      animId = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    init();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}

// ── Mood chips shown on register tab ────────────────────────────────────────
const MOOD_CHIPS = [
  { label: "deeply weird",      color: "purple" },
  { label: "obsessively niche", color: "coral"  },
  { label: "quietly strange",   color: "teal"   },
  { label: "beautifully lost",  color: "pink"   },
];

const CHIP_STYLES = {
  purple: { border: "rgba(127,119,221,0.4)", color: "#a8a3f0", bg: "rgba(127,119,221,0.08)" },
  coral:  { border: "rgba(216,90,48,0.4)",   color: "#e8855a", bg: "rgba(216,90,48,0.08)"   },
  teal:   { border: "rgba(29,158,117,0.4)",  color: "#3dcca0", bg: "rgba(29,158,117,0.08)"  },
  pink:   { border: "rgba(212,83,126,0.4)",  color: "#e07ea8", bg: "rgba(212,83,126,0.08)"  },
};

// ── Main component ───────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // login fields
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // register fields
  const [regName, setRegName]         = useState("");
  const [regEmail, setRegEmail]       = useState("");
  const [regPassword, setRegPassword] = useState("");

  function switchTab(t) {
    setTab(t);
    setError("");
  }

  // ── Auth handlers ──────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      <div style={S.root}>
        <ParticleCanvas />

        {/* Radial purple glow */}
        <div style={S.radial} />

        <div style={S.wrap}>
          {/* Logo */}
          <div style={S.logo}>oddly.</div>
          <div style={S.tagline}>a discovery engine for the uniquely curious</div>

          {/* Card */}
          <div style={S.card}>

            {/* Tab switcher */}
            <div style={S.tabs}>
              <button
                style={{ ...S.tab, ...(tab === "login"    ? S.tabActive : {}) }}
                onClick={() => switchTab("login")}
              >
                Sign in
              </button>
              <button
                style={{ ...S.tab, ...(tab === "register" ? S.tabActive : {}) }}
                onClick={() => switchTab("register")}
              >
                Create account
              </button>
            </div>

            {/* Error banner */}
            {error && <div style={S.errorBanner}>{error}</div>}

            {/* ── LOGIN PANEL ── */}
            {tab === "login" && (
              <form onSubmit={handleLogin}>
                <Field label="Email">
                  <input
                    style={S.input}
                    type="email"
                    placeholder="you@somewhere.odd"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>

                <Field label="Password">
                  <input
                    style={S.input}
                    type="password"
                    placeholder="············"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </Field>

                <button type="button" style={S.forgot}>forgot password?</button>

                <SubmitBtn loading={loading}>Enter the void →</SubmitBtn>
              </form>
            )}

            {/* ── REGISTER PANEL ── */}
            {tab === "register" && (
              <form onSubmit={handleRegister}>
                <div style={S.subLabel}>What kind of curious are you?</div>
                <div style={S.chips}>
                  {MOOD_CHIPS.map((c) => (
                    <span key={c.label} style={{ ...S.chip, ...chipStyle(c.color) }}>
                      {c.label}
                    </span>
                  ))}
                </div>

                <Field label="Name or handle">
                  <input
                    style={S.input}
                    type="text"
                    placeholder="what do they call you"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </Field>

                <Field label="Email">
                  <input
                    style={S.input}
                    type="email"
                    placeholder="you@somewhere.odd"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>

                <Field label="Password">
                  <input
                    style={S.input}
                    type="password"
                    placeholder="make it strange"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </Field>

                <SubmitBtn loading={loading}>Begin discovering →</SubmitBtn>
              </form>
            )}

            {/* Hint */}
            <div style={S.hint}>
              {tab === "login" ? (
                <>New here?{" "}<span style={S.hintLink} onClick={() => switchTab("register")}>Create an account</span></>
              ) : (
                <>Already have one?{" "}<span style={S.hintLink} onClick={() => switchTab("login")}>Sign in</span></>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Input focus styles (can't do :focus in inline styles) */}
      <style>{`
        input[data-oddly]:focus {
          border-color: rgba(127,119,221,0.5) !important;
          background: rgba(127,119,221,0.06) !important;
          outline: none;
        }
        input[data-oddly]::placeholder { color: rgba(255,255,255,0.18); }
      `}</style>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1 }}
    >
      {loading ? "one moment..." : children}
    </button>
  );
}

// ── Style helpers ────────────────────────────────────────────────────────────
function chipStyle(color) {
  const c = CHIP_STYLES[color];
  return {
    borderColor: c.border,
    color: c.color,
    background: c.bg,
  };
}

// ── Style objects ─────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: "#0d0d0d",
    fontFamily: "'DM Sans', sans-serif",
    color: "#fff",
    overflow: "hidden",
    position: "relative",
  },
  radial: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(127,119,221,0.18) 0%, transparent 70%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  wrap: {
    position: "relative",
    zIndex: 2,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
  },
  logo: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "2rem",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    color: "#fff",
    marginBottom: "0.25rem",
  },
  tagline: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.6rem",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "2.5rem",
    textAlign: "center",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRadius: "20px",
    padding: "2rem",
    width: "100%",
    maxWidth: "380px",
  },
  tabs: {
    display: "flex",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "10px",
    padding: "4px",
    marginBottom: "1.75rem",
    gap: 0,
  },
  tab: {
    flex: 1,
    padding: "0.5rem",
    border: "1px solid transparent",
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: "7px",
    transition: "all 0.2s ease",
  },
  tabActive: {
    background: "rgba(127,119,221,0.22)",
    color: "#a8a3f0",
    borderColor: "rgba(127,119,221,0.3)",
  },
  errorBanner: {
    background: "rgba(216,90,48,0.12)",
    border: "1px solid rgba(216,90,48,0.3)",
    borderRadius: "8px",
    padding: "0.6rem 0.9rem",
    fontSize: "0.8rem",
    color: "#e8855a",
    marginBottom: "1rem",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.02em",
  },
  label: {
    display: "block",
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.6rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    marginBottom: "0.45rem",
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "10px",
    padding: "0.7rem 0.9rem",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.9rem",
    transition: "border-color 0.2s ease, background 0.2s ease",
    // focus handled by injected <style>
  },
  subLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.6rem",
    color: "rgba(255,255,255,0.25)",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "0.6rem",
  },
  chips: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginBottom: "1.25rem",
  },
  chip: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.6rem",
    padding: "0.3rem 0.65rem",
    borderRadius: "100px",
    border: "1px solid",
    letterSpacing: "0.05em",
    opacity: 0.75,
  },
  btnPrimary: {
    width: "100%",
    padding: "0.8rem",
    background: "#7F77DD",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontFamily: "'Syne', sans-serif",
    fontSize: "0.95rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    marginTop: "0.5rem",
    transition: "opacity 0.2s, transform 0.15s",
  },
  forgot: {
    display: "block",
    textAlign: "right",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.75rem",
    color: "rgba(127,119,221,0.7)",
    marginTop: "-0.5rem",
    marginBottom: "1rem",
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
  },
  hint: {
    textAlign: "center",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.22)",
    marginTop: "1.25rem",
  },
  hintLink: {
    color: "rgba(127,119,221,0.8)",
    cursor: "pointer",
  },
};