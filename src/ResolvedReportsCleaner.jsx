// ResolvedReportsCleaner.jsx — YojanaSetu Admin Panel
// Safely delete old resolved reports from Firestore with age filters.
// Drop this anywhere in your admin panel and pass dark={true/false}.
//
// Usage:
//   import ResolvedReportsCleaner from "./ResolvedReportsCleaner";
//   <ResolvedReportsCleaner dark={dark} />
//
// Firestore rules needed: admin must have delete permission on "reports" collection.

import { useState, useEffect, useCallback } from "react";
import {
  collection, query, where, getDocs,
  deleteDoc, doc, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

// ─── CLEANUP PASSWORD ─────────────────────────────────────────────────────────
// SHA-256 hash of your cleanup password.
// To generate: open browser console and run:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YourPassword'))
//     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
// Then paste the output here ↓
const CLEANUP_PWD_HASH = "051f67acb3b4d3ed6e7ef098a9afc184b90e8337742097030960b89a7f2ce190";

async function hashStr(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, "0")).join("");
}

// ─── THEME (matches AdminDashboard) ──────────────────────────────────────────
const THEME = {
  light: {
    bg: "#f5f5f0", card: "#fff", card2: "#f8f9fa",
    text: "#1a1a1a", textMid: "#555", textSub: "#888",
    border: "#e8e8e8", inputBg: "#f8f9fa",
    overlay: "rgba(0,0,0,0.45)",
  },
  dark: {
    bg: "#111111", card: "#1c1c1e", card2: "#252527",
    text: "#f0f0f0", textMid: "#aaa", textSub: "#666",
    border: "#2c2c2e", inputBg: "#2c2c2e",
    overlay: "rgba(0,0,0,0.65)",
  },
};

const NAVY      = "#003580";
const SAFFRON   = "#FF9933";
const IND_GREEN = "#138808";
const DANGER    = "#DC2626";

// ─── AGE FILTER OPTIONS ───────────────────────────────────────────────────────
const AGE_FILTERS = [
  {
    key: "1m",
    label: "Older than 1 Month",
    labelHi: "1 महीने से पुरानी",
    icon: "📅",
    months: 1,
    color: SAFFRON,
    risk: "low",
  },
  {
    key: "3m",
    label: "Older than 3 Months",
    labelHi: "3 महीने से पुरानी",
    icon: "🗓️",
    months: 3,
    color: "#D97706",
    risk: "low",
  },
  {
    key: "6m",
    label: "Older than 6 Months",
    labelHi: "6 महीने से पुरानी",
    icon: "📆",
    months: 6,
    color: "#EA580C",
    risk: "medium",
  },
  {
    key: "1y",
    label: "Older than 1 Year",
    labelHi: "1 साल से पुरानी",
    icon: "🗄️",
    months: 12,
    color: DANGER,
    risk: "medium",
  },
  {
    key: "all",
    label: "All Resolved Reports",
    labelHi: "सभी हल हुई रिपोर्ट",
    icon: "🧹",
    months: 0,
    color: "#7C3AED",
    risk: "high",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getCutoffDate(months) {
  if (months === 0) return null; // means "all"
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return Timestamp.fromDate(d);
}

function formatCount(n) {
  if (n === 0) return "No reports";
  if (n === 1) return "1 report";
  return `${n} reports`;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// rough estimate: ~1.2 KB per report doc on average
const AVG_DOC_BYTES = 1200;

// ─── MINI PROGRESS BAR ────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div style={{
      width: "100%", height: 6, borderRadius: 4,
      background: "rgba(0,0,0,0.08)", overflow: "hidden",
    }}>
      <div style={{
        height: "100%", borderRadius: 4,
        width: `${pct}%`,
        background: color,
        transition: "width 0.2s ease",
      }} />
    </div>
  );
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ filter, count, dark, lang, onConfirm, onCancel, deleting, progress }) {
  const th = THEME[dark ? "dark" : "light"];
  const isHi = lang === "hi";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: th.overlay,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: th.card,
        borderRadius: 20,
        width: "100%", maxWidth: 360,
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0,0,0,0.28)",
        border: `1.5px solid ${th.border}`,
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${DANGER}18, ${DANGER}08)`,
          borderBottom: `1px solid ${DANGER}30`,
          padding: "20px 20px 16px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 42, marginBottom: 8 }}>
            {deleting ? "⏳" : "⚠️"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: DANGER }}>
            {isHi ? "क्या आप निश्चित हैं?" : "Confirm Deletion"}
          </div>
          <div style={{ fontSize: 12, color: th.textSub, marginTop: 4 }}>
            {isHi ? "यह क्रिया पूर्ववत नहीं की जा सकती" : "This action cannot be undone"}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 20px" }}>
          {/* What will be deleted */}
          <div style={{
            background: dark ? `${DANGER}15` : "#FEF2F2",
            border: `1px solid ${DANGER}40`,
            borderRadius: 12, padding: "12px 14px",
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 11, color: th.textSub, marginBottom: 6, fontWeight: 600, letterSpacing: 0.3 }}>
              {isHi ? "हटाई जाएगी" : "WILL BE DELETED"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{filter.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: th.text }}>
                  {formatCount(count)}
                </div>
                <div style={{ fontSize: 11, color: th.textSub, marginTop: 2 }}>
                  {isHi ? filter.labelHi : filter.label}
                </div>
              </div>
              <div style={{
                marginLeft: "auto",
                fontSize: 11, fontWeight: 700,
                color: th.textSub,
              }}>
                ~{formatBytes(count * AVG_DOC_BYTES)}
              </div>
            </div>
          </div>

          {/* Progress during deletion */}
          {deleting && (
            <div style={{ marginBottom: 14 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 11, color: th.textSub, marginBottom: 6,
              }}>
                <span>{isHi ? "हटाया जा रहा है..." : "Deleting..."}</span>
                <span style={{ fontWeight: 700, color: DANGER }}>
                  {progress.done} / {progress.total}
                </span>
              </div>
              <ProgressBar value={progress.done} max={progress.total} color={DANGER} />
            </div>
          )}

          {/* Risk notice for "all" */}
          {filter.risk === "high" && !deleting && (
            <div style={{
              background: dark ? "rgba(124,58,237,0.15)" : "#F5F3FF",
              border: "1px solid #7C3AED44",
              borderRadius: 10, padding: "10px 12px",
              marginBottom: 14,
              fontSize: 11, color: "#7C3AED", fontWeight: 600,
              lineHeight: 1.6,
            }}>
              ⚡ {isHi
                ? "आप सभी हल हुई रिपोर्ट हटा रहे हैं। सुनिश्चित करें कि आपने ज़रूरी डेटा सहेज लिया है।"
                : "You're deleting ALL resolved reports. Make sure you've exported any data you need."}
            </div>
          )}

          {/* Buttons */}
          {!deleting && (
            <div style={{ display: "flex", gap: 10 }}>
              <div
                onClick={onCancel}
                style={{
                  flex: 1, padding: "13px", borderRadius: 12,
                  border: `1.5px solid ${th.border}`,
                  background: th.inputBg, color: th.textMid,
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  textAlign: "center",
                }}
              >
                {isHi ? "रद्द करें" : "Cancel"}
              </div>
              <div
                onClick={onConfirm}
                style={{
                  flex: 1, padding: "13px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${DANGER}, #b91c1c)`,
                  color: "#fff",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                  textAlign: "center",
                  boxShadow: `0 6px 20px ${DANGER}44`,
                }}
              >
                🗑️ {isHi ? "हाँ, हटाएं" : "Yes, Delete"}
              </div>
            </div>
          )}

          {deleting && (
            <div style={{
              textAlign: "center", padding: "10px 0 2px",
              fontSize: 12, color: th.textSub,
            }}>
              {isHi ? "कृपया प्रतीक्षा करें…" : "Please wait, do not close this screen…"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RESULT TOAST ─────────────────────────────────────────────────────────────
function ResultToast({ result, dark, onDismiss }) {
  const th = THEME[dark ? "dark" : "light"];
  const success = result.type === "success";

  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      zIndex: 9998, minWidth: 260, maxWidth: 340,
      background: success
        ? (dark ? "rgba(19,136,8,0.95)" : "#166534")
        : (dark ? "rgba(220,38,38,0.95)" : "#991B1B"),
      color: "#fff",
      borderRadius: 16, padding: "14px 18px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", gap: 12,
      animation: "slideUp 0.3s ease",
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <span style={{ fontSize: 22 }}>{success ? "✅" : "❌"}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800 }}>{result.title}</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{result.sub}</div>
      </div>
      <div onClick={onDismiss} style={{ cursor: "pointer", opacity: 0.7, fontSize: 16 }}>✕</div>
    </div>
  );
}

// ─── FILTER CARD ──────────────────────────────────────────────────────────────
function FilterCard({ filter, selected, count, loading, dark, lang, onClick }) {
  const th = THEME[dark ? "dark" : "light"];
  const isHi = lang === "hi";
  const active = selected === filter.key;

  return (
    <div
      onClick={onClick}
      style={{
        padding: "14px 14px",
        borderRadius: 16,
        cursor: "pointer",
        border: `2px solid ${active ? filter.color : th.border}`,
        background: active
          ? (dark ? `${filter.color}22` : `${filter.color}10`)
          : th.card,
        transition: "all 0.2s ease",
        boxShadow: active ? `0 4px 16px ${filter.color}30` : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Active indicator stripe */}
      {active && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 3, background: filter.color,
          borderRadius: "16px 16px 0 0",
        }} />
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{filter.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: active ? 800 : 600,
            color: active ? filter.color : th.text,
            lineHeight: 1.3,
          }}>
            {isHi ? filter.labelHi : filter.label}
          </div>

          {/* Count badge */}
          <div style={{ marginTop: 8 }}>
            {loading ? (
              <div style={{
                display: "inline-block",
                width: 60, height: 18, borderRadius: 6,
                background: th.border,
                animation: "shimmer 1.4s infinite",
              }} />
            ) : (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <span style={{
                  fontSize: 18, fontWeight: 900,
                  color: count > 0 ? filter.color : th.textSub,
                }}>
                  {count}
                </span>
                <span style={{ fontSize: 10, color: th.textSub, fontWeight: 600 }}>
                  {isHi ? "रिपोर्ट" : "reports"}
                </span>
                {count > 0 && (
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    color: th.textSub,
                  }}>
                    · ~{formatBytes(count * AVG_DOC_BYTES)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Risk badge */}
        {filter.risk === "high" && (
          <div style={{
            fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
            background: dark ? "rgba(124,58,237,0.2)" : "#F5F3FF",
            color: "#7C3AED",
            border: "1px solid #7C3AED44",
            borderRadius: 6, padding: "2px 7px", flexShrink: 0,
          }}>
            {isHi ? "सावधान" : "CAUTION"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOCK SCREEN ──────────────────────────────────────────────────────────────
function CleanupLockScreen({ dark, lang, onUnlock }) {
  const th = THEME[dark ? "dark" : "light"];
  const isHi = lang === "hi";
  const [pwd,      setPwd]      = useState("");
  const [error,    setError]    = useState("");
  const [checking, setChecking] = useState(false);
  const [shake,    setShake]    = useState(false);

  async function handleUnlock() {
    if (!pwd.trim()) return;
    setChecking(true);
    setError("");
    try {
      const h = await hashStr(pwd);
      if (h === CLEANUP_PWD_HASH) {
        onUnlock();
      } else {
        setError(isHi ? "गलत पासवर्ड। दोबारा कोशिश करें।" : "Incorrect password. Try again.");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setPwd("");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
      `}</style>
      <div style={{
        minHeight: "100%", background: th.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 20px", animation: "fadeIn 0.3s ease",
        fontFamily: "'Noto Sans', sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: 340,
          background: th.card, borderRadius: 24,
          border: `1.5px solid ${th.border}`,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}>
          {/* Header stripe */}
          <div style={{
            background: `linear-gradient(135deg, ${DANGER}22, ${DANGER}08)`,
            borderBottom: `1px solid ${DANGER}30`,
            padding: "28px 24px 22px",
            textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: "0 auto 14px",
              background: `linear-gradient(135deg, ${DANGER}, #9b1c1c)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30,
              boxShadow: `0 8px 24px ${DANGER}44`,
            }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: th.text }}>
              {isHi ? "सफाई पासवर्ड" : "Cleanup Access"}
            </div>
            <div style={{ fontSize: 12, color: th.textSub, marginTop: 6, lineHeight: 1.5 }}>
              {isHi
                ? "यह क्षेत्र केवल अधिकृत लोगों के लिए है।\nपासवर्ड डालें।"
                : "This area is restricted to authorised users only.\nEnter the cleanup password to continue."}
            </div>
          </div>

          {/* Input area */}
          <div style={{ padding: "22px 24px 28px" }}>
            <div style={{
              animation: shake ? "shake 0.5s ease" : "none",
            }}>
              <input
                type="password"
                value={pwd}
                onChange={e => { setPwd(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleUnlock()}
                placeholder={isHi ? "पासवर्ड डालें…" : "Enter cleanup password…"}
                autoFocus
                style={{
                  width: "100%", padding: "14px 16px",
                  borderRadius: 13, fontSize: 14,
                  border: `2px solid ${error ? DANGER : th.border}`,
                  background: th.inputBg, color: th.text,
                  outline: "none", boxSizing: "border-box",
                  fontFamily: "'Noto Sans', sans-serif",
                  transition: "border-color 0.2s",
                }}
              />
              {error && (
                <div style={{
                  marginTop: 8, fontSize: 12, color: DANGER,
                  fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                }}>
                  ⚠️ {error}
                </div>
              )}
            </div>

            <div
              onClick={checking ? undefined : handleUnlock}
              style={{
                marginTop: 14,
                background: checking
                  ? th.border
                  : `linear-gradient(135deg, ${NAVY}, #002060)`,
                borderRadius: 13, padding: "14px",
                color: checking ? th.textSub : "#fff",
                fontSize: 14, fontWeight: 800,
                cursor: checking ? "default" : "pointer",
                textAlign: "center",
                boxShadow: checking ? "none" : `0 8px 24px ${NAVY}44`,
                transition: "all 0.2s",
                letterSpacing: 0.3,
              }}
            >
              {checking
                ? (isHi ? "जाँच हो रही है…" : "Verifying…")
                : (isHi ? "🔓 अनलॉक करें" : "🔓 Unlock")}
            </div>

            {/* Security note */}
            <div style={{
              marginTop: 16, padding: "10px 12px",
              background: th.card2, border: `1px solid ${th.border}`,
              borderRadius: 10, fontSize: 10,
              color: th.textSub, lineHeight: 1.6,
              textAlign: "center",
            }}>
              🛡️ {isHi
                ? "पासवर्ड SHA-256 से सुरक्षित है। यह session के बाद reset हो जाएगा।"
                : "Password is SHA-256 protected. Unlocks for this session only."}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ResolvedReportsCleaner({ dark = false, lang = "en", onDeleteDone }) {
  const th = THEME[dark ? "dark" : "light"];
  const isHi = lang === "hi";

  const [selected,    setSelected]    = useState(null);          // selected filter key
  const [counts,      setCounts]      = useState({});            // { "1m": 4, "3m": 2, ... }
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [progress,    setProgress]    = useState({ done: 0, total: 0 });
  const [result,      setResult]      = useState(null);          // { type, title, sub }
  const [lastDeleted, setLastDeleted] = useState(null);          // timestamp of last cleanup
  const [locked,      setLocked]      = useState(true);          // password gate

  // ── Fetch counts for all filters ──────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const newCounts = {};
      for (const f of AGE_FILTERS) {
        let q;
        if (f.months === 0) {
          // All resolved
          q = query(
            collection(db, "reports"),
            where("status", "==", "resolved"),
          );
        } else {
          const cutoff = getCutoffDate(f.months);
          q = query(
            collection(db, "reports"),
            where("status", "==", "resolved"),
            where("createdAt", "<=", cutoff),
          );
        }
        const snap = await getDocs(q);
        newCounts[f.key] = snap.size;
      }
      setCounts(newCounts);
    } catch (err) {
      console.error("Count fetch error:", err);
    } finally {
      setLoadingCounts(false);
    }
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  // ── Delete handler ─────────────────────────────────────────────────────────
  async function handleDelete() {
    const filter = AGE_FILTERS.find(f => f.key === selected);
    if (!filter) return;

    setDeleting(true);
    setProgress({ done: 0, total: 0 });

    try {
      let q;
      if (filter.months === 0) {
        q = query(
          collection(db, "reports"),
          where("status", "==", "resolved"),
        );
      } else {
        const cutoff = getCutoffDate(filter.months);
        q = query(
          collection(db, "reports"),
          where("status", "==", "resolved"),
          where("createdAt", "<=", cutoff),
        );
      }

      const snap = await getDocs(q);
      const docs = snap.docs;
      setProgress({ done: 0, total: docs.length });

      // Delete in batches of 10 (avoids overwhelming Firestore free tier)
      const BATCH = 10;
      let done = 0;
      for (let i = 0; i < docs.length; i += BATCH) {
        const chunk = docs.slice(i, i + BATCH);
        await Promise.all(chunk.map(d => deleteDoc(doc(db, "reports", d.id))));
        done += chunk.length;
        setProgress({ done, total: docs.length });
        // small pause so UI can breathe
        await new Promise(r => setTimeout(r, 120));
      }

      setLastDeleted(new Date());
      setShowConfirm(false);
      setSelected(null);
      setResult({
        type: "success",
        title: isHi
          ? `${docs.length} रिपोर्ट सफलतापूर्वक हटाई गईं`
          : `${formatCount(docs.length)} deleted successfully`,
        sub: isHi
          ? "Firestore स्टोरेज खाली हो गया"
          : `~${formatBytes(docs.length * AVG_DOC_BYTES)} freed`,
      });
      fetchCounts();        // refresh local counts
      onDeleteDone?.();     // refresh Reports tab badge in AdminDashboard
    } catch (err) {
      console.error("Delete error:", err);
      setShowConfirm(false);
      setResult({
        type: "error",
        title: isHi ? "हटाने में त्रुटि" : "Deletion Failed",
        sub: isHi ? "दोबारा कोशिश करें" : "Check console for details",
      });
    } finally {
      setDeleting(false);
    }
  }

  const selectedFilter = AGE_FILTERS.find(f => f.key === selected);
  const selectedCount  = selected ? (counts[selected] ?? 0) : 0;
  const totalResolved  = counts["all"] ?? 0;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.4; }
          50%  { opacity: 0.9; }
          100% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── LOCK SCREEN ── */}
      {locked && (
        <CleanupLockScreen
          dark={dark}
          lang={lang}
          onUnlock={() => setLocked(false)}
        />
      )}

      {/* ── MAIN CLEANER (only shown when unlocked) ── */}
      {!locked && (<>
      <div style={{
        background: th.bg,
        minHeight: "100%",
        fontFamily: "'Noto Sans', sans-serif",
        animation: "fadeIn 0.3s ease",
      }}>

        {/* ── Header ── */}
        <div style={{
          background: th.card,
          borderBottom: `1px solid ${th.border}`,
          padding: "18px 16px 14px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg, ${DANGER}, #9b1c1c)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
              boxShadow: `0 4px 14px ${DANGER}44`,
            }}>
              🗑️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: th.text }}>
                {isHi ? "पुरानी रिपोर्ट साफ करें" : "Clean Old Reports"}
              </div>
              <div style={{ fontSize: 11, color: th.textSub, marginTop: 2 }}>
                {isHi
                  ? "केवल हल हुई रिपोर्ट हटाई जाएंगी"
                  : "Only resolved reports will be deleted"}
              </div>
            </div>

            {/* Re-lock button */}
            <div
              onClick={() => { setLocked(true); setSelected(null); setShowConfirm(false); }}
              title="Lock cleanup"
              style={{
                padding: "7px 10px", borderRadius: 10,
                fontSize: 16, cursor: "pointer",
                background: `${DANGER}15`,
                border: `1.5px solid ${DANGER}40`,
                color: DANGER,
                display: "flex", alignItems: "center",
              }}
            >🔒</div>

            {/* Refresh counts */}
            <div
              onClick={() => !loadingCounts && fetchCounts()}
              style={{
                padding: "7px 12px", borderRadius: 10,
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                background: th.inputBg, border: `1.5px solid ${th.border}`,
                color: loadingCounts ? th.textSub : th.textMid,
                display: "flex", alignItems: "center", gap: 5,
                opacity: loadingCounts ? 0.6 : 1,
              }}
            >
              <span style={{
                display: "inline-block",
                animation: loadingCounts ? "spin 1s linear infinite" : "none",
              }}>↻</span>
              {isHi ? "रिफ्रेश" : "Refresh"}
            </div>
          </div>

          {/* Storage summary bar */}
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: th.card2, border: `1px solid ${th.border}`,
            borderRadius: 12,
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 11, color: th.textSub, fontWeight: 600,
                marginBottom: 4,
              }}>
                {isHi ? "कुल हल हुई रिपोर्ट" : "Total Resolved Reports"}
              </div>
              <ProgressBar
                value={totalResolved}
                max={Math.max(totalResolved, 1)}
                color={IND_GREEN}
              />
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: IND_GREEN }}>
                {loadingCounts ? "—" : totalResolved}
              </div>
              <div style={{ fontSize: 9, color: th.textSub, fontWeight: 600 }}>
                ~{formatBytes(totalResolved * AVG_DOC_BYTES)}
              </div>
            </div>
          </div>

          {/* Last cleanup notice */}
          {lastDeleted && (
            <div style={{
              marginTop: 10, fontSize: 11,
              color: IND_GREEN, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              ✅ {isHi ? "अंतिम सफाई:" : "Last cleanup:"}{" "}
              {lastDeleted.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        {/* ── Filter Grid ── */}
        <div style={{ padding: "16px 14px" }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: th.textMid,
            letterSpacing: 0.4, marginBottom: 10,
          }}>
            {isHi ? "फ़िल्टर चुनें — केवल हल हुई रिपोर्ट" : "SELECT FILTER — RESOLVED REPORTS ONLY"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {AGE_FILTERS.map(filter => (
              <FilterCard
                key={filter.key}
                filter={filter}
                selected={selected}
                count={counts[filter.key] ?? 0}
                loading={loadingCounts}
                dark={dark}
                lang={lang}
                onClick={() => setSelected(selected === filter.key ? null : filter.key)}
              />
            ))}
          </div>
        </div>

        {/* ── Action Panel (appears when filter selected) ── */}
        {selected && (
          <div style={{
            margin: "0 14px 24px",
            background: th.card,
            border: `1.5px solid ${selectedFilter?.color ?? th.border}`,
            borderRadius: 16,
            padding: "16px",
            animation: "fadeIn 0.25s ease",
          }}>
            {selectedCount === 0 ? (
              /* Nothing to delete */
              <div style={{ textAlign: "center", padding: "14px 0" }}>
                <div style={{ fontSize: 34, marginBottom: 8 }}>✨</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: th.text }}>
                  {isHi ? "कोई रिपोर्ट नहीं मिली" : "Nothing to Delete"}
                </div>
                <div style={{ fontSize: 12, color: th.textSub, marginTop: 4 }}>
                  {isHi
                    ? "इस फ़िल्टर में कोई पुरानी हल हुई रिपोर्ट नहीं है।"
                    : "No resolved reports match this filter."}
                </div>
              </div>
            ) : (
              /* Ready to delete */
              <>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 14,
                }}>
                  <span style={{ fontSize: 26 }}>{selectedFilter?.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: th.text }}>
                      {formatCount(selectedCount)} {isHi ? "हटाई जाएंगी" : "will be deleted"}
                    </div>
                    <div style={{ fontSize: 11, color: th.textSub, marginTop: 2 }}>
                      {isHi ? selectedFilter?.labelHi : selectedFilter?.label}
                      {" · ~"}{formatBytes(selectedCount * AVG_DOC_BYTES)}
                    </div>
                  </div>
                </div>

                {/* Safety checklist */}
                <div style={{
                  background: dark ? "rgba(255,153,51,0.08)" : "#FFFBEB",
                  border: `1px solid ${SAFFRON}44`,
                  borderRadius: 10, padding: "10px 12px",
                  marginBottom: 14, fontSize: 11,
                  color: dark ? SAFFRON : "#92400E",
                  lineHeight: 1.7,
                }}>
                  ⚠️ {isHi
                    ? "सुनिश्चित करें कि आपने ज़रूरी रिपोर्ट CSV में export कर लिया है।"
                    : "Tip: Export important reports as CSV from the Reports tab before deleting."}
                </div>

                <div
                  onClick={() => setShowConfirm(true)}
                  style={{
                    background: `linear-gradient(135deg, ${DANGER}, #9b1c1c)`,
                    borderRadius: 13, padding: "14px 20px",
                    color: "#fff", fontSize: 14, fontWeight: 800,
                    cursor: "pointer", textAlign: "center",
                    boxShadow: `0 8px 24px ${DANGER}44`,
                    transition: "all 0.2s",
                    letterSpacing: 0.2,
                  }}
                >
                  🗑️ {isHi
                    ? `${selectedCount} रिपोर्ट हटाएं`
                    : `Delete ${selectedCount} Report${selectedCount !== 1 ? "s" : ""}`}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Info Footer ── */}
        <div style={{
          margin: "0 14px 32px",
          background: th.card2,
          border: `1px solid ${th.border}`,
          borderRadius: 14, padding: "12px 14px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: th.textSub, marginBottom: 8 }}>
            {isHi ? "📌 ध्यान रखें" : "📌 IMPORTANT NOTES"}
          </div>
          {[
            isHi
              ? "केवल 'Resolved' स्टेटस वाली रिपोर्ट हटाई जाती हैं।"
              : "Only reports with status = 'Resolved' are deleted.",
            isHi
              ? "Open या In Progress रिपोर्ट कभी नहीं हटाई जाएंगी।"
              : "Open & In Progress reports are never touched.",
            isHi
              ? "हटाने के बाद डेटा वापस नहीं आता।"
              : "Deletion is permanent and cannot be undone.",
            isHi
              ? "एक बार में 1,000 से अधिक रिपोर्ट हटाने में कुछ सेकंड लग सकते हैं।"
              : "Deleting 1,000+ reports may take a few seconds.",
          ].map((note, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, marginBottom: 5,
              fontSize: 11, color: th.textSub, lineHeight: 1.5,
            }}>
              <span style={{ flexShrink: 0, color: IND_GREEN }}>✓</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirm && selectedFilter && (
        <ConfirmModal
          filter={selectedFilter}
          count={selectedCount}
          dark={dark}
          lang={lang}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setShowConfirm(false)}
          deleting={deleting}
          progress={progress}
        />
      )}

      {/* ── Result Toast ── */}
      {result && (
        <ResultToast
          result={result}
          dark={dark}
          onDismiss={() => setResult(null)}
        />
      )}

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </>
    )} {/* end !locked */}
    </>
  );
}
