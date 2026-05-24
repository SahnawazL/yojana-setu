// AboutTab.jsx — YojanaSetu
// Official About Screen · Accessible to all users · Embedded in Profile Tab
// Drop-in component: <AboutTab lang={lang} dark={dark} />

// ─── COLOR TOKENS (matches App.jsx exactly) ────────────────────────────────────
const SAFFRON    = "#FF9933";
const NAVY       = "#003580";
const IND_GREEN  = "#138808";
const ASHOKA_BLUE= "#06038D";

// ─── THEME (mirrors App.jsx THEME) ────────────────────────────────────────────
const THEME = {
  light: {
    appBg:"#f5f5f0", card:"#fff", card2:"#f8f9fa",
    text:"#1a1a1a", textMid:"#444", textSub:"#777", textLight:"#bbb",
    border:"#ebebeb", border2:"#e4e4e4",
    divider:"#f0f0f0",
  },
  dark: {
    appBg:"#111111", card:"#1c1c1e", card2:"#252527",
    text:"#f0f0f0", textMid:"#b0b0b0", textSub:"#777", textLight:"#3a3a3a",
    border:"#2c2c2e", border2:"#3a3a3c",
    divider:"#242424",
  },
};

const fontFamily = (lang) =>
  lang === "hi" ? "'Noto Sans Devanagari',sans-serif" : "'Noto Sans',sans-serif";

// ─── BILINGUAL STRINGS ────────────────────────────────────────────────────────
const STRINGS = {
  en: {
    // Hero
    appName:      "YojanaSetu",
    tagline:      "Official Scheme Finder",
    madeInIndia:  "Made in India 🇮🇳",
    version:      "Current Release · Beta",

    // Mission
    missionTitle: "Our Mission",
    missionBody:
      "YojanaSetu is dedicated to bridging the gap between Indian citizens and the government welfare ecosystem. Our platform ensures that every eligible citizen — regardless of location, language, or literacy level — can discover, understand, and access the schemes and benefits they rightfully deserve.",

    // Stats row
    statsTitle:   "Platform at a Glance",
    stats: [
      { number:"28+",    label:"States & UTs\nCovered" },
      { number:"50L+",   label:"Citizens\nGuided" },
      { number:"2",      label:"Languages\nSupported" },
      { number:"100%",   label:"Free to\nUse" },
    ],

    // Scheme database note
    dbTitle:  "Comprehensive Scheme Database",
    dbBody:
      "YojanaSetu indexes an extensive and continuously expanding catalogue of Central Government and State Government welfare schemes spanning across every state and union territory of India. Our dedicated team actively curates and updates scheme data to ensure accuracy, coverage, and relevance for citizens nationwide.",

    // Core capabilities
    featuresTitle: "Core Capabilities",
    features: [
      {
        icon: "🔍",
        color: NAVY,
        title: "Smart Scheme Discovery",
        desc:  "Search and browse across Central and State government schemes, filtered by category, state, and beneficiary type. Instant results with detailed eligibility, benefits, and application guidance.",
      },
      {
        icon: "🎯",
        color: SAFFRON,
        title: "Eligibility Checker",
        desc:  "A six-step guided questionnaire that analyses your profile and instantly presents the schemes you qualify for — eliminating guesswork and saving time.",
      },
      {
        icon: "🤖",
        color: "#8B5CF6",
        title: "AI Assistant",
        desc:  "A real-time AI-powered assistant for scheme queries in Hindi and English. Provides personalised guidance, scheme comparisons, eligibility clarification, and actionable next steps.",
      },
      {
        icon: "📬",
        color: IND_GREEN,
        title: "Report & Resolution Centre",
        desc:  "An in-app support system for submitting bugs, scheme requests, general queries, and feedback. Every submission is reviewed by the YojanaSetu team with status tracking and official response.",
      },
    ],

    // AI section
    aiTitle:    "AI Assistant — Powered by Groq",
    aiSubtitle: "Intelligent · Bilingual · Personalised",
    aiPoints: [
      { icon:"🌐", text:"Fully bilingual — converse in Hindi or English, naturally" },
      { icon:"🎯", text:"Personalised responses based on your saved profile and state" },
      { icon:"💡", text:"Smart follow-up suggestions to guide deeper discovery" },
      { icon:"📖", text:"Designed for reading-friendly pacing for all users" },
      { icon:"🔒", text:"Per-account conversation history — private and isolated" },
      { icon:"⚡", text:"Powered by Groq AI for high-speed, accurate responses" },
    ],

    // Sign-in benefits
    signInTitle: "Benefits of Signing In",
    signInSub:   "Creating an account unlocks the full YojanaSetu experience.",
    signInPoints: [
      { icon:"🎯", title:"Personalised Scheme Matching",   desc:"The eligibility checker and AI use your profile to surface schemes most relevant to you." },
      { icon:"🤖", title:"Profile-Aware AI Responses",     desc:"The AI assistant tailors every recommendation based on your age, income, state, and occupation." },
      { icon:"📬", title:"Report Tracking & Admin Replies",desc:"Track the status of your submissions — Open, In Progress, or Resolved — with full conversation threads." },
      { icon:"✅", title:"Verified Identity Submissions",  desc:"Your reports carry a verified badge, ensuring priority handling by the support team." },
      { icon:"📩", title:"Email Confirmation & Alerts",    desc:"Receive automatic email confirmation on submission and be notified when the team responds." },
    ],

    // Report system
    reportTitle:    "Report, Query & Resolution",
    reportSubtitle: "Every Submission is Accounted For",
    reportBody:
      "YojanaSetu maintains a built-in, end-to-end support and resolution system directly within the app. Citizens and users may submit any of the following:",
    reportTypes: [
      { icon:"🐛", color:"#DC2626", label:"Bug / Issue Report",    desc:"Report technical issues or unexpected behaviour in the app." },
      { icon:"📋", color:NAVY,      label:"Scheme Addition Request",desc:"Request the addition of a scheme not yet listed on the platform." },
      { icon:"❓", color:IND_GREEN, label:"General Query",         desc:"Submit a question or request for assistance regarding any scheme or feature." },
      { icon:"💡", color:SAFFRON,   label:"Feedback & Suggestions",desc:"Share suggestions to improve the platform for citizens across India." },
    ],
    reportFlow:
      "All submissions are stored securely and reviewed by the YojanaSetu priority support team. Logged-in users receive automatic email confirmation upon submission and are notified when the team provides an official response. Status transitions — Open → In Progress → Resolved — are visible in real time within the app.",

    // Legal
    legalTitle:      "Legal & Disclaimer",
    legalPoints: [
      "YojanaSetu is an independent digital platform for government scheme discovery and is not affiliated with, endorsed by, or representative of any Central or State Government body or ministry.",
      "All scheme data is sourced from publicly available official government portals and communications. While we strive for accuracy, users are advised to verify scheme details directly from the respective government sources before applying.",
      "YojanaSetu does not facilitate direct scheme applications, financial transactions, or document processing. The platform serves solely as an informational and discovery service.",
    ],

    // Technology
    techTitle: "Technology & Infrastructure",
    techBody:  "YojanaSetu is built on a modern, secure, and scalable technology stack to ensure reliability and performance for citizens across India.",
    techStack: [
      { icon:"🔥", name:"Firebase",  role:"Authentication, Cloud Database & Real-time Sync" },
      { icon:"⚡", name:"Groq AI",   role:"AI Assistant — High-speed Inference Engine" },
      { icon:"📧", name:"EmailJS",   role:"Automated Email Confirmations & Alerts" },
    ],

    // Privacy
    privacyTitle: "Privacy & Data",
    privacyBody:
      "User data is handled with strict confidentiality. Profile information is used solely to personalise the in-app experience and is never sold, shared, or disclosed to third parties. All data is stored securely on Firebase infrastructure.",

    // Developer
    devTitle:   "About the Developer",
    devBody:    "YojanaSetu is designed, developed, and maintained by Sahnawaz — an independent developer with a vision to make government welfare more accessible to every citizen of India.",
    devWebsite: "https://sahnawaz-portfolio.vercel.app",
    devLink:    "Visit Official Website →",

    // Contact
    contactTitle: "Official Contact",
    contactEmail: "yojanasetuofficial@gmail.com",
    contactNote:  "For platform-related inquiries only. For scheme-specific support, please use the in-app Report & Query feature.",

    // Footer
    copyright:   "© 2025 YojanaSetu. All rights reserved.",
    footerNote:  "An independent civic technology platform · India",
  },

  hi: {
    appName:      "योजना सेतु",
    tagline:      "आधिकारिक योजना खोजक",
    madeInIndia:  "मेड इन इंडिया 🇮🇳",
    version:      "वर्तमान संस्करण · Beta",

    missionTitle: "हमारा उद्देश्य",
    missionBody:
      "योजना सेतु भारत के नागरिकों और सरकारी कल्याण योजनाओं के बीच की दूरी को मिटाने के लिए समर्पित है। हमारा मंच यह सुनिश्चित करता है कि हर पात्र नागरिक — चाहे वह किसी भी स्थान, भाषा या शिक्षा स्तर का हो — अपने अधिकार की योजनाओं तक सरलता से पहुँच सके।",

    statsTitle: "प्लेटफ़ॉर्म एक नज़र में",
    stats: [
      { number:"28+",    label:"राज्य और\nकेंद्र शासित" },
      { number:"50L+",   label:"नागरिक\nलाभान्वित" },
      { number:"2",      label:"भाषाएं\nउपलब्ध" },
      { number:"100%",   label:"बिल्कुल\nनिःशुल्क" },
    ],

    dbTitle: "विस्तृत योजना डेटाबेस",
    dbBody:
      "योजना सेतु केंद्र सरकार और सभी राज्य सरकारों की कल्याण योजनाओं का एक व्यापक और निरंतर विस्तारित होता डेटाबेस बनाए रखता है। हमारी टीम नागरिकों के लिए सटीक, प्रासंगिक और अद्यतन जानकारी सुनिश्चित करने हेतु लगातार कार्यरत रहती है।",

    featuresTitle: "मुख्य क्षमताएं",
    features: [
      {
        icon: "🔍",
        color: NAVY,
        title: "स्मार्ट योजना खोज",
        desc:  "केंद्र और राज्य सरकार की योजनाओं को श्रेणी, राज्य और लाभार्थी प्रकार के अनुसार खोजें। पात्रता, लाभ और आवेदन मार्गदर्शन सहित तत्काल परिणाम।",
      },
      {
        icon: "🎯",
        color: SAFFRON,
        title: "पात्रता जांचक",
        desc:  "छह सरल प्रश्नों के माध्यम से आपकी प्रोफाइल का विश्लेषण कर तुरंत पात्र योजनाओं की सूची प्रस्तुत करता है।",
      },
      {
        icon: "🤖",
        color: "#8B5CF6",
        title: "AI सहायक",
        desc:  "हिंदी और अंग्रेजी में योजना संबंधी प्रश्नों के लिए वास्तविक समय AI सहायक। व्यक्तिगत मार्गदर्शन, योजना तुलना और अगले कदमों की जानकारी।",
      },
      {
        icon: "📬",
        color: IND_GREEN,
        title: "रिपोर्ट और समाधान केंद्र",
        desc:  "बग, योजना अनुरोध, सामान्य प्रश्न और सुझाव सबमिट करने की इन-ऐप सुविधा। टीम द्वारा हर सबमिशन की समीक्षा और आधिकारिक उत्तर।",
      },
    ],

    aiTitle:    "AI सहायक — Groq द्वारा संचालित",
    aiSubtitle: "बुद्धिमान · द्विभाषी · व्यक्तिगत",
    aiPoints: [
      { icon:"🌐", text:"पूरी तरह द्विभाषी — हिंदी या अंग्रेजी में स्वाभाविक रूप से बात करें" },
      { icon:"🎯", text:"आपकी प्रोफाइल और राज्य के आधार पर व्यक्तिगत सुझाव" },
      { icon:"💡", text:"गहरी जानकारी के लिए स्मार्ट फॉलो-अप सुझाव" },
      { icon:"📖", text:"सभी उपयोगकर्ताओं के लिए पठन-अनुकूल गति से डिज़ाइन" },
      { icon:"🔒", text:"प्रति-खाता चैट इतिहास — निजी और सुरक्षित" },
      { icon:"⚡", text:"Groq AI द्वारा संचालित — तेज़ और सटीक उत्तर" },
    ],

    signInTitle: "साइन इन के लाभ",
    signInSub:   "खाता बनाकर YojanaSetu का पूरा अनुभव प्राप्त करें।",
    signInPoints: [
      { icon:"🎯", title:"व्यक्तिगत योजना मिलान",       desc:"पात्रता जांचक और AI आपकी प्रोफाइल के अनुसार सर्वाधिक प्रासंगिक योजनाएं दिखाते हैं।" },
      { icon:"🤖", title:"प्रोफाइल-आधारित AI उत्तर",    desc:"AI सहायक आपकी आयु, आय, राज्य और व्यवसाय के अनुसार हर सुझाव तैयार करता है।" },
      { icon:"📬", title:"रिपोर्ट ट्रैकिंग और उत्तर",   desc:"अपनी सबमिशन की स्थिति — Open, In Progress, Resolved — पूर्ण बातचीत थ्रेड के साथ देखें।" },
      { icon:"✅", title:"सत्यापित पहचान सबमिशन",       desc:"आपकी रिपोर्ट पर Verified बैज लगता है जिससे सपोर्ट टीम प्राथमिकता से कार्य करती है।" },
      { icon:"📩", title:"ईमेल पुष्टि और सूचनाएं",      desc:"सबमिशन पर स्वचालित ईमेल पुष्टि और टीम के उत्तर पर अधिसूचना प्राप्त करें।" },
    ],

    reportTitle:    "रिपोर्ट, प्रश्न और समाधान",
    reportSubtitle: "हर सबमिशन का पूरा जवाब",
    reportBody:     "योजना सेतु में एक पूर्ण अंत-से-अंत सपोर्ट और समाधान प्रणाली उपलब्ध है। नागरिक निम्नलिखित में से कोई भी सबमिट कर सकते हैं:",
    reportTypes: [
      { icon:"🐛", color:"#DC2626", label:"बग / समस्या रिपोर्ट",  desc:"ऐप में तकनीकी समस्या या अनुचित व्यवहार की जानकारी दें।" },
      { icon:"📋", color:NAVY,      label:"योजना जोड़ने का अनुरोध",desc:"प्लेटफ़ॉर्म पर अनुपस्थित किसी योजना को जोड़ने का अनुरोध करें।" },
      { icon:"❓", color:IND_GREEN, label:"सामान्य प्रश्न",        desc:"किसी योजना या सुविधा के बारे में सहायता या प्रश्न सबमिट करें।" },
      { icon:"💡", color:SAFFRON,   label:"सुझाव और प्रतिक्रिया",  desc:"देशभर के नागरिकों के लिए प्लेटफ़ॉर्म सुधार के सुझाव साझा करें।" },
    ],
    reportFlow:
      "सभी सबमिशन सुरक्षित रूप से संग्रहीत होते हैं और योजना सेतु की प्राथमिक सपोर्ट टीम द्वारा समीक्षा की जाती है। लॉगिन उपयोगकर्ताओं को सबमिशन पर स्वचालित ईमेल पुष्टि और टीम के उत्तर पर सूचना मिलती है। स्थिति — Open → In Progress → Resolved — ऐप में वास्तविक समय में दिखाई देती है।",

    legalTitle: "कानूनी एवं अस्वीकरण",
    legalPoints: [
      "योजना सेतु सरकारी योजना खोज के लिए एक स्वतंत्र डिजिटल प्लेटफ़ॉर्म है और किसी भी केंद्र या राज्य सरकार निकाय या मंत्रालय से संबद्ध, अनुमोदित या प्रतिनिधि नहीं है।",
      "सभी योजना डेटा सार्वजनिक रूप से उपलब्ध आधिकारिक सरकारी पोर्टलों से प्राप्त किया गया है। सटीकता के प्रयास के बावजूद, उपयोगकर्ताओं को आवेदन से पूर्व संबंधित सरकारी स्रोतों से विवरण सत्यापित करने की सलाह दी जाती है।",
      "योजना सेतु सीधे आवेदन, वित्तीय लेनदेन या दस्तावेज़ प्रसंस्करण की सुविधा नहीं देता। यह प्लेटफ़ॉर्म केवल सूचना और खोज सेवा के रूप में कार्य करता है।",
    ],

    techTitle: "प्रौद्योगिकी और अवसंरचना",
    techBody:  "योजना सेतु एक आधुनिक, सुरक्षित और स्केलेबल तकनीकी स्टैक पर निर्मित है।",
    techStack: [
      { icon:"🔥", name:"Firebase",  role:"प्रमाणीकरण, क्लाउड डेटाबेस और रियल-टाइम सिंक" },
      { icon:"⚡", name:"Groq AI",   role:"AI सहायक — हाई-स्पीड इनफेरेंस इंजन" },
      { icon:"📧", name:"EmailJS",   role:"स्वचालित ईमेल पुष्टि और अलर्ट" },
    ],

    privacyTitle: "गोपनीयता और डेटा",
    privacyBody:
      "उपयोगकर्ता डेटा को सख्त गोपनीयता के साथ संभाला जाता है। प्रोफाइल जानकारी केवल इन-ऐप अनुभव को वैयक्तिकृत करने के लिए उपयोग की जाती है और इसे कभी बेचा, साझा या तीसरे पक्ष को प्रकट नहीं किया जाता।",

    devTitle:   "डेवलपर के बारे में",
    devBody:    "योजना सेतु को Sahnawaz द्वारा — एक स्वतंत्र डेवलपर जो भारत के प्रत्येक नागरिक तक सरकारी कल्याण को सुलभ बनाने की दृष्टि रखते हैं — डिज़ाइन, विकसित और अनुरक्षित किया गया है।",
    devWebsite: "https://sahnawaz-portfolio.vercel.app",
    devLink:    "आधिकारिक वेबसाइट देखें →",

    contactTitle: "आधिकारिक संपर्क",
    contactEmail: "yojanasetuofficial@gmail.com",
    contactNote:  "केवल प्लेटफ़ॉर्म संबंधी पूछताछ के लिए। योजना-विशिष्ट सहायता के लिए इन-ऐप Report & Query सुविधा का उपयोग करें।",

    copyright:  "© 2025 योजना सेतु। सर्वाधिकार सुरक्षित।",
    footerNote: "एक स्वतंत्र नागरिक प्रौद्योगिकी प्लेटफ़ॉर्म · भारत",
  },
};

// ─── ASHOKA CHAKRA (24 spokes — same as App.jsx) ──────────────────────────────
function AshokaChakra({ size = 18, color = ASHOKA_BLUE, spinning = false }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i);
  const cx = size / 2, cy = size / 2, r = size / 2 - 1, innerR = r * 0.28;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, animation: spinning ? "about-chakra-spin 10s linear infinite" : "none" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.055} />
      <circle cx={cx} cy={cy} r={innerR} fill={color} />
      {spokes.map(i => {
        const a = (i * 360 / 24) * Math.PI / 180;
        return (
          <line key={i}
            x1={cx + innerR * Math.cos(a)} y1={cy + innerR * Math.sin(a)}
            x2={cx + r * 0.78 * Math.cos(a)} y2={cy + r * 0.78 * Math.sin(a)}
            stroke={color} strokeWidth={size * 0.042} />
        );
      })}
    </svg>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ title, accent = NAVY, dark, bf }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 3, height: 18, borderRadius: 3, background: accent, flexShrink: 0 }} />
      <div style={{ fontSize: 13, fontWeight: 800, color: th.text, letterSpacing: 0.2, fontFamily: bf }}>
        {title}
      </div>
    </div>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
function Divider({ dark }) {
  const th = THEME[dark ? "dark" : "light"];
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(to right, transparent, ${th.border2}, transparent)`,
      margin: "4px 0",
    }} />
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AboutTab({ lang = "en", dark = false }) {
  const th = THEME[dark ? "dark" : "light"];
  const s  = STRINGS[lang] || STRINGS.en;
  const bf = fontFamily(lang);
  const isHindi = lang === "hi";

  const KEYFRAMES = `
    @keyframes about-chakra-spin {
      from { transform-origin: center; transform: rotate(0deg); }
      to   { transform-origin: center; transform: rotate(360deg); }
    }
    @keyframes about-fade-up {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes about-shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .about-link:hover { opacity: 0.78; }
    .about-card-hover:active { transform: scale(0.985); }
  `;

  return (
    <div style={{
      background: th.appBg,
      minHeight: "100%",
      fontFamily: bf,
      overflowX: "hidden",
    }}>
      <style>{KEYFRAMES}</style>

      {/* ══════════════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(160deg, ${NAVY} 0%, #05256E 45%, #0a1f5c 70%, #001a40 100%)`,
        padding: "36px 22px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decorative circles */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,153,51,0.07)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: -40,
          width: 150, height: 150, borderRadius: "50%",
          background: "rgba(19,136,8,0.06)", pointerEvents: "none",
        }} />

        {/* Top row — Chakra + Made in India */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <AshokaChakra size={38} color="rgba(255,255,255,0.18)" spinning />
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: 20, padding: "4px 12px",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 0.4 }}>
              {s.madeInIndia}
            </span>
          </div>
        </div>

        {/* App identity */}
        <div style={{ animation: "about-fade-up 0.5s ease-out" }}>
          {/* App icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: "linear-gradient(135deg, rgba(255,153,51,0.22), rgba(255,255,255,0.10))",
            border: "1.5px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 34, marginBottom: 18,
            boxShadow: "0 8px 32px rgba(0,0,0,0.30)",
          }}>
            🏛️
          </div>

          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: -0.3, lineHeight: 1.15, marginBottom: 6, fontFamily: bf }}>
            {s.appName}
          </div>

          {/* Tricolour underline */}
          <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
            <div style={{ height: 3, width: 32, borderRadius: 3, background: SAFFRON }} />
            <div style={{ height: 3, width: 14, borderRadius: 3, background: "#fff" }} />
            <div style={{ height: 3, width: 32, borderRadius: 3, background: IND_GREEN }} />
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.72)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 18, fontFamily: bf }}>
            {s.tagline}
          </div>

          {/* Version badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.09)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 8, padding: "5px 12px",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: 0.3 }}>
              {s.version}
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONTENT BODY
      ══════════════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 16px 40px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── MISSION ──────────────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${th.border}`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <SectionHeader title={s.missionTitle} accent={NAVY} dark={dark} bf={bf} />
          <div style={{ fontSize: 13, color: th.textMid, lineHeight: 1.75, fontFamily: bf }}>
            {s.missionBody}
          </div>
        </div>

        {/* ── STATS ROW ─────────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg, ${NAVY}f0, #05256E)`,
          borderRadius: 18,
          padding: "20px 16px",
          boxShadow: "0 6px 24px rgba(0,53,128,0.28)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 16, fontFamily: bf }}>
            {s.statsTitle}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {s.stats.map((stat, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: i === 0 ? SAFFRON : i === 1 ? "#4ade80" : i === 2 ? "#60a5fa" : "#f0f0f0", lineHeight: 1.1, fontFamily: bf }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", marginTop: 5, lineHeight: 1.4, fontFamily: bf, whiteSpace: "pre-line" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SCHEME DATABASE ───────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${IND_GREEN}28`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(19,136,8,0.06)",
        }}>
          <SectionHeader title={s.dbTitle} accent={IND_GREEN} dark={dark} bf={bf} />
          <div style={{ fontSize: 13, color: th.textMid, lineHeight: 1.75, fontFamily: bf }}>
            {s.dbBody}
          </div>
          {/* Expanding indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 14,
            background: dark ? "rgba(19,136,8,0.12)" : "rgba(19,136,8,0.06)",
            border: `1px solid ${IND_GREEN}30`,
            borderRadius: 10, padding: "9px 13px",
          }}>
            <div style={{ fontSize: 13 }}>🔄</div>
            <div style={{ fontSize: 11, color: IND_GREEN, fontWeight: 700, fontFamily: bf }}>
              {isHindi
                ? "डेटाबेस सक्रिय रूप से विस्तारित हो रहा है · टीम नियमित रूप से अपडेट करती है"
                : "Database actively expanding · Team regularly curates & updates"}
            </div>
          </div>
        </div>

        {/* ── CORE CAPABILITIES ─────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${th.border}`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <SectionHeader title={s.featuresTitle} accent={SAFFRON} dark={dark} bf={bf} />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {s.features.map((f, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: 1, background: th.divider, margin: "13px 0" }} />}
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                    background: `${f.color}14`,
                    border: `1.5px solid ${f.color}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: th.text, marginBottom: 4, fontFamily: bf }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.65, fontFamily: bf }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI ASSISTANT ──────────────────────────────────────────── */}
        <div style={{
          background: dark
            ? "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(0,53,128,0.18))"
            : "linear-gradient(135deg, rgba(139,92,246,0.05), rgba(0,53,128,0.04))",
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid rgba(139,92,246,0.25)`,
          boxShadow: dark ? "none" : "0 2px 16px rgba(139,92,246,0.07)",
        }}>
          {/* AI section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
            }}>🤖</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: th.text, fontFamily: bf }}>{s.aiTitle}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#8B5CF6", letterSpacing: 0.5, marginTop: 2, fontFamily: bf }}>
                {s.aiSubtitle}
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(139,92,246,0.18)", margin: "14px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {s.aiPoints.map((pt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "rgba(139,92,246,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13,
                }}>
                  {pt.icon}
                </div>
                <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.6, fontFamily: bf, paddingTop: 5 }}>
                  {pt.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SIGN IN BENEFITS ──────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${SAFFRON}22`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(255,153,51,0.06)",
        }}>
          <SectionHeader title={s.signInTitle} accent={SAFFRON} dark={dark} bf={bf} />
          <div style={{ fontSize: 12, color: th.textSub, marginBottom: 14, fontFamily: bf }}>{s.signInSub}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {s.signInPoints.map((pt, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: 1, background: th.divider, margin: "12px 0" }} />}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: `${SAFFRON}12`, border: `1px solid ${SAFFRON}28`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                  }}>
                    {pt.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: th.text, marginBottom: 3, fontFamily: bf }}>{pt.title}</div>
                    <div style={{ fontSize: 11, color: th.textMid, lineHeight: 1.6, fontFamily: bf }}>{pt.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── REPORT & RESOLUTION ───────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${th.border}`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <SectionHeader title={s.reportTitle} accent={IND_GREEN} dark={dark} bf={bf} />
          <div style={{ fontSize: 11, fontWeight: 700, color: IND_GREEN, marginBottom: 10, letterSpacing: 0.3, fontFamily: bf }}>
            {s.reportSubtitle}
          </div>
          <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.7, marginBottom: 16, fontFamily: bf }}>
            {s.reportBody}
          </div>

          {/* 2×2 Report types grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {s.reportTypes.map((rt, i) => (
              <div key={i} style={{
                background: dark ? `${rt.color}14` : `${rt.color}08`,
                border: `1.5px solid ${rt.color}28`,
                borderRadius: 14, padding: "12px 11px",
              }}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>{rt.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: rt.color, marginBottom: 4, lineHeight: 1.3, fontFamily: bf }}>
                  {rt.label}
                </div>
                <div style={{ fontSize: 10, color: th.textSub, lineHeight: 1.5, fontFamily: bf }}>
                  {rt.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Flow note */}
          <div style={{
            background: dark ? "rgba(19,136,8,0.10)" : "rgba(19,136,8,0.05)",
            border: `1px solid ${IND_GREEN}28`,
            borderRadius: 12, padding: "12px 14px",
          }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ fontSize: 14, flexShrink: 0, paddingTop: 1 }}>📌</div>
              <div style={{ fontSize: 11, color: th.textMid, lineHeight: 1.7, fontFamily: bf }}>
                {s.reportFlow}
              </div>
            </div>
          </div>
        </div>

        {/* ── LEGAL & DISCLAIMER ────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${th.border}`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <SectionHeader title={s.legalTitle} accent="#DC2626" dark={dark} bf={bf} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {s.legalPoints.map((pt, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  background: "rgba(220,38,38,0.10)", border: "1px solid rgba(220,38,38,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "#DC2626", marginTop: 1,
                }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 11, color: th.textMid, lineHeight: 1.7, fontFamily: bf }}>{pt}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TECHNOLOGY ────────────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${th.border}`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <SectionHeader title={s.techTitle} accent={ASHOKA_BLUE} dark={dark} bf={bf} />
          <div style={{ fontSize: 12, color: th.textSub, marginBottom: 14, lineHeight: 1.6, fontFamily: bf }}>
            {s.techBody}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {s.techStack.map((t, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: 1, background: th.divider, margin: "11px 0" }} />}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f8",
                    border: `1px solid ${th.border2}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: th.text, fontFamily: bf }}>{t.name}</div>
                    <div style={{ fontSize: 10, color: th.textSub, marginTop: 2, fontFamily: bf }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRIVACY ───────────────────────────────────────────────── */}
        <div style={{
          background: dark ? "rgba(0,53,128,0.14)" : "rgba(0,53,128,0.04)",
          borderRadius: 18,
          padding: "16px 18px",
          border: `1.5px solid ${NAVY}22`,
        }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ fontSize: 18, flexShrink: 0, paddingTop: 1 }}>🔒</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: th.text, marginBottom: 5, fontFamily: bf }}>
                {s.privacyTitle}
              </div>
              <div style={{ fontSize: 11, color: th.textMid, lineHeight: 1.7, fontFamily: bf }}>
                {s.privacyBody}
              </div>
            </div>
          </div>
        </div>

        {/* ── DEVELOPER ─────────────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${th.border}`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <SectionHeader title={s.devTitle} accent={NAVY} dark={dark} bf={bf} />
          <div style={{ fontSize: 12, color: th.textMid, lineHeight: 1.75, marginBottom: 16, fontFamily: bf }}>
            {s.devBody}
          </div>
          {/* Website link */}
          <div
            className="about-link"
            onClick={() => window.open(s.devWebsite, "_blank")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: `linear-gradient(135deg, ${NAVY}, #1a3a8a)`,
              borderRadius: 13, padding: "13px 16px",
              cursor: "pointer", transition: "opacity 0.18s",
              boxShadow: "0 6px 20px rgba(0,53,128,0.28)",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              }}>🌐</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: bf }}>{s.devLink}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", marginTop: 2, fontFamily: bf }}>
                  sahnawaz-portfolio.vercel.app
                </div>
              </div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>›</div>
          </div>
        </div>

        {/* ── OFFICIAL CONTACT ──────────────────────────────────────── */}
        <div style={{
          background: th.card,
          borderRadius: 18,
          padding: "20px 18px",
          border: `1.5px solid ${th.border}`,
          boxShadow: dark ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        }}>
          <SectionHeader title={s.contactTitle} accent={SAFFRON} dark={dark} bf={bf} />
          {/* Email row */}
          <div
            className="about-link"
            onClick={() => window.open(`mailto:${s.contactEmail}`, "_blank")}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: dark ? "rgba(255,153,51,0.10)" : "rgba(255,153,51,0.06)",
              border: `1.5px solid ${SAFFRON}30`,
              borderRadius: 13, padding: "13px 14px", cursor: "pointer",
              marginBottom: 12, transition: "opacity 0.18s",
            }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: `${SAFFRON}18`, border: `1.5px solid ${SAFFRON}28`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>📧</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: SAFFRON,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: bf,
              }}>
                {s.contactEmail}
              </div>
              <div style={{ fontSize: 10, color: th.textSub, marginTop: 2, fontFamily: bf }}>
                {isHindi ? "आधिकारिक ईमेल पता" : "Official Email Address"}
              </div>
            </div>
            <div style={{ color: th.textSub, fontSize: 14 }}>›</div>
          </div>
          <div style={{
            background: dark ? "rgba(255,255,255,0.04)" : "#fafafa",
            border: `1px solid ${th.border}`,
            borderRadius: 10, padding: "9px 12px",
          }}>
            <div style={{ fontSize: 10, color: th.textSub, lineHeight: 1.65, fontFamily: bf }}>
              ⚠️ {s.contactNote}
            </div>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────── */}
        <div style={{
          borderRadius: 18,
          padding: "22px 18px",
          background: `linear-gradient(160deg, ${NAVY}f5, #05256E)`,
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 12, textAlign: "center",
          boxShadow: "0 6px 24px rgba(0,53,128,0.25)",
        }}>
          {/* Tricolour stripe */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ height: 2, width: 24, borderRadius: 2, background: SAFFRON }} />
            <AshokaChakra size={20} color="rgba(255,255,255,0.45)" spinning />
            <div style={{ height: 2, width: 24, borderRadius: 2, background: IND_GREEN }} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.90)", letterSpacing: 0.4, fontFamily: bf }}>
            {s.copyright}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.42)", letterSpacing: 0.3, fontFamily: bf }}>
            {s.footerNote}
          </div>

          {/* Bottom tricolour bar */}
          <div style={{ display: "flex", width: "100%", height: 3, borderRadius: 3, overflow: "hidden", marginTop: 4 }}>
            <div style={{ flex: 1, background: SAFFRON }} />
            <div style={{ flex: 1, background: "#fff" }} />
            <div style={{ flex: 1, background: IND_GREEN }} />
          </div>
        </div>

      </div>
    </div>
  );
}
