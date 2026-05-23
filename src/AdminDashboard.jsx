// AdminDashboard.jsx — YojanaSetu Admin Panel (Advanced)
// Enhanced with: Analytics tab, donut charts, user detail drawer,
// sorting, pagination, filtered CSV export, refresh, more metrics

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";
import { SCHEME_DB, INDIA_STATES } from "./schemesData.js";

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEME = {
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#fff", overlay:"rgba(0,0,0,0.45)",
    drawerBg:"#fff",
  },
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e", overlay:"rgba(0,0,0,0.65)",
    drawerBg:"#1c1c1e",
  },
};

const SAFFRON   = "#FF9933";
const NAVY      = "#003580";
const IND_GREEN = "#138808";
const VIOLET    = "#8B5CF6";
const PINK      = "#EC4899";
const GOOGLE_B  = "#4285F4";

const OCC_LABELS = {
  farmer:"Farmer", student:"Student", women:"Homemaker",
  senior:"Senior Citizen", business:"Business Owner", general:"General",
};
const OCC_EMOJI = {
  farmer:"🌾", student:"📚", women:"👩", senior:"👴", business:"💼", general:"👤",
};
const INC_LABELS = {
  below1:"< ₹1L", "1to3":"₹1–3L", "3to6":"₹3–6L", above6:"> ₹6L",
};
const AGE_LABELS = {
  below18:"< 18", "18to35":"18–35", "35to60":"35–60", above60:"60+",
};
const AREA_LABELS = { rural:"Rural", urban:"Urban", semi:"Semi-Urban" };

const DONUT_COLORS = [NAVY, SAFFRON, IND_GREEN, VIOLET, PINK, GOOGLE_B, "#F59E0B", "#10B981"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"2-digit" });
}

function timeAgo(ts) {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
function DonutChart({ data, size = 120, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ color:th.textSub, fontSize:12 }}>No data</div>;

  const r = 44; const cx = 60; const cy = 60;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const el = (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
        strokeWidth={14}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        style={{ transition:"stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <div style={{ display:"flex", alignItems:"center", gap:14 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink:0 }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none"
          stroke={th.border} strokeWidth={14} />
        {slices}
        {/* Center label */}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize={18}
          fontWeight={800} fill={th.text}>{total}</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9}
          fill={th.textSub}>total</text>
      </svg>
      {/* Legend */}
      <div style={{ display:"flex", flexDirection:"column", gap:5, flex:1, minWidth:0 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{
              width:8, height:8, borderRadius:2, flexShrink:0,
              background: DONUT_COLORS[i % DONUT_COLORS.length],
            }} />
            <div style={{
              fontSize:11, color:th.textMid, flex:1,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
            }}>
              {d.label}
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:th.text, flexShrink:0 }}>
              {Math.round((d.value / total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
function BarChart({ data, color, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {data.map(({ label, value }) => (
        <div key={label} style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:88, flexShrink:0, fontSize:11, color:th.textMid,
            textAlign:"right", fontWeight:500, overflow:"hidden",
            textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {label}
          </div>
          <div style={{
            flex:1, height:20, background:th.border,
            borderRadius:6, overflow:"hidden", position:"relative",
          }}>
            <div style={{
              height:"100%", borderRadius:6,
              width:`${(value / max) * 100}%`,
              background:`linear-gradient(90deg,${color},${color}cc)`,
              transition:"width 0.6s cubic-bezier(0.22,1,0.36,1)",
              minWidth:value > 0 ? 24 : 0,
              display:"flex", alignItems:"center", justifyContent:"flex-end",
              paddingRight:6,
            }}>
              <span style={{ fontSize:10, color:"#fff", fontWeight:700 }}>
                {value}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SPARKLINE (7-day trend) ───────────────────────────────────────────────────
function Sparkline({ points, color, width = 80, height = 28 }) {
  if (!points || points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const w = width; const h = height;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(v => h - ((v - min) / range) * (h - 4) - 2);
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow:"visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length-1]} cy={ys[ys.length-1]} r={3} fill={color} />
    </svg>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, dark, trend, sparkline }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{
      background: th.card,
      border:`1.5px solid ${th.border}`,
      borderRadius:14, padding:"13px 14px",
      flex:1, minWidth:0,
      borderTop:`3px solid ${color}`,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontSize:18 }}>{icon}</div>
        {sparkline && <Sparkline points={sparkline} color={color} />}
      </div>
      <div style={{ fontSize:22, fontWeight:800, color:th.text, lineHeight:1, marginTop:4 }}>
        {value}
      </div>
      <div style={{ fontSize:10, color:th.textSub, marginTop:3, fontWeight:500 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize:9, color, marginTop:2, fontWeight:600 }}>
          {sub}
        </div>
      )}
      {trend !== undefined && (
        <div style={{
          fontSize:9, marginTop:3, fontWeight:700,
          color: trend >= 0 ? IND_GREEN : "#E53E3E",
        }}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
function Badge({ label, color, bg }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 7px", borderRadius:8,
      fontSize:9, fontWeight:700, color, background:bg || `${color}18`,
    }}>
      {label}
    </span>
  );
}

// ─── USER DETAIL DRAWER ───────────────────────────────────────────────────────
function UserDrawer({ user, dark, onClose }) {
  const th = THEME[dark ? "dark" : "light"];
  if (!user) return null;
  const initial = (user.name || "?").charAt(0).toUpperCase();

  const fields = [
    { label:"Phone",      value: user.phone   || "—" },
    { label:"Email",      value: user.email   || "—" },
    { label:"State",      value: user.state   || "—" },
    { label:"Occupation", value: OCC_LABELS[user.occupation] || user.occupation || "—" },
    { label:"Income",     value: INC_LABELS[user.income]     || user.income     || "—" },
    { label:"Age Group",  value: AGE_LABELS[user.age]        || user.age        || "—" },
    { label:"Area",       value: AREA_LABELS[user.area]      || user.area       || "—" },
    { label:"Housing",    value: user.house === "yes" ? "Owns House" : user.house === "no" ? "No House" : "—" },
    { label:"Language",   value: user.lang    || "—" },
    { label:"Joined",     value: formatDate(user.createdAt) },
    { label:"Last Seen",  value: formatDate(user.lastSeen) },
  ];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, zIndex:10000,
        background:th.overlay,
      }} />
      {/* Drawer */}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:10001,
        background:th.drawerBg,
        borderRadius:"20px 20px 0 0",
        padding:"0 0 40px 0",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.2)",
        maxHeight:"80vh",
        overflowY:"auto",
      }}>
        {/* Handle */}
        <div style={{
          width:36, height:4, borderRadius:2,
          background:th.border, margin:"12px auto 0",
        }} />

        {/* Avatar + Name */}
        <div style={{
          display:"flex", flexDirection:"column", alignItems:"center",
          padding:"20px 20px 16px",
          borderBottom:`1px solid ${th.border}`,
        }}>
          {user.photo ? (
            <img src={user.photo} alt={initial} referrerPolicy="no-referrer"
              style={{ width:64, height:64, borderRadius:"50%", objectFit:"cover" }} />
          ) : (
            <div style={{
              width:64, height:64, borderRadius:"50%",
              background:`linear-gradient(135deg,${SAFFRON},${NAVY})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:24, fontWeight:800, color:"#fff",
            }}>
              {initial}
            </div>
          )}
          <div style={{ fontSize:17, fontWeight:800, color:th.text, marginTop:10 }}>
            {user.name || "Unknown"}
          </div>
          <div style={{ fontSize:11, color:th.textSub, marginTop:3 }}>
            UID: {user.id}
          </div>
          <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap", justifyContent:"center" }}>
            {user.photo && <Badge label="Google Account" color={GOOGLE_B} />}
            {user.occupation && <Badge label={OCC_LABELS[user.occupation] || user.occupation} color={SAFFRON} />}
            {user.area && <Badge label={AREA_LABELS[user.area] || user.area} color={IND_GREEN} />}
          </div>
        </div>

        {/* Fields grid */}
        <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:0 }}>
          {fields.map(({ label, value }) => (
            <div key={label} style={{
              display:"flex", justifyContent:"space-between",
              padding:"10px 0",
              borderBottom:`1px solid ${th.border}`,
            }}>
              <div style={{ fontSize:12, color:th.textSub }}>{label}</div>
              <div style={{ fontSize:12, fontWeight:600, color:th.text, textAlign:"right", maxWidth:"55%" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        <div onClick={onClose} style={{
          margin:"12px 20px 0", padding:"12px",
          background:th.border, borderRadius:12,
          textAlign:"center", fontSize:13, fontWeight:700,
          color:th.textMid, cursor:"pointer",
        }}>
          Close
        </div>
      </div>
    </>
  );
}

// ─── USER ROW ─────────────────────────────────────────────────────────────────
function UserRow({ user, dark, onTap }) {
  const th = THEME[dark ? "dark" : "light"];
  const initial = (user.name || "?").charAt(0).toUpperCase();
  return (
    <div onClick={() => onTap(user)} style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 0", borderBottom:`1px solid ${th.border}`,
      cursor:"pointer",
    }}>
      {user.photo ? (
        <img src={user.photo} alt={initial} referrerPolicy="no-referrer"
          style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
      ) : (
        <div style={{
          width:36, height:36, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${SAFFRON},${NAVY})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:14, fontWeight:800, color:"#fff",
        }}>
          {initial}
        </div>
      )}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{
          fontSize:13, fontWeight:700, color:th.text,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        }}>
          {user.name || "—"}
        </div>
        <div style={{ fontSize:10, color:th.textSub, marginTop:1 }}>
          {OCC_EMOJI[user.occupation] || "👤"} {OCC_LABELS[user.occupation] || user.occupation || "—"}
          {" · "}{user.state || "—"}
        </div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontSize:10, color:th.textMid, fontWeight:600 }}>
          {user.phone ? `📱 ${user.phone}` : user.email ? `✉ ${user.email.split("@")[0]}` : "—"}
        </div>
        <div style={{ fontSize:9, color:th.textSub, marginTop:2 }}>
          {timeAgo(user.lastSeen)}
        </div>
      </div>
      <div style={{ fontSize:14, color:th.textSub, flexShrink:0 }}>›</div>
    </div>
  );
}

// ─── SORT ICON ────────────────────────────────────────────────────────────────
function SortBtn({ field, current, dir, onClick, label, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const active = current === field;
  return (
    <div onClick={() => onClick(field)} style={{
      padding:"6px 10px", borderRadius:8,
      fontSize:11, fontWeight:700, cursor:"pointer",
      background: active ? NAVY : th.border,
      color: active ? "#fff" : th.textMid,
      display:"flex", alignItems:"center", gap:4,
      flexShrink:0,
    }}>
      {label}
      {active && <span>{dir === "asc" ? " ↑" : " ↓"}</span>}
    </div>
  );
}

// ─── CROSS-TAB TABLE ──────────────────────────────────────────────────────────
function CrossTab({ data, rowKey, colKey, rowLabels, colLabels, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const rows = Object.keys(rowLabels);
  const cols = Object.keys(colLabels);
  const table = {};
  rows.forEach(r => { table[r] = {}; cols.forEach(c => { table[r][c] = 0; }); });
  data.forEach(u => {
    const r = u[rowKey]; const c = u[colKey];
    if (table[r] !== undefined && c !== undefined) {
      table[r][c] = (table[r][c] || 0) + 1;
    }
  });
  const cellStyle = {
    padding:"6px 8px", fontSize:11, textAlign:"center",
    borderBottom:`1px solid ${th.border}`,
  };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, textAlign:"left", color:th.textSub, fontWeight:600 }}></th>
            {cols.map(c => (
              <th key={c} style={{ ...cellStyle, color:th.textSub, fontWeight:600 }}>
                {colLabels[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r}>
              <td style={{ ...cellStyle, textAlign:"left", fontWeight:700, color:th.textMid }}>
                {rowLabels[r]}
              </td>
              {cols.map(c => {
                const v = table[r][c] || 0;
                const rowTotal = cols.reduce((s, cc) => s + (table[r][cc] || 0), 0);
                const pct = rowTotal ? Math.round((v / rowTotal) * 100) : 0;
                return (
                  <td key={c} style={{
                    ...cellStyle,
                    background: v > 0
                      ? `rgba(0,53,128,${0.05 + (pct / 100) * 0.3})`
                      : "transparent",
                    color: th.text,
                    fontWeight: v > 0 ? 700 : 400,
                  }}>
                    {v > 0 ? `${v}` : "·"}
                    {v > 0 && <span style={{ fontSize:8, color:th.textSub, marginLeft:2 }}>{pct}%</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed({ users, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  // Sort by lastSeen, take top 15
  const recent = [...users]
    .filter(u => u.lastSeen)
    .sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0))
    .slice(0, 15);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {recent.map((u, i) => {
        const initial = (u.name || "?").charAt(0).toUpperCase();
        return (
          <div key={u.id} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"9px 0",
            borderBottom: i < recent.length - 1 ? `1px solid ${th.border}` : "none",
            position:"relative",
          }}>
            {/* Timeline line */}
            {i < recent.length - 1 && (
              <div style={{
                position:"absolute", left:16, top:40, width:2,
                height:"calc(100% - 16px)",
                background:th.border, borderRadius:1,
              }} />
            )}
            {u.photo ? (
              <img src={u.photo} alt={initial} referrerPolicy="no-referrer"
                style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0, zIndex:1 }} />
            ) : (
              <div style={{
                width:32, height:32, borderRadius:"50%", flexShrink:0, zIndex:1,
                background:`linear-gradient(135deg,${SAFFRON},${NAVY})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:800, color:"#fff",
              }}>
                {initial}
              </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:700, color:th.text }}>
                {u.name || "Unknown"}
              </div>
              <div style={{ fontSize:10, color:th.textSub, marginTop:1 }}>
                {u.state || "?"} · {OCC_LABELS[u.occupation] || "?"}
              </div>
            </div>
            <div style={{ fontSize:9, color:th.textSub, flexShrink:0 }}>
              {timeAgo(u.lastSeen)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SCHEME COVERAGE TAB ──────────────────────────────────────────────────────
function SchemeCoverageTab({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("count"); // "count" | "alpha"

  // Build per-state and central counts from SCHEME_DB
  // Structure: scope:"national" → central | scope:"state" + state:"State Name" → per-state
  const { centralCount, stateCounts, totalSchemes } = useMemo(() => {
    const counts = {};
    let central = 0;
    const all = Array.isArray(SCHEME_DB) ? SCHEME_DB : Object.values(SCHEME_DB || {});
    all.forEach(scheme => {
      if (scheme.scope === "national") {
        central++;
      } else if (scheme.scope === "state" && scheme.state) {
        counts[scheme.state] = (counts[scheme.state] || 0) + 1;
      }
    });
    return { centralCount: central, stateCounts: counts, totalSchemes: all.length };
  }, []);

  // Build full list: every state from INDIA_STATES gets a row (even if 0)
  const rows = useMemo(() => {
    const stateList = Array.isArray(INDIA_STATES) ? INDIA_STATES : Object.values(INDIA_STATES || {});
    return stateList.map(state => ({
      name: state,
      count: stateCounts[state] || 0,
    }));
  }, [stateCounts]);

  const maxCount = useMemo(() => Math.max(...rows.map(r => r.count), 1), [rows]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = q ? rows.filter(r => r.name.toLowerCase().includes(q)) : rows;
    return [...list].sort((a, b) =>
      sortMode === "count" ? b.count - a.count : a.name.localeCompare(b.name)
    );
  }, [rows, query, sortMode]);

  // Summary buckets
  const withSchemes  = rows.filter(r => r.count > 0).length;
  const noSchemes    = rows.filter(r => r.count === 0).length;
  const highCoverage = rows.filter(r => r.count >= 5).length;

  function coverageColor(count) {
    if (count === 0)  return "#E53E3E";
    if (count <= 2)   return SAFFRON;
    if (count <= 5)   return "#F59E0B";
    return IND_GREEN;
  }
  function coverageLabel(count) {
    if (count === 0)  return "None";
    if (count <= 2)   return "Low";
    if (count <= 5)   return "Medium";
    return "Good";
  }

  return (
    <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:12 }}>

      {/* Summary pills */}
      <div style={{ display:"flex", gap:8 }}>
        {[
          { label:"Total Schemes", value:totalSchemes, color:NAVY },
          { label:"🇮🇳 Central",    value:centralCount,  color:VIOLET },
          { label:"States Active", value:withSchemes,  color:IND_GREEN },
          { label:"States Empty",  value:noSchemes,    color:"#E53E3E" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            flex:1, background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:12, padding:"10px 8px", textAlign:"center",
            borderTop:`3px solid ${color}`, minWidth:0,
          }}>
            <div style={{ fontSize:18, fontWeight:800, color:th.text }}>{value}</div>
            <div style={{ fontSize:9, color:th.textSub, marginTop:2, lineHeight:1.3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Central schemes banner */}
      <div style={{
        background:`linear-gradient(135deg,${NAVY},#1a56db)`,
        borderRadius:14, padding:"13px 16px",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div style={{ fontSize:28 }}>🇮🇳</div>
        <div style={{ flex:1 }}>
          <div style={{ color:"#fff", fontSize:13, fontWeight:800 }}>
            Central Government Schemes
          </div>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:2 }}>
            Available to all states · Apply across India
          </div>
        </div>
        <div style={{
          background:"rgba(255,255,255,0.2)", borderRadius:10,
          padding:"7px 13px", color:"#fff", fontSize:20, fontWeight:800,
        }}>
          {centralCount}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        background:th.card, border:`1.5px solid ${th.border}`,
        borderRadius:12, padding:"10px 14px",
        display:"flex", gap:12, flexWrap:"wrap", alignItems:"center",
      }}>
        <div style={{ fontSize:11, color:th.textSub, fontWeight:600, flexShrink:0 }}>Coverage:</div>
        {[
          { label:"None (0)",  color:"#E53E3E" },
          { label:"Low (1–2)", color:SAFFRON },
          { label:"Medium (3–5)", color:"#F59E0B" },
          { label:"Good (6+)", color:IND_GREEN },
        ].map(({ label, color }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:color, flexShrink:0 }} />
            <span style={{ fontSize:10, color:th.textMid }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Search + sort controls */}
      <div style={{ display:"flex", gap:8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍  Search state…"
          style={{
            flex:1, padding:"9px 12px", borderRadius:10,
            border:`1.5px solid ${th.border}`, background:th.inputBg,
            color:th.text, fontSize:12, outline:"none", fontFamily:"inherit",
          }}
        />
        <div style={{ display:"flex", gap:4 }}>
          {[
            { id:"count", label:"# Count" },
            { id:"alpha", label:"A–Z" },
          ].map(({ id, label }) => (
            <div key={id} onClick={() => setSortMode(id)} style={{
              padding:"8px 11px", borderRadius:10, fontSize:11, fontWeight:700,
              cursor:"pointer", flexShrink:0,
              background: sortMode === id ? NAVY : th.border,
              color: sortMode === id ? "#fff" : th.textMid,
              border: sortMode === id ? `1.5px solid ${NAVY}` : `1.5px solid ${th.border}`,
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div style={{ fontSize:11, color:th.textSub, fontWeight:600, marginTop:-4 }}>
        Showing {filtered.length} of {rows.length} states
      </div>

      {/* State rows */}
      <div style={{
        background:th.card, border:`1.5px solid ${th.border}`,
        borderRadius:16, padding:"4px 14px",
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding:"24px 0", textAlign:"center", color:th.textSub, fontSize:13 }}>
            No states match "{query}"
          </div>
        ) : (
          filtered.map(({ name, count }, idx) => {
            const color = coverageColor(count);
            const pct   = Math.round((count / maxCount) * 100);
            return (
              <div key={name} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"11px 0",
                borderBottom: idx < filtered.length - 1 ? `1px solid ${th.border}` : "none",
              }}>
                {/* State name */}
                <div style={{
                  width:130, flexShrink:0,
                  fontSize:12, fontWeight:600, color:th.text,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>
                  📍 {name}
                </div>

                {/* Progress bar */}
                <div style={{
                  flex:1, height:18, background:th.border,
                  borderRadius:6, overflow:"hidden", position:"relative",
                }}>
                  <div style={{
                    height:"100%", borderRadius:6,
                    width: count > 0 ? `${Math.max(pct, 8)}%` : "0%",
                    background:`linear-gradient(90deg,${color},${color}cc)`,
                    transition:"width 0.5s cubic-bezier(0.22,1,0.36,1)",
                    display:"flex", alignItems:"center", justifyContent:"flex-end",
                    paddingRight:6,
                  }}>
                    {count > 0 && (
                      <span style={{ fontSize:10, color:"#fff", fontWeight:700 }}>
                        {count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Count badge */}
                <div style={{
                  width:38, flexShrink:0, textAlign:"right",
                  fontSize:13, fontWeight:800, color,
                }}>
                  {count}
                </div>

                {/* Coverage label */}
                <div style={{
                  width:50, flexShrink:0,
                  fontSize:9, fontWeight:700, color,
                  background:`${color}18`,
                  borderRadius:6, padding:"2px 6px",
                  textAlign:"center",
                }}>
                  {coverageLabel(count)}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tip */}
      <div style={{
        background:th.card2, border:`1.5px dashed ${th.border}`,
        borderRadius:12, padding:"12px 14px",
        fontSize:11, color:th.textSub, lineHeight:1.6,
      }}>
        💡 <strong style={{ color:th.text }}>Tip:</strong> States in red have 0 schemes — focus your additions there.
        Sort by <strong style={{ color:th.text }}>Count</strong> to instantly see the gaps.
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function AdminDashboard({ onClose, dark = false }) {
  const th = THEME[dark ? "dark" : "light"];

  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [refreshing,    setRefreshing]    = useState(false);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [filterOcc,     setFilterOcc]     = useState("all");
  const [filterState,   setFilterState]   = useState("all");
  const [filterArea,    setFilterArea]    = useState("all");
  const [filterIncome,  setFilterIncome]  = useState("all");
  const [sortField,     setSortField]     = useState("lastSeen");
  const [sortDir,       setSortDir]       = useState("desc");
  const [page,          setPage]          = useState(1);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedUser,  setSelectedUser]  = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const snap = await getDocs(collection(db, "users"));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0));
      setUsers(data);
    } catch (err) {
      setError("Failed to load users. Check Firestore rules.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  // ── Computed stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = Date.now();
    const ONE_DAY = 86400000;
    const ONE_WEEK = ONE_DAY * 7;
    const TWO_WEEKS = ONE_WEEK * 2;

    const byState = groupBy(users, "state");
    const byOcc   = groupBy(users, "occupation");
    const byInc   = groupBy(users, "income");
    const byAge   = groupBy(users, "age");
    const byArea  = groupBy(users, "area");

    const topStates = Object.entries(byState)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    const occData = Object.entries(byOcc).sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        label: `${OCC_EMOJI[key] || ""} ${OCC_LABELS[key] || key}`, value,
      }));

    const incData = Object.entries(byInc)
      .map(([key, value]) => ({ label: INC_LABELS[key] || key, value }));

    const areaData = Object.entries(byArea)
      .map(([key, value]) => ({ label: AREA_LABELS[key] || key, value }));

    const ageData = Object.entries(byAge)
      .map(([key, value]) => ({ label: AGE_LABELS[key] || key, value }));

    const occDonut = Object.entries(byOcc).sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        label: `${OCC_EMOJI[key] || ""} ${OCC_LABELS[key] || key}`, value,
      }));

    const areaDonut = Object.entries(byArea)
      .map(([key, value]) => ({ label: AREA_LABELS[key] || key, value }));

    const activeToday = users.filter(u =>
      u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < ONE_DAY
    ).length;

    const activeWeek = users.filter(u =>
      u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < ONE_WEEK
    ).length;

    const newThisWeek = users.filter(u =>
      u.createdAt?.seconds && (now - u.createdAt.seconds * 1000) < ONE_WEEK
    ).length;

    const newLastWeek = users.filter(u =>
      u.createdAt?.seconds &&
      (now - u.createdAt.seconds * 1000) >= ONE_WEEK &&
      (now - u.createdAt.seconds * 1000) < TWO_WEEKS
    ).length;

    const weekGrowth = newLastWeek > 0
      ? Math.round(((newThisWeek - newLastWeek) / newLastWeek) * 100)
      : 0;

    const googleUsers  = users.filter(u => u.photo).length;
    const statesCount  = Object.keys(byState).length;
    const housedUsers  = users.filter(u => u.house === "yes").length;
    const needHousing  = users.filter(u => u.house === "no").length;

    // 7-day signup sparkline
    const spark = Array.from({ length:7 }, (_, i) => {
      const dayStart = now - (6 - i) * ONE_DAY;
      const dayEnd   = dayStart + ONE_DAY;
      return users.filter(u => {
        if (!u.createdAt?.seconds) return false;
        const ms = u.createdAt.seconds * 1000;
        return ms >= dayStart && ms < dayEnd;
      }).length;
    });

    return {
      topStates, occData, incData, areaData, ageData,
      occDonut, areaDonut,
      activeToday, activeWeek, newThisWeek, weekGrowth,
      googleUsers, statesCount, housedUsers, needHousing, spark,
    };
  }, [users]);

  // ── Sort helper ───────────────────────────────────────────────────────────
  const handleSort = useCallback((field) => {
    setSortDir(prev => sortField === field ? (prev === "asc" ? "desc" : "asc") : "desc");
    setSortField(field);
    setPage(1);
  }, [sortField]);

  // ── Filtered + sorted users ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (u.name  || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.state || "").toLowerCase().includes(q);
      const matchOcc    = filterOcc    === "all" || u.occupation === filterOcc;
      const matchState  = filterState  === "all" || u.state      === filterState;
      const matchArea   = filterArea   === "all" || u.area       === filterArea;
      const matchIncome = filterIncome === "all" || u.income     === filterIncome;
      return matchSearch && matchOcc && matchState && matchArea && matchIncome;
    });
    // Sort
    list.sort((a, b) => {
      let va, vb;
      if (sortField === "lastSeen") {
        va = a.lastSeen?.seconds || 0;
        vb = b.lastSeen?.seconds || 0;
      } else if (sortField === "createdAt") {
        va = a.createdAt?.seconds || 0;
        vb = b.createdAt?.seconds || 0;
      } else if (sortField === "name") {
        va = (a.name || "").toLowerCase();
        vb = (b.name || "").toLowerCase();
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
    return list;
  }, [users, search, filterOcc, filterState, filterArea, filterIncome, sortField, sortDir]);

  // ── Paginated slice ────────────────────────────────────────────────────────
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSlice   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Unique values for filter dropdowns ────────────────────────────────────
  const allStates = useMemo(() =>
    [...new Set(users.map(u => u.state).filter(Boolean))].sort()
  , [users]);

  // ── CSV Export (filtered) ─────────────────────────────────────────────────
  const exportCSV = useCallback((list = users) => {
    const headers = ["Name","Phone","Email","State","Occupation","Income","Age","Area","Housing","Joined","Last Seen"];
    const rows = list.map(u => [
      u.name || "", u.phone || "", u.email || "", u.state || "",
      OCC_LABELS[u.occupation] || u.occupation || "",
      INC_LABELS[u.income]     || u.income     || "",
      AGE_LABELS[u.age]        || u.age        || "",
      AREA_LABELS[u.area]      || u.area       || "",
      u.house === "yes" ? "Owns House" : "Needs Housing",
      formatDate(u.createdAt), formatDate(u.lastSeen),
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `yojanasetu_users_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [users]);

  // ─────────────────────────────────────────────────────────────────────────
  const TABS = [
    ["overview",  "📊 Overview"],
    ["users",     "👥 Users"],
    ["analytics", "🧮 Analytics"],
    ["activity",  "🕐 Activity"],
    ["schemes",   "🗺️ Schemes"],
  ];

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:th.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'Noto Sans',sans-serif",
      overflowY:"auto",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background:`linear-gradient(135deg,${NAVY} 0%,rgba(0,53,128,0.92) 60%,rgba(255,153,51,0.85) 100%)`,
        padding:"18px 18px 0", flexShrink:0,
        boxShadow:"0 4px 20px rgba(0,53,128,0.3)",
        position:"sticky", top:0, zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div onClick={onClose} style={{
            width:36, height:36, borderRadius:10,
            background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:16, flexShrink:0,
          }}>←</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:17, fontWeight:800 }}>
              🛡️ Admin Dashboard
            </div>
            <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginTop:2 }}>
              YojanaSetu · {loading ? "Loading…" : `${users.length} users`}
            </div>
          </div>
          {/* Refresh */}
          <div onClick={() => fetchUsers(true)} style={{
            background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.25)",
            borderRadius:10, padding:"7px 10px",
            color:"#fff", fontSize:12, cursor:"pointer",
            opacity: refreshing ? 0.5 : 1,
          }}>
            {refreshing ? "…" : "↻"}
          </div>
          {/* Export */}
          {!loading && users.length > 0 && (
            <div onClick={() => exportCSV(activeSection === "users" ? filtered : users)} style={{
              background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)",
              borderRadius:10, padding:"7px 12px",
              color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
            }}>
              ⬇ {activeSection === "users" && filtered.length < users.length ? `${filtered.length}` : "All"}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginTop:14, overflowX:"auto", paddingBottom:1 }}>
          {TABS.map(([id, label]) => (
            <div key={id} onClick={() => setActiveSection(id)} style={{
              padding:"7px 13px", borderRadius:"20px 20px 0 0",
              fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0,
              background: activeSection === id
                ? "rgba(255,255,255,0.22)"
                : "rgba(255,255,255,0.08)",
              borderTop: activeSection === id ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
              borderLeft: activeSection === id ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
              borderRight: activeSection === id ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
              color: activeSection === id ? "#fff" : "rgba(255,255,255,0.6)",
              transition:"all 0.2s",
              marginBottom: activeSection === id ? -1 : 0,
            }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:12,
        }}>
          <div style={{ fontSize:32, animation:"spin 1s linear infinite" }}>⏳</div>
          <div style={{ color:th.textMid, fontSize:13 }}>Fetching user data…</div>
        </div>
      )}

      {/* ── ERROR ── */}
      {!loading && error && (
        <div style={{ padding:20 }}>
          <div style={{
            background:"#FFF5F5", border:"1px solid #FED7D7",
            borderRadius:12, padding:"14px 16px",
            color:"#c53030", fontSize:13,
          }}>
            ❌ {error}
          </div>
        </div>
      )}

      {/* ══ OVERVIEW ══ */}
      {!loading && !error && activeSection === "overview" && (
        <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Row 1 */}
          <div style={{ display:"flex", gap:10 }}>
            <StatCard icon="👥" label="Total Users" value={users.length}
              color={NAVY} dark={dark} sparkline={stats.spark} />
            <StatCard icon="🆕" label="New This Week" value={stats.newThisWeek}
              color={IND_GREEN} dark={dark} trend={stats.weekGrowth} />
          </div>

          {/* Row 2 */}
          <div style={{ display:"flex", gap:10 }}>
            <StatCard icon="🟢" label="Active Today" value={stats.activeToday}
              sub={`${users.length ? Math.round(stats.activeToday/users.length*100) : 0}% of users`}
              color={SAFFRON} dark={dark} />
            <StatCard icon="📅" label="Active This Week" value={stats.activeWeek}
              sub={`${users.length ? Math.round(stats.activeWeek/users.length*100) : 0}% of users`}
              color={VIOLET} dark={dark} />
          </div>

          {/* Row 3 */}
          <div style={{ display:"flex", gap:10 }}>
            <StatCard icon="🗺️" label="States Covered" value={stats.statesCount}
              color={PINK} dark={dark} />
            <StatCard icon="🏠" label="Needs Housing" value={stats.needHousing}
              sub={`${users.length ? Math.round(stats.needHousing/users.length*100) : 0}% of users`}
              color={GOOGLE_B} dark={dark} />
          </div>

          {/* By State */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              📍 Users by State <span style={{ color:th.textSub, fontWeight:500, fontSize:11 }}>(top 8)</span>
            </div>
            {stats.topStates.length > 0
              ? <BarChart data={stats.topStates} color={NAVY} dark={dark} />
              : <div style={{ fontSize:12, color:th.textSub }}>No data yet</div>}
          </div>

          {/* Occupation donut */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              💼 Occupation Breakdown
            </div>
            <DonutChart data={stats.occDonut} dark={dark} />
          </div>

          {/* 2-col: Income + Area */}
          <div style={{ display:"flex", gap:12 }}>
            <div style={{
              flex:1, background:th.card, border:`1.5px solid ${th.border}`,
              borderRadius:16, padding:"14px 14px",
            }}>
              <div style={{ fontSize:12, fontWeight:800, color:th.text, marginBottom:10 }}>
                💰 Income
              </div>
              <BarChart data={stats.incData} color={IND_GREEN} dark={dark} />
            </div>
            <div style={{
              flex:1, background:th.card, border:`1.5px solid ${th.border}`,
              borderRadius:16, padding:"14px 14px",
            }}>
              <div style={{ fontSize:12, fontWeight:800, color:th.text, marginBottom:10 }}>
                🏘️ Area
              </div>
              <DonutChart data={stats.areaDonut} size={90} dark={dark} />
            </div>
          </div>

          {/* Age */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🎂 Age Groups
            </div>
            <BarChart data={stats.ageData} color={PINK} dark={dark} />
          </div>

          {/* Recent users preview */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              marginBottom:4,
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text }}>🕐 Recent Sign-ups</div>
              <div onClick={() => setActiveSection("users")} style={{
                fontSize:11, color:SAFFRON, fontWeight:700, cursor:"pointer",
              }}>
                See all →
              </div>
            </div>
            {users.slice(0, 5).map(u => (
              <UserRow key={u.id} user={u} dark={dark} onTap={setSelectedUser} />
            ))}
          </div>
        </div>
      )}

      {/* ══ USERS ══ */}
      {!loading && !error && activeSection === "users" && (
        <div style={{ padding:"14px 14px", display:"flex", flexDirection:"column", gap:10 }}>

          {/* Search */}
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="🔍  Search by name, phone, email, state…"
            style={{
              width:"100%", padding:"11px 14px", boxSizing:"border-box",
              border:`1.5px solid ${th.border}`, borderRadius:12,
              fontSize:13, color:th.text, background:th.inputBg,
              outline:"none", fontFamily:"inherit",
            }}
          />

          {/* Filters row 1 */}
          <div style={{ display:"flex", gap:8 }}>
            <select value={filterOcc} onChange={e => { setFilterOcc(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All Occupations</option>
              {Object.entries(OCC_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{OCC_EMOJI[k]} {v}</option>
              ))}
            </select>
            <select value={filterState} onChange={e => { setFilterState(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All States</option>
              {allStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Filters row 2 */}
          <div style={{ display:"flex", gap:8 }}>
            <select value={filterArea} onChange={e => { setFilterArea(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All Areas</option>
              {Object.entries(AREA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterIncome} onChange={e => { setFilterIncome(e.target.value); setPage(1); }}
              style={{ flex:1, padding:"8px 8px", borderRadius:10, border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text, fontSize:11, fontFamily:"inherit", outline:"none" }}>
              <option value="all">All Income</option>
              {Object.entries(INC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {/* Sort row */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ fontSize:11, color:th.textSub, flexShrink:0 }}>Sort:</div>
            <SortBtn field="lastSeen"  current={sortField} dir={sortDir} onClick={handleSort} label="Last Seen" dark={dark} />
            <SortBtn field="createdAt" current={sortField} dir={sortDir} onClick={handleSort} label="Joined"    dark={dark} />
            <SortBtn field="name"      current={sortField} dir={sortDir} onClick={handleSort} label="Name"      dark={dark} />
          </div>

          {/* Count + export filtered */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:11, color:th.textSub, fontWeight:600 }}>
              {filtered.length} of {users.length} users
              {filtered.length < users.length && (
                <span style={{ color:SAFFRON, marginLeft:4 }}>(filtered)</span>
              )}
            </div>
            {filtered.length < users.length && (
              <div onClick={() => exportCSV(filtered)} style={{
                fontSize:11, color:NAVY, fontWeight:700, cursor:"pointer",
              }}>
                ⬇ Export {filtered.length}
              </div>
            )}
          </div>

          {/* User list */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"4px 14px",
          }}>
            {pageSlice.length === 0 ? (
              <div style={{ padding:"24px 0", textAlign:"center", color:th.textSub, fontSize:13 }}>
                No users match this filter
              </div>
            ) : (
              pageSlice.map(u => <UserRow key={u.id} user={u} dark={dark} onTap={setSelectedUser} />)
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:10 }}>
              <div onClick={() => setPage(p => Math.max(1, p - 1))} style={{
                padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:700,
                background:th.border, color:page <= 1 ? th.textSub : th.text,
                cursor:page <= 1 ? "default" : "pointer",
              }}>← Prev</div>
              <div style={{ fontSize:12, color:th.textMid }}>
                {page} / {totalPages}
              </div>
              <div onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{
                padding:"7px 14px", borderRadius:10, fontSize:12, fontWeight:700,
                background:th.border, color:page >= totalPages ? th.textSub : th.text,
                cursor:page >= totalPages ? "default" : "pointer",
              }}>Next →</div>
            </div>
          )}
        </div>
      )}

      {/* ══ ANALYTICS ══ */}
      {!loading && !error && activeSection === "analytics" && (
        <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Summary pills */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {[
              { label:"Google Sign-ins", value:stats.googleUsers,
                pct: users.length ? Math.round(stats.googleUsers/users.length*100) : 0,
                color:GOOGLE_B },
              { label:"Own House", value:stats.housedUsers,
                pct: users.length ? Math.round(stats.housedUsers/users.length*100) : 0,
                color:IND_GREEN },
              { label:"Need Housing", value:stats.needHousing,
                pct: users.length ? Math.round(stats.needHousing/users.length*100) : 0,
                color:SAFFRON },
            ].map(({ label, value, pct, color }) => (
              <div key={label} style={{
                background:th.card, border:`1.5px solid ${th.border}`,
                borderRadius:12, padding:"10px 14px", flex:1, minWidth:100,
                borderLeft:`3px solid ${color}`,
              }}>
                <div style={{ fontSize:18, fontWeight:800, color:th.text }}>{value}</div>
                <div style={{ fontSize:9, color:th.textSub, marginTop:2 }}>{label}</div>
                <div style={{ fontSize:9, color, fontWeight:700, marginTop:2 }}>{pct}%</div>
              </div>
            ))}
          </div>

          {/* Occupation × Area cross-tab */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🔀 Occupation × Area
            </div>
            <CrossTab
              data={users}
              rowKey="occupation" colKey="area"
              rowLabels={OCC_LABELS} colLabels={AREA_LABELS}
              dark={dark}
            />
          </div>

          {/* Income × Area cross-tab */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🔀 Income × Area
            </div>
            <CrossTab
              data={users}
              rowKey="income" colKey="area"
              rowLabels={INC_LABELS} colLabels={AREA_LABELS}
              dark={dark}
            />
          </div>

          {/* Occupation × Income cross-tab */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🔀 Occupation × Income
            </div>
            <CrossTab
              data={users}
              rowKey="occupation" colKey="income"
              rowLabels={OCC_LABELS} colLabels={INC_LABELS}
              dark={dark}
            />
          </div>

          {/* Full state bar */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              📍 All States
            </div>
            <BarChart
              data={Object.entries(groupBy(users, "state"))
                .sort((a, b) => b[1] - a[1])
                .map(([label, value]) => ({ label, value }))}
              color={NAVY} dark={dark}
            />
          </div>
        </div>
      )}

      {/* ══ ACTIVITY FEED ══ */}
      {!loading && !error && activeSection === "activity" && (
        <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:14 }}>

          {/* Quick metrics */}
          <div style={{ display:"flex", gap:10 }}>
            <StatCard icon="🟢" label="Active Today" value={stats.activeToday} color={IND_GREEN} dark={dark} />
            <StatCard icon="📅" label="Active This Week" value={stats.activeWeek} color={VIOLET} dark={dark} />
          </div>

          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🕐 Recent Activity (last 15 active users)
            </div>
            <ActivityFeed users={users} dark={dark} />
          </div>

          {/* New this week list */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:8 }}>
              🆕 Joined This Week ({stats.newThisWeek})
            </div>
            {users
              .filter(u => u.createdAt?.seconds &&
                (Date.now() - u.createdAt.seconds * 1000) < 7 * 86400000)
              .slice(0, 20)
              .map(u => <UserRow key={u.id} user={u} dark={dark} onTap={setSelectedUser} />)
            }
            {stats.newThisWeek === 0 && (
              <div style={{ fontSize:12, color:th.textSub, padding:"12px 0" }}>
                No new users this week yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ SCHEMES COVERAGE ══ */}
      {!loading && !error && activeSection === "schemes" && (
        <SchemeCoverageTab dark={dark} />
      )}

      {/* User Detail Drawer */}
      {selectedUser && (
        <UserDrawer user={selectedUser} dark={dark} onClose={() => setSelectedUser(null)} />
      )}

      <div style={{ height:32, flexShrink:0 }} />
    </div>
  );
}
