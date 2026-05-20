// AIChat.jsx — YojanaSetu AI Assistant Chat Screen
// UPDATED: unified "Reading Time" cooldown gates both input + chips together
// FIXED (5 bugs): anti-pattern in updater, memory leaks, dead state, stale closure

import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage } from "./groqClient.js";

const THEME = {
  light: {
    appBg:"#f5f5f0", card:"#fff",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#f0f0f0", border2:"#e8e8e8",
    inputBg:"#fff", navBg:"#fff",
  },
  dark: {
    appBg:"#111111", card:"#1c1c1e",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", border2:"#3a3a3c",
    inputBg:"#2c2c2e", navBg:"#1c1c1e",
  },
};

const fontFamily = (lang) =>
  lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

const SUGGESTED = {
  en: [
    { icon:"🌾", text:"Schemes for farmers" },
    { icon:"📚", text:"Student scholarships available" },
    { icon:"🏠", text:"Housing schemes for poor families" },
    { icon:"👩", text:"Schemes for women welfare" },
    { icon:"💼", text:"Business loan schemes" },
    { icon:"👴", text:"Senior citizen pension schemes" },
  ],
  hi: [
    { icon:"🌾", text:"किसानों के लिए योजनाएं" },
    { icon:"📚", text:"छात्रवृत्ति योजनाएं" },
    { icon:"🏠", text:"गरीबों के लिए आवास योजना" },
    { icon:"👩", text:"महिला कल्याण योजनाएं" },
    { icon:"💼", text:"व्यापार लोन योजनाएं" },
    { icon:"👴", text:"वरिष्ठ नागरिक पेंशन" },
  ],
};

// ─── READING TIME: dynamic cooldown based on reply length ─────────────────────
// Slower rural readers → ~2.5 words/sec. Min 10s, Max 15s.
function calcReadingTime(replyText) {
  const words = replyText.trim().split(/\s+/).length;
  const secs  = Math.round(words / 2.5);
  return Math.max(10, Math.min(15, secs));
}

const GLOBAL_CSS = `
@keyframes bubble-in {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes bubble-in-user {
  0%   { opacity:0; transform:translateX(16px) scale(0.91); }
  55%  { opacity:1; transform:translateX(-4px) scale(1.025); }
  78%  { transform:translateX(2px) scale(0.988); }
  100% { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes bubble-in-ai {
  0%   { opacity:0; transform:translateX(-16px) scale(0.91); }
  55%  { opacity:1; transform:translateX(4px) scale(1.025); }
  78%  { transform:translateX(-2px) scale(0.988); }
  100% { opacity:1; transform:translateX(0) scale(1); }
}
@keyframes fade-in {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes chip-out {
  0%   { opacity:1;   transform:scale(1); }
  55%  { opacity:0.2; transform:scale(0.82); }
  100% { opacity:0;   transform:scale(0.68); }
}
@keyframes chip-in {
  0%   { opacity:0;   transform:translateY(20px) scale(0.75); }
  55%  { opacity:1;   transform:translateY(-6px) scale(1.07); }
  75%  { opacity:1;   transform:translateY(2px)  scale(0.97); }
  100% { opacity:1;   transform:translateY(0)    scale(1);    }
}
@keyframes shimmer {
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
}
@keyframes focus-glow {
  0%,100% { box-shadow: 0 0 0 3px rgba(255,153,51,0.15); }
  50%      { box-shadow: 0 0 0 4px rgba(255,153,51,0.28); }
}
@keyframes avatar-pulse {
  0%,100% { transform: scale(1); }
  50%      { transform: scale(1.12); }
}
@keyframes chips-reveal {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes unlock-bounce {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.18); }
  70%  { transform: scale(0.93); }
  100% { transform: scale(1); }
}
@keyframes typing-cursor {
  0%,100% { opacity: 1; }
  50%      { opacity: 0; }
}
@keyframes gradient-border-breathe {
  0%,100% { opacity: 0.75; }
  50%      { opacity: 1; }
}
@keyframes badge-pop {
  0%   { opacity:0; transform:scale(0.7) translateY(3px); }
  65%  { opacity:1; transform:scale(1.08) translateY(-1px); }
  100% { opacity:1; transform:scale(1) translateY(0); }
}
@keyframes header-fade {
  from { opacity:0; transform:translateY(-4px); }
  to   { opacity:1; transform:translateY(0); }
}
.ai-msg-bubble      { animation: bubble-in 0.22s ease-out; }
.ai-msg-bubble-user { animation: bubble-in-user 0.38s ease-out; }
.ai-msg-bubble-ai   { animation: bubble-in-ai 0.38s ease-out; }
.ai-suggested:active { opacity:0.7; transform:scale(0.98); }
.ai-send-btn:active  { opacity:0.85; transform:scale(0.95); }
.ai-textarea:focus   { outline:none; box-shadow: 0 0 0 3px rgba(255,153,51,0.2); animation: focus-glow 2s ease-in-out infinite; }
.ai-avatar-pulse     { animation: avatar-pulse 1.4s ease-in-out infinite; }
.chips-container     { animation: chips-reveal 0.3s ease-out; }
.unlock-bounce       { animation: unlock-bounce 0.4s ease-out; }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

// ─── ASHOK CHAKRA SVG ────────────────────────────────────────────────────────
// Real 24-spoke Dharma Chakra with lens-shaped arrowheads between spokes.
// Rendered as inline SVG so it's crisp at any DPR; spins via CSS.
function AshokChakra({ size = 24, color = "rgba(255,255,255,0.9)", duration = "10s" }) {
  const n   = 24;          // 24 spokes — canonical Ashoka Chakra
  const cx  = 50, cy = 50; // SVG centre (viewBox 0 0 100 100)
  const toRad = d => (d * Math.PI) / 180;

  // Geometry — all values in SVG units (viewBox 100×100)
  const rimOuter  = 46;  // outer edge of the thick rim ring
  const rimInner  = 37;  // inner edge of the rim / tip of spokes
  const hubR      = 7;   // solid hub circle
  const spokeFrom = hubR + 2.5; // spokes start just outside hub

  // 24 evenly spaced spokes
  const spokes = Array.from({ length: n }, (_, i) => {
    const a = toRad(i * (360 / n) - 90); // start from 12 o'clock
    return {
      x1: cx + spokeFrom * Math.cos(a),
      y1: cy + spokeFrom * Math.sin(a),
      x2: cx + rimInner  * Math.cos(a),
      y2: cy + rimInner  * Math.sin(a),
    };
  });

  // 24 lens/leaf arrowheads — one between each consecutive pair of spokes,
  // sitting inside the rim band (between rimInner and rimOuter).
  const leaves = Array.from({ length: n }, (_, i) => {
    const angleDeg = i * (360 / n) + (360 / n / 2) - 90; // midpoint angle
    const a  = toRad(angleDeg);
    const tr = (rimInner + rimOuter) / 2; // ~41.5 — centre of rim band
    return {
      cx:  cx + tr * Math.cos(a),
      cy:  cy + tr * Math.sin(a),
      rot: angleDeg + 90, // rotate so leaf lies tangent to circle
    };
  });

  return (
    <div style={{
      display:"inline-flex", flexShrink:0,
      animation:`spin ${duration} linear infinite`,
    }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Thick outer rim */}
        <circle cx={cx} cy={cy} r={rimOuter}
          fill="none" stroke={color} strokeWidth="7" />
        {/* Thin inner rim line */}
        <circle cx={cx} cy={cy} r={rimInner}
          fill="none" stroke={color} strokeWidth="1.8" />
        {/* Solid hub */}
        <circle cx={cx} cy={cy} r={hubR} fill={color} />
        {/* 24 spokes */}
        {spokes.map((s, i) => (
          <line key={i}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={color} strokeWidth="2.4" strokeLinecap="round"
          />
        ))}
        {/* 24 lens-shaped arrowheads between spokes inside the rim band */}
        {leaves.map((l, i) => (
          <g key={i} transform={`translate(${l.cx},${l.cy}) rotate(${l.rot})`}>
            {/* Symmetric lens: pointed top & bottom, curved left & right */}
            <path d="M 0,-5.5 Q 4,0 0,5.5 Q -4,0 0,-5.5 Z" fill={color} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function TypingIndicator({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const shimmerBg = dark
    ? "linear-gradient(90deg, #2c2c2e 25%, #3a3a3c 50%, #2c2c2e 75%)"
    : "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)";
  const shimmerBase = {
    backgroundSize: "300% 100%",
    animation: "shimmer 1.6s ease-in-out infinite",
    borderRadius: 6,
  };
  return (
    <div className="ai-msg-bubble"
      style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:14 }}>
      <div className="ai-avatar-pulse" style={{
        width:32, height:32, borderRadius:"50%", flexShrink:0,
        background:"linear-gradient(135deg,#FF9933 0%,#003580 100%)",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
      }}>🤖</div>
      <div style={{
        background: th.card,
        border:`1.5px solid ${th.border2}`,
        borderRadius:"18px 18px 18px 4px",
        padding:"14px 18px",
        boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
        display:"flex", flexDirection:"column", gap:9,
        minWidth:160,
      }}>
        <div style={{ height:11, width:"72%", background:shimmerBg, ...shimmerBase }} />
        <div style={{ height:11, width:"45%", background:shimmerBg, ...shimmerBase,
          animationDelay:"0.2s" }} />
      </div>
    </div>
  );
}

// ─── READING TIME BAR ─────────────────────────────────────────────────────────
// Replaces the normal input UI while cooldown is active
function ReadingTimeBar({ secondsLeft, totalSeconds, dark, lang }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  // pct goes from 100 → 0 as secondsLeft decreases
  const pct = (secondsLeft / totalSeconds) * 100;

  // Colour shifts orange → green as it nears completion
  const r  = Math.round(255 * (pct / 100));
  const g  = Math.round(200 * (1 - pct / 100)) + 55;
  const barColor = `rgb(${r},${g},51)`;

  const label = isHindi
    ? `📖 जवाब पढ़ें — ${secondsLeft}s बाद टाइप कर सकते हैं`
    : `📖 Read the answer — you can type in ${secondsLeft}s`;

  return (
    <div style={{
      background: th.navBg,
      borderTop:`1.5px solid ${th.border}`,
      padding:"10px 14px 16px",
      flexShrink:0,
      boxShadow: dark
        ? "0 -4px 20px rgba(0,0,0,0.3)"
        : "0 -4px 20px rgba(0,0,0,0.07)",
    }}>
      {/* Label row */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        marginBottom:9,
      }}>
        <span style={{
          fontSize:12, fontFamily:bf, color:th.textMid,
          fontWeight:500,
        }}>
          {label}
        </span>
        {/* Big countdown ring */}
        <div style={{
          width:38, height:38, borderRadius:"50%", flexShrink:0,
          border:`3px solid ${th.border2}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:800,
          color: secondsLeft <= 3 ? "#22c55e" : "#FF9933",
          background: th.card,
          boxShadow: secondsLeft <= 3
            ? "0 0 0 2px rgba(34,197,94,0.25)"
            : "0 0 0 2px rgba(255,153,51,0.15)",
          transition:"color 0.4s, box-shadow 0.4s",
          fontFamily: "monospace",
        }}>
          {secondsLeft}
        </div>
      </div>

      {/* Draining progress bar */}
      <div style={{
        height:5, background:th.border2, borderRadius:6, overflow:"hidden",
      }}>
        <div style={{
          height:"100%",
          width:`${pct}%`,
          background:`linear-gradient(90deg, ${barColor}, #FF9933)`,
          borderRadius:6,
          transition:"width 0.95s linear, background 0.5s",
        }} />
      </div>

      <div style={{
        fontSize:10, color:th.textSub, textAlign:"center",
        marginTop:7, fontFamily:bf, lineHeight:1.5,
      }}>
        {isHindi
          ? "AI गलती कर सकता है · हमेशा सरकारी वेबसाइट से पुष्टि करें"
          : "AI may make mistakes · Always verify on official government websites"}
      </div>
    </div>
  );
}

// ─── NORMAL INPUT BAR ─────────────────────────────────────────────────────────
function InputBar({ input, setInput, onSend, onKeyDown, loading, dark, lang, textareaRef, justUnlocked }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  const canSend = input.trim().length > 0 && !loading;

  return (
    <div style={{
      background: th.navBg,
      borderTop:`1.5px solid ${th.border}`,
      padding:"10px 14px 16px",
      flexShrink:0,
      boxShadow: dark
        ? "0 -4px 20px rgba(0,0,0,0.3)"
        : "0 -4px 20px rgba(0,0,0,0.07)",
    }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
        <textarea
          ref={textareaRef}
          className="ai-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isHindi ? "कोई भी सवाल पूछें..." : "Ask anything about schemes..."}
          rows={1}
          style={{
            flex:1,
            border:`1.5px solid ${input ? "#FF9933" : th.border2}`,
            borderRadius:14,
            padding:"11px 14px",
            fontSize:14, fontFamily:bf, color:th.text,
            background:th.inputBg,
            outline:"none", resize:"none",
            lineHeight:1.5,
            maxHeight:100, overflowY:"auto",
            transition:"border-color 0.2s, box-shadow 0.2s",
            display:"block",
          }}
        />
        <div
          className={`ai-send-btn${justUnlocked ? " unlock-bounce" : ""}`}
          onClick={() => onSend()}
          style={{
            width:46, height:46, borderRadius:14, flexShrink:0,
            background: canSend
              ? "linear-gradient(135deg,#FF9933,#FF8000)"
              : th.border2,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor: canSend ? "pointer" : "default",
            boxShadow: canSend ? "0 4px 16px rgba(255,153,51,0.45)" : "none",
            transition:"all 0.2s",
            fontSize:18,
          }}>
          {loading
            ? <span style={{ fontSize:14 }}>⏳</span>
            : <span style={{ color: canSend ? "#fff" : th.textSub, fontWeight:700 }}>➤</span>
          }
        </div>
      </div>
      <div style={{
        fontSize:10, color:th.textSub, textAlign:"center",
        marginTop:7, fontFamily:bf, lineHeight:1.5,
      }}>
        {isHindi
          ? "AI गलती कर सकता है · हमेशा सरकारी वेबसाइट से पुष्टि करें"
          : "AI may make mistakes · Always verify on official government websites"}
      </div>
    </div>
  );
}

// ─── Feature 10: Markdown renderer ───────────────────────────────────────────
// renderInline handles bold (**text**) and clickable links within a single line.
function renderInline(line, lineIdx, isUser, th) {
  const parts = [];
  const regex = /\*\*(.*?)\*\*|(https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
  let last = 0; let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`b-${lineIdx}-${match.index}`} style={{ fontWeight:700 }}>
          {match[1]}
        </strong>
      );
    } else {
      const raw  = match[2];
      const href = raw.startsWith("http") ? raw : `https://${raw}`;
      parts.push(
        isUser ? (
          // User bubble — light gold underline (on dark blue bg)
          <a key={`l-${lineIdx}-${match.index}`} href={href} target="_blank" rel="noopener noreferrer"
            style={{ color:"#ffe0a0", textDecoration:"underline", wordBreak:"break-all" }}>
            {raw}
          </a>
        ) : (
          // AI bubble — premium pill badge (readable on glassmorphism surface)
          <a key={`l-${lineIdx}-${match.index}`} href={href} target="_blank" rel="noopener noreferrer"
            style={{
              display:"inline-flex", alignItems:"center", gap:3,
              background:"rgba(0,53,128,0.08)",
              border:"1px solid rgba(0,53,128,0.22)",
              borderRadius:5,
              padding:"1px 7px",
              color:"#003580",
              textDecoration:"none",
              fontWeight:600,
              fontSize:"0.88em",
              wordBreak:"break-all",
              verticalAlign:"middle",
              lineHeight:1.5,
            }}>
            {raw}
            <span style={{ fontSize:9, opacity:0.55, flexShrink:0 }}>↗</span>
          </a>
        )
      );
    }
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

// renderContent handles block-level structure: numbered lists, bullet lists,
// empty-line spacers, and falls back to inline rendering for regular text.
function renderContent(text, isUser, th) {
  const lines  = text.split("\n");
  const result = [];

  lines.forEach((line, li) => {
    const numberedMatch = line.match(/^(\d+)\.\s+([\s\S]*)/);
    const bulletMatch   = line.match(/^[-•*]\s+([\s\S]*)/);
    const isLast        = li === lines.length - 1;

    // ── Numbered list item ─────────────────────────────────────────────────
    if (numberedMatch) {
      const [, num, content] = numberedMatch;
      result.push(
        <div key={`line-${li}`} style={{
          display:"flex", gap:9, alignItems:"flex-start",
          marginTop: li === 0 ? 0 : 6,
          marginBottom: isLast ? 0 : 1,
        }}>
          {/* Circle number badge */}
          <span style={{
            minWidth:20, height:20, borderRadius:"50%", flexShrink:0,
            background: isUser ? "rgba(255,255,255,0.22)" : "rgba(255,153,51,0.15)",
            color: isUser ? "#fff" : "#FF8000",
            fontSize:10, fontWeight:800, lineHeight:1,
            display:"flex", alignItems:"center", justifyContent:"center",
            marginTop:3,
          }}>
            {num}
          </span>
          <span style={{ flex:1, lineHeight:1.65 }}>
            {renderInline(content, li, isUser, th)}
          </span>
        </div>
      );
      return;
    }

    // ── Bullet list item ───────────────────────────────────────────────────
    if (bulletMatch) {
      const [, content] = bulletMatch;
      result.push(
        <div key={`line-${li}`} style={{
          display:"flex", gap:9, alignItems:"flex-start",
          marginTop: li === 0 ? 0 : 5,
          marginBottom: isLast ? 0 : 1,
        }}>
          {/* Dot */}
          <span style={{
            color: isUser ? "rgba(255,255,255,0.65)" : "#FF9933",
            fontSize:15, lineHeight:1, flexShrink:0, marginTop:4,
          }}>
            •
          </span>
          <span style={{ flex:1, lineHeight:1.65 }}>
            {renderInline(content, li, isUser, th)}
          </span>
        </div>
      );
      return;
    }

    // ── Empty line → small spacer ──────────────────────────────────────────
    if (line.trim() === "") {
      result.push(<div key={`line-${li}`} style={{ height:5 }} />);
      return;
    }

    // ── Regular text line ──────────────────────────────────────────────────
    result.push(
      <span key={`line-${li}`}>
        {renderInline(line, li, isUser, th)}
        {!isLast && "\n"}
      </span>
    );
  });

  return result;
}

function FollowUpChips({ chips, onTap, lang, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const [exitingIdx, setExitingIdx] = useState(null);

  // Match the same glass surface used by AI bubbles so chips
  // blend with appBg instead of popping out as solid white cards.
  const glassCard = dark
    ? "rgba(28,28,30,0.72)"
    : "rgba(255,255,255,0.72)";

  const handleChipTap = (chip, i) => {
    if (exitingIdx !== null) return;
    setExitingIdx(i);
    setTimeout(() => onTap(chip), 270);
  };

  return (
    <div className="chips-container" style={{
      display:"flex", flexWrap:"wrap", gap:8,
      paddingLeft:34, marginTop:-6, marginBottom:14,
    }}>
      {chips.map((chip, i) => (
        <div key={i} onClick={() => handleChipTap(chip, i)}
          style={{
            // FIX 1: Match AI bubble gradient border (orange → purple → navy)
            // instead of the previous plain solid #FF9933 border.
            background: `linear-gradient(${glassCard}, ${glassCard}) padding-box,
                         linear-gradient(135deg,#FF9933 0%,#6366f1 50%,#003580 100%) border-box`,
            border: "1.5px solid transparent",

            // FIX 2: Glass blur so the chip surface matches the bubble's
            // glassmorphism and sits naturally on the cream appBg (#f5f5f0).
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",

            borderRadius: 20,
            padding: "7px 13px",
            fontSize: 12, fontFamily: bf,

            // FIX 2: Theme-aware color instead of hardcoded #FF9933,
            // consistent with how the AI bubble header text is coloured.
            // Deep navy in light (matches bubble gradient endpoint #003580),
            // soft indigo in dark (readable against dark card surface).
            color: dark ? "#a5b4fc" : "#003580",

            cursor: exitingIdx !== null ? "default" : "pointer",
            fontWeight: 600,
            boxShadow: dark
              ? "0 2px 10px rgba(255,153,51,0.18), 0 1px 4px rgba(0,0,0,0.35)"
              : "0 2px 8px rgba(255,153,51,0.18), 0 1px 4px rgba(0,0,0,0.07)",
            animation: exitingIdx === i
              ? "chip-out 0.27s ease-in forwards"
              : `chip-in 0.52s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.22}s both`,
            opacity: exitingIdx !== null && exitingIdx !== i ? 0.35 : 1,
            transition: exitingIdx !== null && exitingIdx !== i
              ? "opacity 0.22s ease-out"
              : "opacity 0.15s, transform 0.15s",
          }}>
          {chip}
        </div>
      ))}
    </div>
  );
}

function ChatBubble({ msg, lang, dark, isNew }) {
  const th     = THEME[dark ? "dark" : "light"];
  const bf     = fontFamily(lang);
  const isUser = msg.role === "user";

  // ── Feature 2: Typewriter animation for new AI messages ───────────────────
  const shouldAnimate = isNew && !isUser;
  const [displayed, setDisplayed] = useState(shouldAnimate ? "" : msg.content);
  const [isDone,    setIsDone]    = useState(!shouldAnimate);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!shouldAnimate) return;
    const text = msg.content;
    let i = 0;
    // ~18ms/char ≈ 55 chars/sec — fast & premium feeling
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timerRef.current);
        setIsDone(true);
      }
    }, 18);
    return () => clearInterval(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Strip markdown so raw symbols never flash during typewriter animation:
  // 1. Complete **bold** pairs → plain text
  // 2. Orphaned ** (closing pair hasn't been typed yet) → remove
  // 3. * bullet at line start → replace with • so list lines look clean mid-type
  const stripMd = (t) => t
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/^\* /gm, "• ");

  // ── Feature 1 + 6: Gradient border + Glassmorphism on AI bubbles ─────────
  // Semi-transparent glass card so the app background bleeds through the bubble.
  // The padding-box / border-box trick still carries the gradient border on top.
  const glassCard = dark
    ? "rgba(28,28,30,0.68)"
    : "rgba(255,255,255,0.68)";
  const aiBubbleStyle = !isUser ? {
    border: "1.5px solid transparent",
    background: `linear-gradient(${glassCard}, ${glassCard}) padding-box,
                 linear-gradient(135deg, #FF9933 0%, #6366f1 50%, #003580 100%) border-box`,
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    boxShadow: dark
      ? "0 4px 20px rgba(255,153,51,0.14), 0 1px 8px rgba(0,0,0,0.45)"
      : "0 4px 20px rgba(255,153,51,0.11), 0 1px 8px rgba(0,0,0,0.09)",
  } : {};

  return (
    <div className={isUser ? "ai-msg-bubble-user" : "ai-msg-bubble-ai"}
      style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", alignItems:"flex-end", gap:6, marginBottom:14 }}>
      {!isUser && (
        <div style={{
          width:28, height:28, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#FF9933 0%,#003580 100%)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:13,
        }}>🤖</div>
      )}
      <div style={{
        maxWidth:"88%",
        background: isUser ? "linear-gradient(135deg,#003580,#1a56db)" : th.card,
        color: isUser ? "#fff" : th.text,
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding:"11px 15px", fontSize:13.5, lineHeight:1.65, fontFamily:bf,
        boxShadow: isUser ? "0 4px 16px rgba(0,53,128,0.28)" : undefined,
        border: isUser ? "none" : undefined,
        whiteSpace:"pre-wrap", wordBreak:"break-word",
        transition:"box-shadow 0.3s",
        ...aiBubbleStyle,
      }}>
        {/* ── Feature 5: AI bubble sender header ───────────────────────── */}
        {!isUser && (
          <div style={{
            display:"flex", alignItems:"center", gap:5, marginBottom:7,
            animation:"header-fade 0.22s ease-out",
          }}>
            <span style={{
              fontSize:9.5, fontWeight:800, letterSpacing:0.55,
              textTransform:"uppercase",
              color: dark ? "rgba(255,153,51,0.9)" : "#FF8000",
              fontFamily:"'Noto Sans',sans-serif",
            }}>
              YojanaSetu AI
            </span>
            {/* Verified checkmark badge */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"center",
              width:14, height:14, borderRadius:"50%",
              background:"#22c55e",
              flexShrink:0,
            }}>
              <span style={{ fontSize:8, color:"#fff", fontWeight:900, lineHeight:1 }}>✓</span>
            </div>
          </div>
        )}

        {isDone
          ? renderContent(msg.content, isUser, th)
          : (
            <>
              {stripMd(displayed)}
              {/* Blinking cursor while typing */}
              <span style={{
                display:"inline-block", width:2, height:"1em",
                background:"#FF9933", marginLeft:2, borderRadius:1,
                animation:"typing-cursor 0.7s step-end infinite",
                verticalAlign:"text-bottom",
              }} />
            </>
          )
        }

        {/* ── Feature 3: Verified source badge ─────────────────────────── */}
        {!isUser && isDone && (
          <div style={{
            display:"flex", alignItems:"center", gap:5,
            marginTop:8, paddingTop:7,
            borderTop: dark
              ? "1px solid rgba(255,255,255,0.07)"
              : "1px solid rgba(0,0,0,0.06)",
            animation:"badge-pop 0.32s ease-out",
          }}>
            {/* Checkmark pill */}
            <div style={{
              display:"flex", alignItems:"center", gap:3,
              background: dark ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.1)",
              border:"1px solid rgba(34,197,94,0.3)",
              borderRadius:20, padding:"2px 7px",
            }}>
              <span style={{ fontSize:9, color:"#22c55e", fontWeight:900, lineHeight:1 }}>✓</span>
              <span style={{ fontSize:9, color:"#22c55e", fontWeight:700, letterSpacing:0.2 }}>
                {lang === "hi" ? "सत्यापित" : "Verified"}
              </span>
            </div>
            {/* Source label */}
            <span style={{
              fontSize:9.5, color:th.textSub, fontWeight:500, letterSpacing:0.2,
            }}>
              YojanaSetu AI
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function WelcomeScreen({ lang, dark, onSuggest }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";
  return (
    <div style={{ animation:"fade-in 0.3s ease-out", paddingBottom:8 }}>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:20 }}>
        <div style={{
          width:32, height:32, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#FF9933 0%,#003580 100%)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
        }}>🤖</div>
        <div style={{
          background:th.card, border:`1.5px solid ${th.border2}`,
          borderRadius:"18px 18px 18px 4px", padding:"13px 15px",
          fontSize:13.5, lineHeight:1.65, fontFamily:bf, color:th.text,
          boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
          maxWidth:"80%",
        }}>
          {isHindi
            ? "नमस्ते! 🙏 मैं YojanaSetu का AI सहायक हूं।\nआपको सरकारी योजनाएं खोजने और समझने में मदद करूंगा।\nहिंदी या English — जो भी आसान हो, पूछें!"
            : "Namaste! 🙏 I'm YojanaSetu's AI Assistant.\nI'll help you find and understand government schemes.\nAsk me anything in Hindi or English!"}
        </div>
      </div>
      <div style={{ fontSize:10, fontWeight:700, color:th.textSub, letterSpacing:0.8, textTransform:"uppercase", marginBottom:10, paddingLeft:40, fontFamily:bf }}>
        {isHindi ? "यह पूछें" : "Try asking"}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, paddingLeft:40 }}>
        {SUGGESTED[lang].map((s, i) => (
          <div key={i} className="ai-suggested" onClick={() => onSuggest(s.text)}
            style={{
              background:th.card, border:`1.5px solid ${th.border2}`, borderRadius:13,
              padding:"10px 14px", fontSize:13, fontFamily:bf, color:th.text,
              cursor:"pointer", display:"flex", alignItems:"center", gap:9,
              boxShadow: dark ? "0 1px 5px rgba(0,0,0,0.2)" : "0 1px 5px rgba(0,0,0,0.05)",
              transition:"opacity 0.15s, transform 0.15s",
            }}>
            <span style={{ fontSize:16 }}>{s.icon}</span>
            <span>{s.text}</span>
            <span style={{ marginLeft:"auto", color:th.textSub, fontSize:14 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function AIChat({ lang="en", dark=false }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";

  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [chips,        setChips]        = useState([]);
  const [usedChips,    setUsedChips]    = useState(new Set());

  // ── Unified Reading-Time cooldown ────────────────────────────────────────────
  const [secondsLeft,  setSecondsLeft]  = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [justUnlocked, setJustUnlocked] = useState(false);

  const cooldownRef          = useRef(null);
  const bottomRef            = useRef(null);
  const textareaRef          = useRef(null);

  // FIX Bug 4: pendingChips was state but never read in JSX → convert to ref
  // to avoid unnecessary re-renders on every startCooldown call.
  const pendingChipsRef      = useRef([]);

  // FIX Bug 5: secondsLeft in handleSend's dep array caused it (and handleKeyDown)
  // to be recreated every second as the countdown ticks. Use a ref instead.
  const secondsLeftRef       = useRef(0);

  // FIX Bug 3: store the justUnlocked setTimeout handle so it can be cleared on
  // unmount, preventing "setState on unmounted component" errors.
  const justUnlockedTimerRef = useRef(null);

  // ── Scroll to bottom ─────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading, chips, secondsLeft]);

  // ── Auto-resize textarea ─────────────────────────────────────────────────────
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, [input]);

  // FIX Bug 2: cleanup the interval (and the setTimeout) when the component
  // unmounts, preventing the interval from firing after navigation away.
  useEffect(() => {
    return () => {
      clearInterval(cooldownRef.current);
      clearTimeout(justUnlockedTimerRef.current);
    };
  }, []);

  // FIX Bug 5: keep the ref in sync so handleSend can read it without being
  // listed as a dependency that changes every second.
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  // FIX Bug 1: unlock side-effects (setChips, setJustUnlocked, setTimeout) were
  // previously called INSIDE the setSecondsLeft updater function. React's
  // StrictMode / Concurrent Mode can invoke updaters multiple times, so chips
  // could have appeared twice and justUnlocked could have fired erratically.
  // Moving them into a useEffect that watches secondsLeft is the correct pattern.
  useEffect(() => {
    if (secondsLeft === 0 && pendingChipsRef.current.length > 0) {
      setChips(pendingChipsRef.current);
      pendingChipsRef.current = [];
      setJustUnlocked(true);
      clearTimeout(justUnlockedTimerRef.current);           // FIX Bug 3
      justUnlockedTimerRef.current = setTimeout(
        () => setJustUnlocked(false), 500
      );
    }
  }, [secondsLeft]);

  // ── Start reading-time cooldown ──────────────────────────────────────────────
  const startCooldown = useCallback((replyText, incomingChips) => {
    clearInterval(cooldownRef.current);
    const secs = calcReadingTime(replyText);
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    pendingChipsRef.current = incomingChips;  // FIX Bug 4: ref instead of state
    setChips([]);                             // hide any previous chips immediately

    cooldownRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          // FIX Bug 1: NO side-effects here — the useEffect above handles unlock.
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSend = useCallback(async (overrideText) => {
    const query = (overrideText ?? input).trim();
    // FIX Bug 5: read from ref — no longer a dep that changes every second
    if (!query || loading || secondsLeftRef.current > 0) return;

    setInput("");
    setError("");
    setChips([]);
    pendingChipsRef.current = [];             // FIX Bug 4: ref instead of state
    setSecondsLeft(0);
    clearInterval(cooldownRef.current);

    const nextUsedChips = overrideText
      ? new Set([...usedChips, overrideText])
      : usedChips;
    if (overrideText) setUsedChips(nextUsedChips);

    const userMsg      = { role:"user", content:query };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const { reply, followUps: aiChips } = await sendMessage(
        nextMessages.map(m => ({ role:m.role, content:m.content })),
        query,
        lang,
      );
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
      const freshChips = aiChips.filter(c => !nextUsedChips.has(c));
      startCooldown(reply, freshChips);
    } catch (err) {
      setError(`❌ ${err.message || (isHindi ? "जवाब नहीं मिला। दोबारा कोशिश करें।" : "Could not get response. Please try again.")}`);
    } finally {
      setLoading(false);
    }
  // FIX Bug 5: secondsLeft removed from deps — secondsLeftRef.current is used instead
  }, [input, messages, loading, isHindi, lang, usedChips, startCooldown]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const isLocked = secondsLeft > 0;

  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      background:th.appBg, overflow:"hidden", fontFamily:bf,
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* HEADER */}
      <div style={{
        background:"linear-gradient(135deg,rgba(255,153,51,0.82) 0%,rgba(255,128,0,0.78) 35%,rgba(0,53,128,0.85) 100%)",
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        padding:"18px 20px 22px", flexShrink:0,
        boxShadow:"0 4px 24px rgba(0,53,128,0.22)",
        borderBottom:"1px solid rgba(255,255,255,0.12)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:13 }}>
          <div style={{
            width:46, height:46, borderRadius:14, flexShrink:0,
            background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
          }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:17, fontWeight:800, lineHeight:1.2,
              display:"flex", alignItems:"center", gap:8 }}>
              {isHindi ? "AI सहायक" : "AI Assistant"}
              <AshokChakra size={22} color="rgba(255,255,255,0.88)" duration="10s" />
            </div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11, marginTop:3 }}>
              🟢 {isHindi ? "ऑनलाइन · हिंदी / English" : "Online · Hindi / English"}
            </div>
          </div>
          {messages.length > 0 && (
            <div onClick={() => {
                setMessages([]); setError(""); setChips([]);
                pendingChipsRef.current = [];              // FIX Bug 4
                setUsedChips(new Set()); setSecondsLeft(0);
                clearInterval(cooldownRef.current);
                clearTimeout(justUnlockedTimerRef.current); // FIX Bug 3
              }}
              style={{
                background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)",
                borderRadius:10, padding:"5px 11px",
                color:"rgba(255,255,255,0.9)", fontSize:11, fontWeight:600, cursor:"pointer",
              }}>
              {isHindi ? "साफ करें" : "Clear"}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div style={{ flex:1, overflowY:"auto", padding:"18px 10px 6px", WebkitOverflowScrolling:"touch" }}>
        {messages.length === 0 && !loading && (
          <WelcomeScreen lang={lang} dark={dark} onSuggest={handleSend} />
        )}
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            msg={msg}
            lang={lang}
            dark={dark}
            isNew={msg.role === "assistant" && i === messages.length - 1}
          />
        ))}

        {/* Chips — only shown after cooldown ends */}
        {!loading && chips.length > 0 && (
          <FollowUpChips chips={chips} onTap={handleSend} lang={lang} dark={dark} />
        )}

        {loading && <TypingIndicator dark={dark} />}
        {error && (
          <div style={{
            textAlign:"center", marginBottom:12,
            padding:"10px 16px", fontSize:12, fontFamily:bf,
            color:"#c53030", background:"#FFF5F5",
            border:"1px solid #FED7D7", borderRadius:12,
            animation:"fade-in 0.2s ease-out",
          }}>
            {error}
          </div>
        )}
        <div ref={bottomRef} style={{ height:4 }} />
      </div>

      {/* BOTTOM BAR — swaps between reading-time and normal input */}
      {isLocked ? (
        <ReadingTimeBar
          secondsLeft={secondsLeft}
          totalSeconds={totalSeconds}
          dark={dark}
          lang={lang}
        />
      ) : (
        <InputBar
          input={input}
          setInput={(v) => { setInput(v); if (error) setError(""); }}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          loading={loading}
          dark={dark}
          lang={lang}
          textareaRef={textareaRef}
          justUnlocked={justUnlocked}
        />
      )}
    </div>
  );
}
