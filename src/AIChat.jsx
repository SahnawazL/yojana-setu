// AIChat.jsx — YojanaSetu AI Assistant Chat Screen

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

// ─── FOLLOW-UP CHIPS ───────────────────────────────────────────────────────────
const FOLLOWUPS = {
  en: {
    farmer:   ["How to apply for PM Kisan?", "Documents needed?", "Check payment status?"],
    housing:  ["How to apply for PMAY?",     "Documents needed?", "Am I eligible?"],
    women:    ["How to apply for Ujjwala?",  "Documents needed?", "Beti Bachao eligibility?"],
    student:  ["How to apply for scholarship?", "Documents needed?", "Last date to apply?"],
    business: ["How to apply for Mudra loan?",  "Documents needed?", "How much loan can I get?"],
    health:   ["How to get Ayushman card?",  "Which hospitals covered?", "Documents needed?"],
    senior:   ["How to apply for pension?",  "Documents needed?",  "How much pension per month?"],
    default:  ["How to check eligibility?",  "Documents needed?",  "How to apply online?"],
  },
  hi: {
    farmer:   ["पीएम किसान के लिए आवेदन?", "जरूरी दस्तावेज?",    "पेमेंट स्टेटस कैसे देखें?"],
    housing:  ["पीएम आवास के लिए आवेदन?", "जरूरी दस्तावेज?",    "क्या मैं पात्र हूं?"],
    women:    ["उज्ज्वला योजना आवेदन?",    "जरूरी दस्तावेज?",    "बेटी बचाओ पात्रता?"],
    student:  ["छात्रवृत्ति के लिए आवेदन?", "जरूरी दस्तावेज?",   "आवेदन की अंतिम तिथि?"],
    business: ["मुद्रा लोन के लिए आवेदन?", "जरूरी दस्तावेज?",    "कितना लोन मिलेगा?"],
    health:   ["आयुष्मान कार्ड कैसे बनाएं?", "कौन से अस्पताल?",  "जरूरी दस्तावेज?"],
    senior:   ["पेंशन के लिए आवेदन?",      "जरूरी दस्तावेज?",    "कितनी पेंशन मिलेगी?"],
    default:  ["पात्रता कैसे जांचें?",      "जरूरी दस्तावेज?",    "ऑनलाइन आवेदन कैसे करें?"],
  },
};

const TOPIC_KEYWORDS = {
  farmer:   ["farmer","kisan","kheti","krishi","pm kisan","pmkisan"],
  housing:  ["house","housing","awas","ghar","pmay","makaan"],
  women:    ["women","woman","mahila","beti","ujjwala","ladki"],
  student:  ["student","scholarship","education","padhai","shiksha"],
  business: ["business","loan","mudra","vyapar","udyog","rozgar"],
  health:   ["health","hospital","ayushman","swasthya","ilaaj"],
  senior:   ["senior","pension","old age","budhapa","vridh","bujurg"],
};

function getFollowUps(query, lang) {
  const q = query.toLowerCase();
  const topic = Object.keys(TOPIC_KEYWORDS).find(t =>
    TOPIC_KEYWORDS[t].some(kw => q.includes(kw))
  ) || "default";
  return FOLLOWUPS[lang]?.[topic] || FOLLOWUPS["en"][topic];
}

const GLOBAL_CSS = `
@keyframes bubble-in {
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes dot-bounce {
  0%,80%,100% { transform:scale(0.55); opacity:0.35; }
  40%          { transform:scale(1);    opacity:1; }
}
@keyframes fade-in {
  from { opacity:0; }
  to   { opacity:1; }
}
.ai-msg-bubble { animation: bubble-in 0.22s ease-out; }
.ai-suggested:active { opacity:0.7; transform:scale(0.98); }
.ai-send-btn:active  { opacity:0.85; transform:scale(0.95); }
.ai-textarea:focus   { outline:none; }
`;

function TypingIndicator({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div className="ai-msg-bubble"
      style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:14 }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{
        width:32, height:32, borderRadius:"50%", flexShrink:0,
        background:"linear-gradient(135deg,#FF9933 0%,#003580 100%)",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
      }}>🤖</div>
      <div style={{
        background: th.card,
        border:`1.5px solid ${th.border2}`,
        borderRadius:"18px 18px 18px 4px",
        padding:"13px 18px",
        boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
        display:"flex", gap:5, alignItems:"center",
      }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:7, height:7, borderRadius:"50%",
            background:"#FF9933",
            animation:`dot-bounce 1.3s ease-in-out ${i*0.18}s infinite`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// Renders message text: bold (**text**) and clickable links
function renderContent(text, isUser, th) {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    const parts = [];
    // Match **bold** or domain/URL patterns
    const regex = /\*\*(.*?)\*\*|(https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    let last = 0;
    let match;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(line.slice(last, match.index));
      if (match[1] !== undefined) {
        // Bold text
        parts.push(
          <strong key={`b-${li}-${match.index}`} style={{ fontWeight: 700 }}>
            {match[1]}
          </strong>
        );
      } else {
        // Clickable link
        const raw = match[2];
        const href = raw.startsWith("http") ? raw : `https://${raw}`;
        parts.push(
          <a
            key={`l-${li}-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: isUser ? "#ffe0a0" : "#FF9933",
              textDecoration: "underline",
              wordBreak: "break-all",
            }}
          >
            {raw}
          </a>
        );
      }
      last = match.index + match[0].length;
    }
    if (last < line.length) parts.push(line.slice(last));
    return (
      <span key={`line-${li}`}>
        {parts}
        {li < lines.length - 1 ? "\n" : ""}
      </span>
    );
  });
}

function FollowUpChips({ chips, onTap, lang, dark }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  return (
    <div style={{
      display:"flex", flexWrap:"wrap", gap:8,
      paddingLeft:40, marginTop:-6, marginBottom:14,
      animation:"bubble-in 0.25s ease-out",
    }}>
      {chips.map((chip, i) => (
        <div key={i} onClick={() => onTap(chip)}
          style={{
            background: th.card,
            border:`1.5px solid #FF9933`,
            borderRadius:20,
            padding:"7px 13px",
            fontSize:12, fontFamily:bf, color:"#FF9933",
            cursor:"pointer", fontWeight:600,
            boxShadow:"0 1px 4px rgba(255,153,51,0.15)",
            transition:"opacity 0.15s, transform 0.15s",
          }}
          onTouchStart={e => e.currentTarget.style.opacity="0.7"}
          onTouchEnd={e => e.currentTarget.style.opacity="1"}
        >
          {chip}
        </div>
      ))}
    </div>
  );
}

function ChatBubble({ msg, lang, dark }) {
  const th  = THEME[dark ? "dark" : "light"];
  const bf  = fontFamily(lang);
  const isUser = msg.role === "user";
  return (
    <div className="ai-msg-bubble"
      style={{
        display:"flex",
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems:"flex-end",
        gap:8,
        marginBottom:14,
      }}>
      {!isUser && (
        <div style={{
          width:32, height:32, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#FF9933 0%,#003580 100%)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
        }}>🤖</div>
      )}
      <div style={{
        maxWidth:"76%",
        background: isUser
          ? "linear-gradient(135deg,#003580,#1a56db)"
          : th.card,
        color: isUser ? "#fff" : th.text,
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        padding:"11px 15px",
        fontSize:13.5,
        lineHeight:1.65,
        fontFamily:bf,
        boxShadow: isUser
          ? "0 4px 16px rgba(0,53,128,0.28)"
          : dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
        border: isUser ? "none" : `1.5px solid ${th.border2}`,
        whiteSpace:"pre-wrap",
        wordBreak:"break-word",
      }}>
        {renderContent(msg.content, isUser, th)}
      </div>
    </div>
  );
}

function WelcomeScreen({ lang, dark, onSuggest }) {
  const th = THEME[dark ? "dark" : "light"];
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";
  return (
    <div style={{ animation:"fade-in 0.3s ease-out", paddingBottom:8 }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:20 }}>
        <div style={{
          width:32, height:32, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#FF9933 0%,#003580 100%)",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
        }}>🤖</div>
        <div style={{
          background: th.card,
          border:`1.5px solid ${th.border2}`,
          borderRadius:"18px 18px 18px 4px",
          padding:"13px 15px",
          fontSize:13.5, lineHeight:1.65, fontFamily:bf, color:th.text,
          boxShadow: dark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.07)",
          maxWidth:"80%",
        }}>
          {isHindi
            ? "नमस्ते! 🙏 मैं YojanaSetu का AI सहायक हूं।\nआपको सरकारी योजनाएं खोजने और समझने में मदद करूंगा।\nहिंदी या English — जो भी आसान हो, पूछें!"
            : "Namaste! 🙏 I'm YojanaSetu's AI Assistant.\nI'll help you find and understand government schemes.\nAsk me anything in Hindi or English!"}
        </div>
      </div>
      <div style={{
        fontSize:10, fontWeight:700, color:th.textSub,
        letterSpacing:0.8, textTransform:"uppercase",
        marginBottom:10, paddingLeft:40, fontFamily:bf,
      }}>
        {isHindi ? "यह पूछें" : "Try asking"}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8, paddingLeft:40 }}>
        {SUGGESTED[lang].map((s, i) => (
          <div key={i} className="ai-suggested"
            onClick={() => onSuggest(s.text)}
            style={{
              background: th.card,
              border:`1.5px solid ${th.border2}`,
              borderRadius:13,
              padding:"10px 14px",
              fontSize:13, fontFamily:bf, color:th.text,
              cursor:"pointer",
              display:"flex", alignItems:"center", gap:9,
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

export default function AIChat({ lang="en", dark=false, profile=null }) {
  const th      = THEME[dark ? "dark" : "light"];
  const bf      = fontFamily(lang);
  const isHindi = lang === "hi";

  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [followUps, setFollowUps] = useState([]);
  const [usedChips, setUsedChips] = useState(new Set());

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  }, [input]);

  const handleSend = useCallback(async (overrideText) => {
    const query = (overrideText ?? input).trim();
    if (!query || loading) return;

    setInput("");
    setError("");
    setFollowUps([]);  // clear chips on new message

    // If triggered by a chip tap, mark it used so it never reappears
    const nextUsedChips = overrideText
      ? new Set([...usedChips, overrideText])
      : usedChips;
    if (overrideText) setUsedChips(nextUsedChips);

    const userMsg      = { role:"user", content:query };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const reply = await sendMessage(
        nextMessages.map(m => ({ role:m.role, content:m.content })),
        query,
        lang,  // ✅ forces AI to respond in app's selected language
      );
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
      // Filter out chips the user has already tapped
      const allChips = getFollowUps(query, lang);
      const freshChips = allChips.filter(c => !nextUsedChips.has(c));
      setFollowUps(freshChips);
    } catch (err) {
      // ✅ Show the ACTUAL error so you can see what's really going wrong
      setError(`❌ ${err.message || (isHindi ? "जवाब नहीं मिला। दोबारा कोशिश करें।" : "Could not get response. Please try again.")}`);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, isHindi, usedChips]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div style={{
      flex:1, display:"flex", flexDirection:"column",
      background:th.appBg, overflow:"hidden",
      fontFamily:bf,
    }}>
      <style>{GLOBAL_CSS}</style>

      {/* HEADER */}
      <div style={{
        background:"linear-gradient(135deg,#FF9933 0%,#FF8000 35%,#003580 100%)",
        padding:"18px 20px 22px",
        flexShrink:0,
        boxShadow:"0 4px 20px rgba(0,53,128,0.2)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:13 }}>
          <div style={{
            width:46, height:46, borderRadius:14, flexShrink:0,
            background:"rgba(255,255,255,0.18)",
            border:"1.5px solid rgba(255,255,255,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
          }}>🤖</div>
          <div style={{ flex:1 }}>
            <div style={{ color:"#fff", fontSize:17, fontWeight:800, lineHeight:1.2 }}>
              {isHindi ? "AI सहायक" : "AI Assistant"}
            </div>
            <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11, marginTop:3 }}>
              🟢 {isHindi ? "ऑनलाइन · हिंदी / English" : "Online · Hindi / English"}
            </div>
          </div>
          {messages.length > 0 && (
            <div
              onClick={() => { setMessages([]); setError(""); setFollowUps([]); setUsedChips(new Set()); }}
              style={{
                background:"rgba(255,255,255,0.18)",
                border:"1px solid rgba(255,255,255,0.3)",
                borderRadius:10, padding:"5px 11px",
                color:"rgba(255,255,255,0.9)", fontSize:11, fontWeight:600,
                cursor:"pointer",
              }}>
              {isHindi ? "साफ करें" : "Clear"}
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div style={{
        flex:1, overflowY:"auto",
        padding:"18px 16px 6px",
        WebkitOverflowScrolling:"touch",
      }}>
        {messages.length === 0 && !loading && (
          <WelcomeScreen lang={lang} dark={dark} onSuggest={handleSend} />
        )}
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} lang={lang} dark={dark} />
        ))}
        {!loading && followUps.length > 0 && (
          <FollowUpChips
            chips={followUps}
            onTap={handleSend}
            lang={lang}
            dark={dark}
          />
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

      {/* INPUT AREA */}
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
            onKeyDown={handleKeyDown}
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
              transition:"border-color 0.2s",
              display:"block",
            }}
          />
          <div
            className="ai-send-btn"
            onClick={() => handleSend()}
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
    </div>
  );
}
