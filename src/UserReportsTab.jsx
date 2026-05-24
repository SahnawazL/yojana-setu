// UserReportsTab.jsx — YojanaSetu
// User-facing "My Reports" tab shown inside their profile screen.
// Reads from Firestore: collection("reports") where uid == currentUser.uid
// Shows: full conversation thread, status, admin replies, timestamps.

import { useState, useEffect, useCallback } from "react";
import { db, auth } from "./firebase.js";
import {
  collection, query, where, orderBy, getDocs,
} from "firebase/firestore";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#f8f9fa",
    divider:"#f0f0f0",
  },
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e",
    divider:"#2c2c2e",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";
const VIOLET    = "#8B5CF6";

// ─── METADATA ────────────────────────────────────────────────────────────────
const TYPE_META = {
  issue:          { icon:"🐛", color:"#DC2626" },
  scheme_request: { icon:"📋", color:NAVY      },
  query:          { icon:"❓", color:IND_GREEN },
  feedback:       { icon:"💡", color:SAFFRON   },
};

const STATUS_META = {
  open:        { emoji:"🔴", color:"#DC2626", bg:"#FEF2F2", darkBg:"rgba(220,38,38,0.15)"  },
  in_progress: { emoji:"🟡", color:"#D97706", bg:"#FFFBEB", darkBg:"rgba(217,119,6,0.15)"  },
  resolved:    { emoji:"✅", color:IND_GREEN,  bg:"#F0FDF4", darkBg:"rgba(19,136,8,0.15)"  },
};

// ─── STRINGS (bilingual) ──────────────────────────────────────────────────────
const STRINGS = {
  en: {
    title:         "My Reports",
    sub:           "Track your submitted reports & admin responses",
    refresh:       "Refresh",
    loading:       "Loading your reports…",
    empty:         "No reports yet",
    emptySub:      "You haven't submitted any reports or queries yet.",
    newReport:     "+ New Report",
    statusLabel:   { open:"Open", in_progress:"In Progress", resolved:"Resolved" },
    typeLabel:     {
      issue:"Bug / Issue", scheme_request:"Scheme Request",
      query:"Query", feedback:"Feedback",
    },
    thread:        "Conversation",
    you:           "You",
    admin:         "YojanaSetu Team",
    noReply:       "Waiting for admin response…",
    submitted:     "Submitted",
    replied:       "Replied",
    filterAll:     "All",
    filterOpen:    "Open",
    filterProg:    "In Progress",
    filterDone:    "Resolved",
    errLoad:       "Failed to load reports. Tap refresh to try again.",
    awaitingTip:   "We'll notify you by email once the team responds.",
    resolvedTip:   "This report has been resolved. Tap below to submit a new one if needed.",
    inProgTip:     "Our team is actively working on this.",
  },
  hi: {
    title:         "मेरी रिपोर्ट",
    sub:           "अपनी रिपोर्ट और एडमिन के जवाब यहाँ देखें",
    refresh:       "रिफ्रेश",
    loading:       "रिपोर्ट लोड हो रही हैं…",
    empty:         "कोई रिपोर्ट नहीं",
    emptySub:      "आपने अभी तक कोई रिपोर्ट या सवाल नहीं भेजा।",
    newReport:     "+ नई रिपोर्ट",
    statusLabel:   { open:"खुली", in_progress:"प्रगति में", resolved:"हल हो गई" },
    typeLabel:     {
      issue:"बग / समस्या", scheme_request:"योजना अनुरोध",
      query:"सवाल", feedback:"सुझाव",
    },
    thread:        "बातचीत",
    you:           "आप",
    admin:         "YojanaSetu टीम",
    noReply:       "एडमिन के जवाब का इंतज़ार है…",
    submitted:     "भेजी गई",
    replied:       "जवाब मिला",
    filterAll:     "सभी",
    filterOpen:    "खुली",
    filterProg:    "प्रगति में",
    filterDone:    "हल हुई",
    errLoad:       "रिपोर्ट लोड नहीं हुई। रिफ्रेश करें।",
    awaitingTip:   "जवाब मिलने पर आपको ईमेल से सूचित किया जाएगा।",
    resolvedTip:   "यह रिपोर्ट हल हो गई है। ज़रूरत हो तो नई रिपोर्ट भेजें।",
    inProgTip:     "हमारी टीम इस पर काम कर रही है।",
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function formatDate(ts, lang = "en") {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day:"numeric", month:"short", year:"numeric",
  });
}

function formatDateTime(ts, lang = "en") {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", {
    day:"numeric", month:"short", year:"2-digit",
    hour:"2-digit", minute:"2-digit",
  });
}

function timeAgo(ts) {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── STATUS PROGRESS BAR ──────────────────────────────────────────────────────
// Premium 3-step stepper: Submitted → In Review → Resolved
// Each step takes 33.33% of the row; the track runs between circle centers.
// Circle center for step i = (i * 33.33 + 16.67)% of the row.
//   Step 0 center: ~16.67%   Step 1 center: ~50%   Step 2 center: ~83.33%
// Track: left=16.67%, right=16.67% → track spans the middle 66.66%.
// Fill widths (relative to container, starting at 16.67%):
//   open        → 0%
//   in_progress → 33.33%  (half of 66.66% track)
//   resolved    → 66.66%  (full track, ends exactly at right circle center)
function StatusProgress({ status, dark, lang }) {
  const th = THEME[dark ? "dark" : "light"];

  const STATUS_CONFIG = {
    open:        { color:"#DC2626", gradFrom:"#DC2626", gradTo:"#f87171", glow:"rgba(220,38,38,0.25)" },
    in_progress: { color:"#D97706", gradFrom:"#D97706", gradTo:"#fbbf24", glow:"rgba(217,119,6,0.25)"  },
    resolved:    { color:IND_GREEN, gradFrom:IND_GREEN, gradTo:"#4ade80", glow:"rgba(19,136,8,0.22)"   },
  };
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.open;

  const steps = [
    {
      key:"submitted",
      labelEn:"Submitted", labelHi:"भेजी गई",
      doneIcon:"📬", pendingDot:true,
    },
    {
      key:"review",
      labelEn:"In Review", labelHi:"समीक्षा में",
      doneIcon:"🔍", pendingDot:true,
    },
    {
      key:"resolved",
      labelEn:"Resolved", labelHi:"हल हुई",
      doneIcon:"✅", pendingDot:true,
    },
  ];

  const activeIdx = status === "resolved" ? 2 : status === "in_progress" ? 1 : 0;

  // Fill width: track is 66.66% wide starting at 16.67%.
  // Each segment = 33.33% of container.
  const fillWidth = activeIdx === 0 ? "0%" : activeIdx === 1 ? "33.33%" : "66.66%";

  return (
    <div style={{ padding:"10px 0 6px", position:"relative", userSelect:"none" }}>

      {/* ── Track (grey) — sits between circle centers ── */}
      <div style={{
        position:"absolute",
        top: 17,                      // center of 36px circle
        left:"16.67%", right:"16.67%",
        height: 4,
        background: dark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
        borderRadius: 99,
        zIndex: 0,
      }} />

      {/* ── Filled track ── */}
      <div style={{
        position:"absolute",
        top: 17,
        left:"16.67%",
        width: fillWidth,
        height: 4,
        borderRadius: 99,
        background:`linear-gradient(90deg,${cfg.gradFrom},${cfg.gradTo})`,
        boxShadow:`0 0 8px ${cfg.glow}`,
        zIndex: 1,
        transition:"width 0.65s cubic-bezier(0.22,1,0.36,1)",
      }} />

      {/* ── Steps ── */}
      <div style={{ display:"flex", position:"relative", zIndex:2 }}>
        {steps.map((step, i) => {
          const done    = i <= activeIdx;
          const current = i === activeIdx;
          const future  = i > activeIdx;

          return (
            <div key={step.key} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6,
            }}>
              {/* Circle */}
              <div style={{
                width: 36, height: 36, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize: current ? 16 : 14,
                flexShrink: 0,
                background: future
                  ? (dark ? "rgba(255,255,255,0.06)" : "#f3f4f6")
                  : current
                    ? `linear-gradient(135deg,${cfg.gradFrom},${cfg.gradTo})`
                    : `linear-gradient(135deg,${cfg.gradFrom}cc,${cfg.gradTo}99)`,
                border: future
                  ? `2px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`
                  : `2px solid ${cfg.gradTo}`,
                boxShadow: current
                  ? `0 0 0 5px ${cfg.glow}, 0 4px 14px ${cfg.glow}`
                  : done && !current
                    ? `0 2px 8px ${cfg.glow}`
                    : "none",
                transition:"all 0.4s cubic-bezier(0.22,1,0.36,1)",
              }}>
                {future ? (
                  <div style={{
                    width:8, height:8, borderRadius:"50%",
                    background: dark ? "rgba(255,255,255,0.2)" : "#d1d5db",
                  }} />
                ) : (
                  <span style={{ lineHeight:1 }}>{step.doneIcon}</span>
                )}
              </div>

              {/* Label */}
              <div style={{
                fontSize: 10,
                fontWeight: current ? 800 : done ? 600 : 500,
                color: future
                  ? th.textSub
                  : current
                    ? cfg.color
                    : th.textMid,
                textAlign:"center",
                lineHeight: 1.3,
                letterSpacing: current ? 0.1 : 0,
                transition:"color 0.3s",
              }}>
                {lang === "hi" ? step.labelHi : step.labelEn}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SINGLE CONVERSATION BUBBLE ───────────────────────────────────────────────
function ChatBubble({ who, text, time, statusTag, dark, lang }) {
  const th    = THEME[dark ? "dark" : "light"];
  const isMe  = who === "user";
  const smeta = statusTag ? STATUS_META[statusTag] : null;

  return (
    <div style={{
      display:"flex",
      flexDirection: isMe ? "row-reverse" : "row",
      gap:8, alignItems:"flex-end",
    }}>
      {/* Avatar */}
      <div style={{
        width:28, height:28, borderRadius:"50%", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:13,
        background: isMe
          ? `linear-gradient(135deg,${SAFFRON},#f97316)`
          : `linear-gradient(135deg,${NAVY},#1a56db)`,
        boxShadow:"0 2px 6px rgba(0,0,0,0.15)",
      }}>
        {isMe ? "👤" : "🛡️"}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth:"78%",
        background: isMe
          ? (dark ? "rgba(255,153,51,0.18)" : "#FFF7ED")
          : (dark ? "rgba(0,53,128,0.22)"   : "#EFF6FF"),
        border:`1.5px solid ${isMe ? SAFFRON+"44" : NAVY+"33"}`,
        borderRadius: isMe ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
        padding:"10px 13px",
      }}>
        {/* Sender label + status tag */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
          <span style={{
            fontSize:10, fontWeight:800,
            color: isMe ? SAFFRON : NAVY,
          }}>
            {isMe
              ? (lang === "hi" ? "आप" : "You")
              : (lang === "hi" ? "YojanaSetu टीम" : "YojanaSetu Team")}
          </span>
          {smeta && (
            <span style={{
              fontSize:9, fontWeight:700, color:smeta.color,
              background: dark ? smeta.darkBg : smeta.bg,
              border:`1px solid ${smeta.color}55`,
              borderRadius:5, padding:"1px 6px",
            }}>
              {smeta.emoji} {STATUS_META[statusTag] ? (
                lang === "hi"
                  ? { open:"खुली", in_progress:"प्रगति में", resolved:"हल हुई" }[statusTag]
                  : { open:"Open", in_progress:"In Progress", resolved:"Resolved" }[statusTag]
              ) : statusTag}
            </span>
          )}
        </div>

        {/* Message text */}
        <div style={{
          fontSize:13, color:th.text, lineHeight:1.65,
          whiteSpace:"pre-wrap", wordBreak:"break-word",
        }}>
          {text}
        </div>

        {/* Timestamp */}
        <div style={{
          fontSize:9, color:th.textSub, marginTop:5,
          textAlign: isMe ? "left" : "right", fontWeight:500,
        }}>
          {time}
        </div>
      </div>
    </div>
  );
}

// ─── FULL CONVERSATION THREAD ─────────────────────────────────────────────────
function ConversationThread({ report, dark, lang }) {
  const th  = THEME[dark ? "dark" : "light"];
  const s   = STRINGS[lang] || STRINGS.en;
  const thread = [];

  // Original user message
  thread.push({
    key:    "original",
    who:    "user",
    text:   report.message || "—",
    time:   formatDateTime(report.createdAt, lang),
    status: null,
  });

  // All admin replies from replyHistory
  const history = Array.isArray(report.replyHistory) ? report.replyHistory : [];
  history.forEach((r, i) => {
    thread.push({
      key:    `reply-${i}`,
      who:    "admin",
      text:   r.text || "—",
      time:   r.sentAt
                ? formatDateTime({ seconds: new Date(r.sentAt).getTime() / 1000 }, lang)
                : "—",
      status: r.status || null,
    });
  });

  // If adminReply exists but replyHistory is empty (legacy data)
  if (history.length === 0 && report.adminReply) {
    thread.push({
      key:    "legacy-reply",
      who:    "admin",
      text:   report.adminReply,
      time:   formatDateTime(report.repliedAt, lang),
      status: "resolved",
    });
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{
        fontSize:10, fontWeight:800, color:th.textSub,
        letterSpacing:0.5, marginBottom:2,
      }}>
        💬 {s.thread} ({thread.length})
      </div>

      {thread.map(msg => (
        <ChatBubble
          key={msg.key}
          who={msg.who}
          text={msg.text}
          time={msg.time}
          statusTag={msg.status}
          dark={dark}
          lang={lang}
        />
      ))}

      {/* Awaiting reply indicator */}
      {history.length === 0 && !report.adminReply && (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background: dark ? "rgba(255,255,255,0.04)" : th.card2,
          border:`1px dashed ${th.border}`,
          borderRadius:10, padding:"9px 12px",
          marginTop:2,
        }}>
          <div style={{ fontSize:16 }}>⏳</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, color:th.textMid, fontWeight:600 }}>
              {s.noReply}
            </div>
            <div style={{ fontSize:10, color:th.textSub, marginTop:2 }}>
              {s.awaitingTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORT CARD ──────────────────────────────────────────────────────────────
function ReportCard({ report, dark, lang, isExpanded, onToggle }) {
  const th       = THEME[dark ? "dark" : "light"];
  const s        = STRINGS[lang] || STRINGS.en;
  const typeMeta = TYPE_META[report.type]   || { icon:"📝", color:NAVY };
  const stMeta   = STATUS_META[report.status] || STATUS_META.open;
  const typeLabel= s.typeLabel[report.type]  || report.type;
  const stLabel  = s.statusLabel[report.status] || report.status;
  const hasReply = !!(report.adminReply || (report.replyHistory?.length > 0));
  const replyCount = report.replyHistory?.length || (report.adminReply ? 1 : 0);

  return (
    <div style={{
      background: th.card,
      border:`1.5px solid ${isExpanded ? typeMeta.color : th.border}`,
      borderRadius:16, overflow:"hidden",
      boxShadow: isExpanded ? `0 6px 24px ${typeMeta.color}22` : "0 1px 4px rgba(0,0,0,0.06)",
      transition:"all 0.22s",
    }}>
      {/* ── Card Header ── */}
      <div
        onClick={onToggle}
        style={{
          padding:"14px 16px", cursor:"pointer",
          display:"flex", gap:12, alignItems:"flex-start",
        }}
      >
        {/* Type icon */}
        <div style={{
          width:40, height:40, borderRadius:12, flexShrink:0,
          background: dark ? `${typeMeta.color}22` : `${typeMeta.color}12`,
          border:`1.5px solid ${typeMeta.color}44`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18,
        }}>
          {typeMeta.icon}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Type + Status badges */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5, flexWrap:"wrap" }}>
            <span style={{
              fontSize:10, fontWeight:700, color:typeMeta.color,
              background: dark ? `${typeMeta.color}22` : `${typeMeta.color}12`,
              border:`1px solid ${typeMeta.color}33`,
              borderRadius:6, padding:"2px 7px",
            }}>
              {typeLabel}
            </span>
            <span style={{
              fontSize:10, fontWeight:700, color:stMeta.color,
              background: dark ? stMeta.darkBg : stMeta.bg,
              border:`1px solid ${stMeta.color}44`,
              borderRadius:6, padding:"2px 7px",
            }}>
              {stMeta.emoji} {stLabel}
            </span>
            {hasReply && (
              <span style={{
                fontSize:9, fontWeight:700, color:VIOLET,
                background: dark ? "rgba(139,92,246,0.15)" : "#F5F3FF",
                border:`1px solid ${VIOLET}44`,
                borderRadius:6, padding:"2px 7px",
              }}>
                💬 {replyCount} {lang === "hi" ? "जवाब" : replyCount === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>

          {/* Subject / preview */}
          <div style={{
            fontSize:13, fontWeight:700, color:th.text,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            marginBottom:3,
          }}>
            {report.subject || report.message?.slice(0, 60) || "—"}
          </div>

          {/* Time */}
          <div style={{ fontSize:10, color:th.textSub }}>
            🕐 {timeAgo(report.createdAt)} · {formatDate(report.createdAt, lang)}
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{
          color:th.textSub, fontSize:16, flexShrink:0,
          transition:"transform 0.22s",
          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
        }}>›</div>
      </div>

      {/* ── Expanded Panel ── */}
      {isExpanded && (
        <div style={{
          borderTop:`1px solid ${th.border}`,
          padding:"14px 16px",
          display:"flex", flexDirection:"column", gap:14,
        }}>

          {/* Status progress bar */}
          <div style={{
            background: dark ? "rgba(255,255,255,0.03)" : th.card2,
            border:`1px solid ${th.border}`,
            borderRadius:12, padding:"12px 14px",
          }}>
            <div style={{ fontSize:10, fontWeight:800, color:th.textSub, letterSpacing:0.4, marginBottom:4 }}>
              📊 {lang === "hi" ? "स्थिति" : "STATUS"}
            </div>
            <StatusProgress status={report.status} dark={dark} lang={lang} />

            {/* Status tip */}
            <div style={{
              marginTop:10,
              background: dark ? stMeta.darkBg : stMeta.bg,
              border:`1px solid ${stMeta.color}44`,
              borderRadius:8, padding:"7px 10px",
              fontSize:11, color:stMeta.color, fontWeight:600,
              display:"flex", gap:6, alignItems:"flex-start",
            }}>
              <span>{stMeta.emoji}</span>
              <span>
                {report.status === "resolved"    && (STRINGS[lang] || STRINGS.en).resolvedTip}
                {report.status === "in_progress" && (STRINGS[lang] || STRINGS.en).inProgTip}
                {report.status === "open"        && (STRINGS[lang] || STRINGS.en).awaitingTip}
              </span>
            </div>
          </div>

          {/* Full conversation thread */}
          <ConversationThread report={report} dark={dark} lang={lang} />

          {/* Meta: submission details */}
          <div style={{
            background: dark ? "rgba(255,255,255,0.03)" : th.card2,
            border:`1px solid ${th.border}`,
            borderRadius:12, padding:"10px 14px",
            display:"flex", flexDirection:"column", gap:4,
          }}>
            <div style={{ fontSize:9, fontWeight:800, color:th.textSub, letterSpacing:0.4, marginBottom:2 }}>
              📋 {lang === "hi" ? "रिपोर्ट विवरण" : "REPORT DETAILS"}
            </div>
            {[
              { label: lang === "hi" ? "🆔 रिपोर्ट ID" : "🆔 Report ID", value: report.id, mono:true },
              { label: lang === "hi" ? "🗓 भेजी गई"   : "🗓 Submitted",  value: formatDateTime(report.createdAt, lang) },
              report.repliedAt && {
                label: lang === "hi" ? "💬 जवाब मिला" : "💬 Last Reply",
                value: formatDateTime(report.repliedAt, lang),
              },
              { label: lang === "hi" ? "🌐 भाषा" : "🌐 Language", value: report.lang === "hi" ? "हिंदी" : "English" },
            ].filter(Boolean).map(({ label, value, mono }) => (
              <div key={label} style={{
                display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", gap:8,
                paddingBottom:4, borderBottom:`1px solid ${th.divider}`,
              }}>
                <span style={{ fontSize:10, color:th.textSub, flexShrink:0 }}>{label}</span>
                <span style={{
                  fontSize:10, fontWeight:600, color:th.text,
                  fontFamily: mono ? "monospace" : "inherit",
                  wordBreak:"break-all", textAlign:"right",
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UserReportsTab({
  lang        = "en",
  dark        = false,
  onNewReport,          // () => void — opens ReportIssueSheet
  userProfile,          // optional { name, email, phone }
}) {
  const s  = STRINGS[lang] || STRINGS.en;
  const th = THEME[dark ? "dark" : "light"];
  const bf = lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState("");
  const [expanded,   setExpanded]   = useState(null);
  const [filter,     setFilter]     = useState("all"); // "all"|"open"|"in_progress"|"resolved"

  const user = auth.currentUser;

  // ── Fetch user's reports ───────────────────────────────────────────────────
  const fetchReports = useCallback(async (isRefresh = false) => {
    if (!user) { setLoading(false); return; }
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "reports"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(data);
    } catch (err) {
      console.error("UserReportsTab fetch error:", err);
      // Fallback: try without orderBy in case index isn't created yet
      try {
        const q2 = query(collection(db, "reports"), where("uid", "==", user.uid));
        const snap2 = await getDocs(q2);
        const data2 = snap2.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setReports(data2);
      } catch (err2) {
        setError(s.errLoad);
        console.error("Fallback fetch also failed:", err2);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, s.errLoad]);

  useEffect(() => { fetchReports(); }, []);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = filter === "all"
    ? reports
    : reports.filter(r => r.status === filter);

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    all:         reports.length,
    open:        reports.filter(r => r.status === "open").length,
    in_progress: reports.filter(r => r.status === "in_progress").length,
    resolved:    reports.filter(r => r.status === "resolved").length,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:0,
      fontFamily:bf, background:th.bg, minHeight:"100%",
    }}>

      {/* ── Header ── */}
      <div style={{
        padding:"18px 16px 14px",
        background:th.card,
        borderBottom:`1px solid ${th.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{ fontSize:17, fontWeight:800, color:th.text }}>
            📬 {s.title}
          </div>
          <div style={{ fontSize:11, color:th.textSub, marginTop:2 }}>{s.sub}</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Refresh */}
          <div
            onClick={() => !refreshing && fetchReports(true)}
            style={{
              padding:"7px 12px", borderRadius:10,
              fontSize:11, fontWeight:700, cursor:"pointer",
              background:th.inputBg, border:`1.5px solid ${th.border}`,
              color: refreshing ? th.textSub : th.textMid,
              display:"flex", alignItems:"center", gap:5,
              opacity: refreshing ? 0.7 : 1,
              transition:"all 0.18s",
            }}
          >
            <span style={{
              display:"inline-block",
              animation: refreshing ? "spin 1s linear infinite" : "none",
            }}>↻</span>
            {s.refresh}
          </div>
        </div>
      </div>

      {/* ── Summary pills ── */}
      {!loading && reports.length > 0 && (
        <div style={{
          display:"flex", gap:8, padding:"12px 14px",
          background:th.card, borderBottom:`1px solid ${th.border}`,
          overflowX:"auto",
        }}>
          {[
            { v:"all",         l:s.filterAll,  c:NAVY,      count:counts.all         },
            { v:"open",        l:s.filterOpen, c:"#DC2626", count:counts.open        },
            { v:"in_progress", l:s.filterProg, c:"#D97706", count:counts.in_progress },
            { v:"resolved",    l:s.filterDone, c:IND_GREEN, count:counts.resolved    },
          ].map(({ v, l, c, count }) => (
            <div
              key={v}
              onClick={() => { setFilter(v); setExpanded(null); }}
              style={{
                padding:"6px 13px", borderRadius:20, flexShrink:0,
                fontSize:11, fontWeight:700, cursor:"pointer",
                background: filter === v ? c : th.inputBg,
                color:      filter === v ? "#fff" : th.textMid,
                border:`1.5px solid ${filter === v ? c : th.border}`,
                transition:"all 0.18s",
                display:"flex", alignItems:"center", gap:5,
              }}
            >
              {l}
              <span style={{
                fontSize:10, fontWeight:800,
                background: filter === v ? "rgba(255,255,255,0.25)" : th.border,
                borderRadius:8, padding:"1px 6px",
                color: filter === v ? "#fff" : th.textSub,
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Body ── */}
      <div style={{ flex:1, padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>

        {/* Loading */}
        {loading && (
          <div style={{
            flex:1, display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:12, padding:"60px 0",
          }}>
            <div style={{ fontSize:30 }}>⏳</div>
            <div style={{ fontSize:13, color:th.textSub }}>{s.loading}</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: dark ? "rgba(220,38,38,0.15)" : "#FEF2F2",
            border:"1.5px solid #DC262655",
            borderRadius:14, padding:"16px",
            textAlign:"center",
          }}>
            <div style={{ fontSize:24, marginBottom:8 }}>⚠️</div>
            <div style={{ fontSize:13, color:"#DC2626", fontWeight:600 }}>{error}</div>
            <div
              onClick={() => fetchReports(true)}
              style={{
                marginTop:12, display:"inline-block",
                padding:"8px 18px", borderRadius:10,
                background:"#DC2626", color:"#fff",
                fontSize:12, fontWeight:700, cursor:"pointer",
              }}
            >
              ↻ {s.refresh}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reports.length === 0 && (
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:20, padding:"44px 28px",
            textAlign:"center", display:"flex",
            flexDirection:"column", alignItems:"center", gap:10,
          }}>
            <div style={{ fontSize:52 }}>📭</div>
            <div style={{ fontSize:16, fontWeight:800, color:th.text }}>
              {s.empty}
            </div>
            <div style={{ fontSize:12, color:th.textSub, lineHeight:1.6, maxWidth:260 }}>
              {s.emptySub}
            </div>
            {onNewReport && (
              <div
                onClick={onNewReport}
                style={{
                  marginTop:8,
                  background:`linear-gradient(135deg,${NAVY},rgba(0,53,128,0.85))`,
                  color:"#fff", borderRadius:14,
                  padding:"12px 24px", fontSize:14, fontWeight:800,
                  cursor:"pointer", boxShadow:`0 6px 20px ${NAVY}44`,
                }}
              >
                {s.newReport}
              </div>
            )}
          </div>
        )}

        {/* No results for current filter */}
        {!loading && !error && reports.length > 0 && filtered.length === 0 && (
          <div style={{
            background:th.card, border:`1.5px dashed ${th.border}`,
            borderRadius:14, padding:"28px", textAlign:"center",
          }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
            <div style={{ fontSize:13, color:th.textSub }}>
              {lang === "hi" ? "इस फ़िल्टर में कोई रिपोर्ट नहीं।" : "No reports match this filter."}
            </div>
          </div>
        )}

        {/* Report cards */}
        {!loading && !error && filtered.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            dark={dark}
            lang={lang}
            isExpanded={expanded === report.id}
            onToggle={() => setExpanded(expanded === report.id ? null : report.id)}
          />
        ))}

        {/* New report CTA (when list is not empty) */}
        {!loading && !error && reports.length > 0 && onNewReport && (
          <div
            onClick={onNewReport}
            style={{
              marginTop:4,
              background: dark
                ? `linear-gradient(135deg,rgba(0,53,128,0.3),rgba(255,153,51,0.15))`
                : `linear-gradient(135deg,${NAVY}0f,${SAFFRON}0c)`,
              border:`1.5px dashed ${NAVY}55`,
              borderRadius:14, padding:"14px",
              textAlign:"center", cursor:"pointer",
              fontSize:13, fontWeight:700, color:NAVY,
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"all 0.18s",
            }}
          >
            <span style={{ fontSize:18 }}>📝</span>
            {s.newReport}
          </div>
        )}

        <div style={{ height:20 }} />
      </div>

      {/* Spin keyframes injected once */}
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
