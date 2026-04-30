import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import ThemeToggle from '../components/ThemeToggle'

const styles = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    background: '#080808',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  },
  video: {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    opacity: 0.34,
    filter: 'saturate(0.68) brightness(0.82) contrast(1.04)',
  },
  overlayBase: {
    position: 'fixed',
    inset: 0,
    zIndex: 1,
    background:
      'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(201,24,74,0.22) 0%, transparent 70%),' +
      'radial-gradient(ellipse 60% 40% at 80% 10%, rgba(255,77,109,0.1) 0%, transparent 60%),' +
      'linear-gradient(175deg, rgba(8,8,8,0.38) 0%, rgba(8,8,8,0.7) 58%, rgba(8,8,8,0.88) 100%)',
    pointerEvents: 'none',
  },
  gridOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 2,
    backgroundImage:
      'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),' +
      'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
    backgroundSize: '80px 80px',
    pointerEvents: 'none',
  },
  grain: {
    position: 'fixed',
    inset: 0,
    zIndex: 3,
    opacity: 0.025,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundSize: '200px 200px',
    pointerEvents: 'none',
  },
  shell: {
    position: 'relative',
    zIndex: 10,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 40px',
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    letterSpacing: '0.35em',
    textTransform: 'uppercase',
    color: '#fff',
    opacity: 0.9,
  },
  logoAccent: {
    color: '#c9184a',
  },
  hero: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 24px 80px',
    gap: 0,
  },
  kicker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(201,24,74,0.12)',
    border: '1px solid rgba(201,24,74,0.35)',
    borderRadius: '100px',
    padding: '6px 18px',
    fontSize: '0.72rem',
    fontFamily: "'DM Mono', 'Courier New', monospace",
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#ff6b8a',
    marginBottom: '28px',
    animation: 'fadeSlideUp 0.6s ease both',
  },
  kickerDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#c9184a',
    boxShadow: '0 0 8px #c9184a',
    animation: 'pulse 2s ease infinite',
  },
  h1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(2.6rem, 7vw, 6rem)',
    fontWeight: 700,
    lineHeight: 1.05,
    color: '#fff',
    maxWidth: '820px',
    margin: '0 auto 20px',
    letterSpacing: '-0.01em',
    animation: 'fadeSlideUp 0.7s 0.1s ease both',
  },
  h1Accent: {
    background: 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 50%, #ff6b8a 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtext: {
    fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)',
    color: 'rgba(255,255,255,0.6)',
    maxWidth: '500px',
    lineHeight: 1.65,
    margin: '0 auto 40px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 400,
    animation: 'fadeSlideUp 0.7s 0.2s ease both',
  },
  actions: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '36px',
    animation: 'fadeSlideUp 0.7s 0.3s ease both',
  },
  btnPrimary: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #c9184a 0%, #a4133c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 32px',
    fontSize: '0.9rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 600,
    letterSpacing: '0.04em',
    cursor: 'pointer',
    boxShadow: '0 0 0 1px rgba(201,24,74,0.4), 0 8px 32px rgba(201,24,74,0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  btnLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.75)',
    borderRadius: '12px',
    padding: '14px 28px',
    fontSize: '0.9rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.2s ease, color 0.2s ease',
    cursor: 'pointer',
  },
  chipGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    animation: 'scaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
  },
  chip: (hovered) => ({
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: hovered ? 'rgba(201,24,74,0.18)' : 'rgba(255,255,255,0.04)',
    border: hovered ? '1px solid rgba(201,24,74,0.55)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '100px',
    padding: '12px 26px',
    fontSize: '0.85rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    letterSpacing: '0.05em',
    color: hovered ? '#ff6b8a' : 'rgba(255,255,255,0.72)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(12px)',
  }),
  chipIcon: {
    fontSize: '0.92rem',
    fontWeight: 700,
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    opacity: 0.35,
    fontSize: '0.72rem',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.12em',
    color: '#fff',
    textTransform: 'uppercase',
  },
  orb1: {
    position: 'fixed',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(201,24,74,0.15) 0%, transparent 70%)',
    bottom: '-200px',
    left: '-100px',
    zIndex: 1,
    pointerEvents: 'none',
    filter: 'blur(40px)',
    animation: 'orbFloat 8s ease-in-out infinite',
  },
  orb2: {
    position: 'fixed',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,77,109,0.1) 0%, transparent 70%)',
    top: '-80px',
    right: '-80px',
    zIndex: 1,
    pointerEvents: 'none',
    filter: 'blur(30px)',
    animation: 'orbFloat 6s 2s ease-in-out infinite reverse',
  },
  scanLine: {
    position: 'fixed',
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(201,24,74,0.4), transparent)',
    zIndex: 5,
    pointerEvents: 'none',
    animation: 'scanDown 8s linear infinite',
    opacity: 0.5,
  },
}

const ROLES = [
  { key: 'parent', label: 'Parent Activate', icon: 'P' },
  { key: 'teacher', label: 'Teacher Activate', icon: 'T' },
  { key: 'admin', label: 'Admin Access', icon: 'A' },
]

const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&family=DM+Mono&display=swap');

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.88) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }
  @keyframes orbFloat {
    0%,100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-40px) scale(1.05); }
  }
  @keyframes scanDown {
    0%   { top: -2px; }
    100% { top: 100vh; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  .btn-primary-hover:hover {
    transform: translateY(-2px) scale(1.02) !important;
    box-shadow: 0 0 0 1px rgba(201,24,74,0.6), 0 12px 40px rgba(201,24,74,0.45) !important;
  }
  .btn-primary-hover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
    background-size: 200% 100%;
    animation: shimmer 2.5s ease infinite;
    border-radius: inherit;
  }
  .btn-link-hover:hover {
    background: rgba(255,255,255,0.1) !important;
    color: rgba(255,255,255,0.95) !important;
  }
`

function LandingPage() {
  const [showRoleChoices, setShowRoleChoices] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [hoveredChip, setHoveredChip] = useState(null)
  const [primaryHover, setPrimaryHover] = useState(false)
  const navigate = useNavigate()

  function handleRoleStart(role) {
    setSelectedRole(role)
  }

  function handlePrimaryRoleAction(role) {
    localStorage.setItem('selected_role', role)

    if (role === 'admin') {
      navigate('/login?role=admin')
      return
    }

    navigate(`/activate?role=${role}`)
  }

  function handleSecondaryRoleAction(role) {
    localStorage.setItem('selected_role', role)
    navigate(`/login?role=${role}`)
  }

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={styles.root}>
        <video style={styles.video} autoPlay muted loop playsInline>
          <source src="/landing page video.mp4" type="video/mp4" />
        </video>

        <div style={styles.overlayBase} />
        <div style={styles.gridOverlay} />
        <div style={styles.grain} />
        <div style={styles.orb1} />
        <div style={styles.orb2} />
        <div style={styles.scanLine} />

        <div style={styles.shell}>
          <div style={styles.toolbar}>
            <span style={styles.logo}>
              My<span style={styles.logoAccent}>Shule</span>
            </span>
            <ThemeToggle />
          </div>

          <section style={styles.hero}>
            <div style={styles.kicker}>
              <span style={styles.kickerDot} />
              Education Platform
            </div>

            <h1 style={styles.h1}>
              One platform. <span style={styles.h1Accent}>Three smarter</span>
              <br />
              school experiences.
            </h1>

            <p style={styles.subtext}>
              Choose how you want to access MyShule, built for school admins, teachers, and parents
              in a secure multi-school platform.
            </p>

            <div style={styles.actions}>
              <button
                type="button"
                className="btn-primary-hover"
                style={{
                  ...styles.btnPrimary,
                  transform: primaryHover ? 'translateY(-2px) scale(1.02)' : 'none',
                }}
                onMouseEnter={() => setPrimaryHover(true)}
                onMouseLeave={() => setPrimaryHover(false)}
                onClick={() => setShowRoleChoices((current) => !current)}
              >
                Get Started
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7h10M7 2l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <Link to="/home" className="btn-link-hover" style={styles.btnLink}>
                Learn more
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path
                    d="M1.5 6.5h10M9 3l3.5 3.5L9 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>

            {showRoleChoices && (
              <>
                <div style={styles.chipGroup}>
                  {ROLES.map(({ key, label, icon }) => (
                    <button
                      key={key}
                      type="button"
                      style={styles.chip(hoveredChip === key || selectedRole === key)}
                      onMouseEnter={() => setHoveredChip(key)}
                      onMouseLeave={() => setHoveredChip(null)}
                      onClick={() => handleRoleStart(key)}
                    >
                      <span style={styles.chipIcon}>{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>

                {selectedRole ? (
                  <div style={{ ...styles.actions, marginTop: '20px', marginBottom: 0 }}>
                    <button
                      type="button"
                      className="btn-primary-hover"
                      style={styles.btnPrimary}
                      onClick={() => handlePrimaryRoleAction(selectedRole)}
                    >
                      {selectedRole === 'admin' ? 'Login' : 'Activate Account'}
                    </button>
                    <button
                      type="button"
                      className="btn-link-hover"
                      style={styles.btnLink}
                      onClick={() => handleSecondaryRoleAction(selectedRole)}
                    >
                      {selectedRole === 'admin' ? 'Register School Instead' : 'Login Instead'}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>

        <div style={styles.footer}>
          <span>© 2026 MyShule</span>
          <span>·</span>
          <span>Empowering Schools</span>
        </div>
      </div>
    </>
  )
}

export default LandingPage
