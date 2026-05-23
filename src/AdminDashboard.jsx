// AdminDashboard.jsx — YojanaSetu Admin Panel
// Reads all users from Firestore and shows stats, charts, user list, CSV export
// Protected: only renders if caller verified uid === ADMIN_UID

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";

// ─── THEME (matches app) ───────────────────────────────────────────────────────
const THEME = {
  light: {
    bg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#555", textSub:"#888",
    border:"#e8e8e8", inputBg:"#fff",
  },
  dark: {
    bg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#aaa", textSub:"#666",
    border:"#2c2c2e", inputBg:"#2c2c2e",
  },
};

const SAFFRON  = "#FF9933";
const NAVY     = "#003580";
const IND_GREEN= "#138808";

const OCC_LABELS = {
  farmer:"Farmer", student:"Student", women:"Homemaker",
  senior:"Senior Citizen", business:"Business Owner", general:"General",
};
const OCC_EMOJI  = {
  farmer:"🌾", student:"📚", women:"👩", senior:"👴", business:"💼", general:"👤",
};
const INC_LABELS = {
  below1:"< ₹1L", "1to3":"₹1–3L", "3to6":"₹3–6L", above6:"> ₹6L",
};
const AGE_LABELS = {
  below18:"< 18", "18to35":"18–35", "35to60":"35–60", above60:"60+",
};
const AREA_LABELS = { rural:"Rural", urban:"Urban", semi:"Semi-Urban" };

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

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
function BarChart({ data, color, dark }) {
  const th  = THEME[dark ? "dark" : "light"];
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

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{
      background: th.card,
      border:`1.5px solid ${th.border}`,
      borderRadius:14, padding:"13px 14px",
      flex:1, minWidth:0,
      borderTop:`3px solid ${color}`,
    }}>
      <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:22, fontWeight:800, color:th.text, lineHeight:1 }}>
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
    </div>
  );
}

// ─── USER ROW ─────────────────────────────────────────────────────────────────
function UserRow({ user, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const initial = (user.name || "?").charAt(0).toUpperCase();
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10,
      padding:"10px 0", borderBottom:`1px solid ${th.border}`,
    }}>
      {/* Avatar */}
      {user.photo ? (
        <img src={user.photo} alt={initial} referrerPolicy="no-referrer"
          style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
      ) : (
        <div style={{
          width:34, height:34, borderRadius:"50%", flexShrink:0,
          background:`linear-gradient(135deg,${SAFFRON},${NAVY})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:13, fontWeight:800, color:"#fff",
        }}>
          {initial}
        </div>
      )}
      {/* Info */}
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
      {/* Contact */}
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontSize:10, color:th.textMid, fontWeight:600 }}>
          {user.phone ? `📱 ${user.phone}` : user.email ? `✉ ${user.email.split("@")[0]}` : "—"}
        </div>
        <div style={{ fontSize:9, color:th.textSub, marginTop:2 }}>
          {timeAgo(user.lastSeen)}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onClose, dark = false }) {
  const th = THEME[dark ? "dark" : "light"];

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [filterOcc,   setFilterOcc]   = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [activeSection, setActiveSection] = useState("overview"); // "overview"|"users"

  // ── Fetch all users ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort newest first by lastSeen
        data.sort((a, b) => (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0));
        setUsers(data);
      } catch (err) {
        setError("Failed to load users. Check Firestore rules.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Computed stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const byState = groupBy(users, "state");
    const byOcc   = groupBy(users, "occupation");
    const byInc   = groupBy(users, "income");
    const byAge   = groupBy(users, "age");
    const byArea  = groupBy(users, "area");

    const topStates = Object.entries(byState)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([label, value]) => ({ label, value }));

    const occData = Object.entries(byOcc)
      .sort((a, b) => b[1] - a[1])
      .map(([key, value]) => ({
        label: `${OCC_EMOJI[key] || ""} ${OCC_LABELS[key] || key}`,
        value,
      }));

    const incData = Object.entries(byInc)
      .map(([key, value]) => ({ label: INC_LABELS[key] || key, value }));

    const areaData = Object.entries(byArea)
      .map(([key, value]) => ({ label: AREA_LABELS[key] || key, value }));

    const ageData = Object.entries(byAge)
      .map(([key, value]) => ({ label: AGE_LABELS[key] || key, value }));

    // "Today" = last 24h by lastSeen
    const now = Date.now();
    const activeToday = users.filter(u =>
      u.lastSeen?.seconds && (now - u.lastSeen.seconds * 1000) < 86400000
    ).length;

    const googleUsers = users.filter(u => u.photo).length;
    const statesCount = Object.keys(byState).length;

    return { topStates, occData, incData, areaData, ageData, activeToday, googleUsers, statesCount };
  }, [users]);

  // ── Filtered user list ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.state || "").toLowerCase().includes(q);
      const matchOcc   = filterOcc   === "all" || u.occupation === filterOcc;
      const matchState = filterState === "all" || u.state      === filterState;
      return matchSearch && matchOcc && matchState;
    });
  }, [users, search, filterOcc, filterState]);

  // ── Unique state list for filter dropdown ────────────────────────────────────
  const allStates = useMemo(() =>
    [...new Set(users.map(u => u.state).filter(Boolean))].sort()
  , [users]);

  // ── CSV Export ───────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Name","Phone","Email","State","Occupation","Income","Age","Area","Housing","Joined","Last Seen"];
    const rows = users.map(u => [
      u.name || "",
      u.phone || "",
      u.email || "",
      u.state || "",
      OCC_LABELS[u.occupation] || u.occupation || "",
      INC_LABELS[u.income]     || u.income     || "",
      AGE_LABELS[u.age]        || u.age        || "",
      AREA_LABELS[u.area]      || u.area       || "",
      u.house === "yes" ? "Owns House" : "Needs Housing",
      formatDate(u.createdAt),
      formatDate(u.lastSeen),
    ]);
    const csv = [headers, ...rows].map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `yojanasetu_users_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background: th.bg,
      display:"flex", flexDirection:"column",
      fontFamily:"'Noto Sans',sans-serif",
      overflowY:"auto",
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background:`linear-gradient(135deg,${NAVY} 0%,rgba(0,53,128,0.9) 60%,rgba(255,153,51,0.8) 100%)`,
        padding:"18px 18px 20px", flexShrink:0,
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
              YojanaSetu · {loading ? "Loading…" : `${users.length} total users`}
            </div>
          </div>
          {/* Export CSV */}
          {!loading && users.length > 0 && (
            <div onClick={exportCSV} style={{
              background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.3)",
              borderRadius:10, padding:"7px 12px",
              color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
            }}>
              ⬇ CSV
            </div>
          )}
        </div>

        {/* Section tabs */}
        <div style={{
          display:"flex", gap:8, marginTop:14,
        }}>
          {[["overview","📊 Overview"],["users","👥 Users"]].map(([id, label]) => (
            <div key={id} onClick={() => setActiveSection(id)} style={{
              padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:700,
              cursor:"pointer",
              background: activeSection === id ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
              border: activeSection === id ? "1px solid rgba(255,255,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
              color: activeSection === id ? "#fff" : "rgba(255,255,255,0.65)",
              transition:"all 0.2s",
            }}>{label}</div>
          ))}
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:12,
        }}>
          <div style={{ fontSize:32 }}>⏳</div>
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

      {/* ══ OVERVIEW SECTION ══ */}
      {!loading && !error && activeSection === "overview" && (
        <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* Stat cards row 1 */}
          <div style={{ display:"flex", gap:10 }}>
            <StatCard
              icon="👥" label="Total Users" value={users.length}
              color={NAVY} dark={dark}
            />
            <StatCard
              icon="🟢" label="Active Today" value={stats.activeToday}
              sub={`${users.length ? Math.round(stats.activeToday/users.length*100) : 0}% of users`}
              color={IND_GREEN} dark={dark}
            />
          </div>

          {/* Stat cards row 2 */}
          <div style={{ display:"flex", gap:10 }}>
            <StatCard
              icon="🗺️" label="States Covered" value={stats.statesCount}
              color={SAFFRON} dark={dark}
            />
            <StatCard
              icon="🔵" label="Google Sign-ins" value={stats.googleUsers}
              sub={`${users.length ? Math.round(stats.googleUsers/users.length*100) : 0}% have avatar`}
              color="#4285F4" dark={dark}
            />
          </div>

          {/* Users by State */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              📍 Users by State <span style={{ color:th.textSub, fontWeight:500, fontSize:11 }}>(top 8)</span>
            </div>
            {stats.topStates.length > 0
              ? <BarChart data={stats.topStates} color={NAVY} dark={dark} />
              : <div style={{ fontSize:12, color:th.textSub }}>No data yet</div>
            }
          </div>

          {/* Users by Occupation */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              💼 Users by Occupation
            </div>
            {stats.occData.length > 0
              ? <BarChart data={stats.occData} color={SAFFRON} dark={dark} />
              : <div style={{ fontSize:12, color:th.textSub }}>No data yet</div>
            }
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
              <BarChart data={stats.areaData} color="#8B5CF6" dark={dark} />
            </div>
          </div>

          {/* Age breakdown */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ fontSize:13, fontWeight:800, color:th.text, marginBottom:12 }}>
              🎂 Age Groups
            </div>
            <BarChart data={stats.ageData} color="#EC4899" dark={dark} />
          </div>

          {/* Quick recent users */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              marginBottom:4,
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:th.text }}>
                🕐 Recent Sign-ups
              </div>
              <div onClick={() => setActiveSection("users")} style={{
                fontSize:11, color:SAFFRON, fontWeight:700, cursor:"pointer",
              }}>
                See all →
              </div>
            </div>
            {users.slice(0, 5).map(u => (
              <UserRow key={u.id} user={u} dark={dark} />
            ))}
          </div>
        </div>
      )}

      {/* ══ USERS SECTION ══ */}
      {!loading && !error && activeSection === "users" && (
        <div style={{ padding:"14px 14px", display:"flex", flexDirection:"column", gap:12 }}>

          {/* Search bar */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name, phone, state…"
            style={{
              width:"100%", padding:"11px 14px",
              border:`1.5px solid ${th.border}`, borderRadius:12,
              fontSize:13, color:th.text, background:th.inputBg,
              outline:"none", fontFamily:"inherit",
            }}
          />

          {/* Filter row */}
          <div style={{ display:"flex", gap:8 }}>
            <select
              value={filterOcc}
              onChange={e => setFilterOcc(e.target.value)}
              style={{
                flex:1, padding:"8px 10px", borderRadius:10,
                border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text,
                fontSize:12, fontFamily:"inherit", outline:"none",
              }}
            >
              <option value="all">All Occupations</option>
              {Object.entries(OCC_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{OCC_EMOJI[k]} {v}</option>
              ))}
            </select>
            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              style={{
                flex:1, padding:"8px 10px", borderRadius:10,
                border:`1.5px solid ${th.border}`,
                background:th.inputBg, color:th.text,
                fontSize:12, fontFamily:"inherit", outline:"none",
              }}
            >
              <option value="all">All States</option>
              {allStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div style={{ fontSize:11, color:th.textSub, fontWeight:600 }}>
            Showing {filtered.length} of {users.length} users
          </div>

          {/* User list */}
          <div style={{
            background:th.card, border:`1.5px solid ${th.border}`,
            borderRadius:16, padding:"4px 14px",
          }}>
            {filtered.length === 0 ? (
              <div style={{ padding:"24px 0", textAlign:"center", color:th.textSub, fontSize:13 }}>
                No users match this filter
              </div>
            ) : (
              filtered.map(u => <UserRow key={u.id} user={u} dark={dark} />)
            )}
          </div>
        </div>
      )}

      {/* Bottom safe area padding */}
      <div style={{ height:32, flexShrink:0 }} />
    </div>
  );
}
