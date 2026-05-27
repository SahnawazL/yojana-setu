/**
 * SplashScreen.jsx — Animated Splash Screen
 * Yojana Sahay — Official Scheme Finder
 *
 * Features:
 *  • Floating patriotic particles (canvas)
 *  • Spinning Ashoka Chakra watermark
 *  • Logo zoom-in with bounce + glow ring pulse
 *  • "Yojana Sahay" typewriter effect
 *  • "Official Scheme Finder" slide-up fade
 *  • Tricolor bar reveal
 *  • Whole screen smooth fade-out
 *
 * Integration → App.jsx:
 *   1. import SplashScreen from "./SplashScreen.jsx";
 *   2. const [splashDone, setSplashDone] = useState(
 *        () => sessionStorage.getItem("ys_splashed") === "1"
 *      );
 *   3. In JSX (very first thing inside your root div):
 *        {!splashDone && (
 *          <SplashScreen onDone={() => {
 *            sessionStorage.setItem("ys_splashed", "1");
 *            setSplashDone(true);
 *          }} />
 *        )}
 *
 * No extra npm install required.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import appLogo from "./logo.webp";

// ─── India Flag Palette ────────────────────────────────────────────────────
const SAFFRON    = "#FF9933";
const IND_GREEN  = "#138808";
const NAVY_BLUE  = "#003580";
const DEEP_BLUE  = "#06038D";

// ─── Timing (ms) ──────────────────────────────────────────────────────────
const T_LOGO_IN      = 0;       // logo zoom starts immediately
const T_TYPE_START   = 900;     // typewriter begins
const T_TAGLINE_IN   = 1750;    // tagline fades in
const T_TRICOLOR_IN  = 2000;    // tricolor bar appears
const T_FADE_OUT     = 3000;    // screen starts fading
const T_DONE         = 3650;    // onDone() fires

// ─── Full Ashoka Chakra (24 spokes) ───────────────────────────────────────
function AshokaChakraSVG({ size = 280 }) {
  const cx = size / 2, cy = size / 2;
  const r  = size / 2 - 4;
  const ir = r * 0.26;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeWidth={size * 0.045} />
      <circle cx={cx} cy={cy} r={ir} fill="white" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15) * (Math.PI / 180);
        return (
          <line key={i}
            x1={cx + ir * Math.cos(a)}      y1={cy + ir * Math.sin(a)}
            x2={cx + r * 0.8 * Math.cos(a)} y2={cy + r * 0.8 * Math.sin(a)}
            stroke="white" strokeWidth={size * 0.038}
          />
        );
      })}
    </svg>
  );
}

// ─── Particle Canvas ──────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Patriotic particle colors
    const COLORS = [
      SAFFRON, SAFFRON, "#FF8C00",
      "#ffffff", "#ffffff",
      IND_GREEN, "#10A010",
      "rgba(255,255,255,0.4)",
    ];

    const particles = Array.from({ length: 55 }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * window.innerHeight,
      r:  Math.random() * 2.8 + 0.8,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.55 + 0.15,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 6;
        ctx.fill();
        ctx.restore();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={ref} style={{
      position: "absolute", inset: 0,
      pointerEvents: "none", zIndex: 0,
    }} />
  );
}

// ─── Main Splash Component ─────────────────────────────────────────────────
export default function SplashScreen({ onDone }) {
  const [typed,       setTyped]       = useState("");
  const [showTagline, setShowTagline] = useState(false);
  const [showBar,     setShowBar]     = useState(false);
  const [pulsing,     setPulsing]     = useState(false);
  const [fadeOut,     setFadeOut]     = useState(false);
  const [logoIn,      setLogoIn]      = useState(false);

  const FULL_TEXT = "Yojana Sahay";

  useEffect(() => {
    // Logo bounce-in
    const t0 = setTimeout(() => setLogoIn(true), T_LOGO_IN + 50);

    // Typewriter
    const t1 = setTimeout(() => {
      let idx = 0;
      const iv = setInterval(() => {
        idx++;
        setTyped(FULL_TEXT.slice(0, idx));
        if (idx >= FULL_TEXT.length) clearInterval(iv);
      }, 72);
      return () => clearInterval(iv);
    }, T_TYPE_START);

    const t2 = setTimeout(() => setShowTagline(true), T_TAGLINE_IN);
    const t3 = setTimeout(() => setShowBar(true),     T_TRICOLOR_IN);
    const t4 = setTimeout(() => setPulsing(true),     T_TRICOLOR_IN + 400);

    const t5 = setTimeout(() => setFadeOut(true),     T_FADE_OUT);
    const t6 = setTimeout(() => onDone?.(),           T_DONE);

    return () => [t0,t1,t2,t3,t4,t5,t6].forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position:   "fixed",
      inset:       0,
      zIndex:      9999,
      display:    "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow:   "hidden",
      background: `linear-gradient(160deg, #001659 0%, ${NAVY_BLUE} 45%, ${DEEP_BLUE} 100%)`,
      opacity:    fadeOut ? 0 : 1,
      transition: fadeOut ? "opacity 0.65s cubic-bezier(0.4,0,0.2,1)" : "none",
    }}>

      {/* Particle layer */}
      <ParticleCanvas />

      {/* Ashoka Chakra watermark */}
      <div style={{
        position:  "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        opacity:    0.045,
        animation: "ys-chakra-spin 16s linear infinite",
        zIndex:     1,
        pointerEvents: "none",
      }}>
        <AshokaChakraSVG size={340} />
      </div>

      {/* ── Main content ── */}
      <div style={{
        position:       "relative",
        zIndex:          2,
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        gap:             0,
      }}>

        {/* Glow ring behind logo */}
        <div style={{
          position:   "relative",
          marginBottom: 24,
        }}>
          {/* Outer pulsing ring */}
          <div style={{
            position:  "absolute",
            inset:     -12,
            borderRadius: 44,
            background: "transparent",
            border:    `2px solid ${SAFFRON}`,
            opacity:    pulsing ? 0 : 0.7,
            transform:  pulsing ? "scale(1.18)" : "scale(1)",
            transition: "opacity 1.2s ease, transform 1.2s ease",
            animation:  pulsing ? "ys-ring-pulse 2.2s ease-in-out infinite" : "none",
          }} />

          {/* Logo box */}
          <div style={{
            width:        130,
            height:       130,
            borderRadius: 30,
            overflow:     "hidden",
            boxShadow:    pulsing
              ? `0 0 0 4px ${SAFFRON}55, 0 0 50px ${SAFFRON}70, 0 0 100px ${SAFFRON}30`
              : `0 0 0 3px ${SAFFRON}40, 0 0 35px ${SAFFRON}55, 0 0 70px rgba(6,3,141,0.4)`,
            transform:    logoIn ? "scale(1)" : "scale(0)",
            opacity:      logoIn ? 1 : 0,
            transition:   "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease, box-shadow 0.6s ease",
            animation:    pulsing ? "ys-logo-pulse 2.2s ease-in-out infinite" : "none",
          }}>
            <img
              src={appLogo}
              alt="Yojana Sahay"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* ── Typewriter: "Yojana Sahay" ── */}
        <div style={{
          fontSize:      33,
          fontWeight:    900,
          color:         "#FFFFFF",
          fontFamily:    "'Noto Sans', sans-serif",
          letterSpacing:  0.5,
          minHeight:     44,
          lineHeight:     1,
          textShadow:   `0 2px 24px ${SAFFRON}55`,
          display:       "flex",
          alignItems:    "center",
          marginBottom:   8,
        }}>
          {typed}
          {/* blinking cursor — hides when typing finishes */}
          <span style={{
            display:      "inline-block",
            width:         2,
            height:       "0.85em",
            background:    SAFFRON,
            marginLeft:    3,
            borderRadius:  1,
            verticalAlign: "middle",
            animation:    "ys-cursor 0.65s steps(1) infinite",
            opacity:       typed.length >= FULL_TEXT.length ? 0 : 1,
            transition:   "opacity 0.3s ease",
          }} />
        </div>

        {/* ── Tagline ── */}
        <div style={{
          fontSize:      14,
          fontWeight:    600,
          color:         "rgba(255,255,255,0.72)",
          fontFamily:    "'Noto Sans', sans-serif",
          letterSpacing:  3.5,
          textTransform: "uppercase",
          opacity:       showTagline ? 1 : 0,
          transform:     showTagline ? "translateY(0)" : "translateY(10px)",
          transition:    "opacity 0.7s ease, transform 0.7s ease",
          marginBottom:   14,
        }}>
          Official Scheme Finder
        </div>

        {/* ── Tricolor bar ── */}
        <div style={{
          display:       "flex",
          width:          160,
          height:          3,
          borderRadius:    3,
          overflow:       "hidden",
          opacity:        showBar ? 1 : 0,
          transform:      showBar ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "left center",
          transition:     "opacity 0.6s ease 0.1s, transform 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s",
        }}>
          <div style={{ flex: 1, background: SAFFRON }} />
          <div style={{ flex: 1, background: "#ffffff" }} />
          <div style={{ flex: 1, background: IND_GREEN }} />
        </div>

      </div>{/* /content */}

      {/* ── India flag dot decoration (bottom corners) ── */}
      <div style={{
        position:  "absolute",
        bottom:     40,
        left:       "50%",
        transform: "translateX(-50%)",
        display:   "flex",
        gap:         8,
        opacity:    showBar ? 0.55 : 0,
        transition: "opacity 1s ease 0.3s",
        zIndex:      2,
      }}>
        {[SAFFRON, "#ffffff", IND_GREEN].map((c, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: "50%",
            background: c,
            boxShadow: `0 0 8px ${c}`,
          }} />
        ))}
      </div>

      {/* ── CSS keyframes ── */}
      <style>{`
        @keyframes ys-chakra-spin {
          from { transform: translate(-50%, -50%) rotate(0deg);   }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ys-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes ys-logo-pulse {
          0%, 100% { transform: scale(1);    }
          50%       { transform: scale(1.05); }
        }
        @keyframes ys-ring-pulse {
          0%   { opacity: 0.7; transform: scale(1);    }
          50%  { opacity: 0;   transform: scale(1.28); }
          100% { opacity: 0.7; transform: scale(1);    }
        }
      `}</style>

    </div>
  );
}
